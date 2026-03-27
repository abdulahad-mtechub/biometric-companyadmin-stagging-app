import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Svgs} from '@assets/Svgs/Svgs';
import AddDepartmentBottomSheet from '@components/BottomSheets/AddDepartmentBottomSheet';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import EmployeeCard from '@components/Cards/EmployeeCard';
import DepartmentCard from '@components/Cards/DepartmentCard';
import EmptyCard from '@components/Cards/EmptyCard';
import DashboardCard from '@components/Cards/DashboardCard';
import Loader from '@components/Loaders/loader';
import UpdateStatusBtmSheet from '@components/BottomSheets/UpdateStatusBtmSheet';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import SubscriptionAlertBanner from '@components/SubscriptionAlertBanner/SubscriptionAlertBanner';
import WorkerLimitAlert from '@components/WorkerLimitAlert/WorkerLimitAlert';
import {
  ApiResponse,
  capitalize,
  fetchApis,
  fetchFormDataApi,
  isConnected,
} from '@utils/Helpers';
import {
  getPendingActions,
  rebuildFormData,
  removePendingAction,
  savePendingAction,
} from '@utils/sqlite';
import PendingRequestCard from '@components/Cards/PendingRequestCard';
import EditAttendanceSettingsModal from '@components/Modals/EditAttendanceSettingsModal';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import {statusStyles} from '@constants/DummyData';
import {usePlanDetails} from '@utils/Hooks/Hooks';
import logger from '@utils/logger';
import WorkerFilterBtmSheet from '../../components/BottomSheets/WorkerFilterBtmSheet';
import { pxToPercentage } from '@utils/responsive';

const PAGINATION_LIMIT = 10;

const useApiData = () => {
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const resetPagination = useCallback(() => {
    setPage(1);
    setHasNext(false);
  }, []);

  return {
    apiData,
    setApiData,
    page,
    setPage,
    hasNext,
    setHasNext,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    refreshing,
    setRefreshing,
    resetPagination,
  };
};



const Worker = ({navigation, route}) => {
  const status = route?.params?.status || null;
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const {t} = useTranslation();
  const attendanceCounters = useSelector(
    state => state.states.attendanceCounters,
  );
  const {totalCount} =
        useSelector(store => store.messageSlice);
  const updateWorkerActiveStatusURL = id =>
    `${baseUrl}/company-admins/approve-worker/${id}`;
  const updateWorkerInactiveStatusURL = id =>
    `${baseUrl}/company-admins/reject-worker/${id}`;

  const [totalWorkers, setTotalWorkers] = useState(0);
  const {planDetails, loading: isLoadingPlan, refetch} = usePlanDetails();
  const [pendingActions, setPendingActions] = useState([]);
  const [filterState, setFilterState] = useState({
    startDate: null,
    endDate: null,
    status: null,
  });

  const {
    apiData,
    setApiData,
    page,
    setPage,
    hasNext,
    setHasNext,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    refreshing,
    setRefreshing,
    resetPagination,
  } = useApiData();

  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // State
  const [selectedTab, setSelectedTab] = useState('Employees');
  const [selectedDep, setSelectedDep] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isDepEdit, setIsDepEdit] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const deleteSheetRef = useRef(null);
  const filterBtmSheetRef = useRef(null);
  // Refs
  const addDepartmentBottomSheetRef = useRef(null);
  const selectorBottomSheetRef = useRef(null);
  const updateStatusBtmSheetRef = useRef(null);
  const [isConnectedState, setIsConnectedState] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [isAttendanceModalVisible, setIsAttendanceModalVisible] =
    useState(false);
  const [FilterApplied, setFilterApplied] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = useCallback(itemId => {
    setImageErrors(prev => ({...prev, [itemId]: true}));
  }, []);

  const checkConnectivity = async (showFeedback = true) => {
    try {
      const connected = await isConnected();
      setIsConnectedState(connected);

      if (!connected && showFeedback) {
        setShowOfflineMode(true);
      } else if (connected && showOfflineMode) {
        setShowOfflineMode(false);
      }

      return connected;
    } catch (error) {
      logger.error('Connectivity check failed:', error, {context: 'Worker'});
      setIsConnectedState(false);
      return false;
    }
  };

  // Plan details derived values

  const maxWorkers =
    planDetails?.subscription_status?.status === 'trial'
      ? 5
      : planDetails?.company_info?.max_employees_limit;
  const currentWorkersCount = planDetails?.company_info?.current_workers_count;
  const isAtWorkerLimit = currentWorkersCount >= maxWorkers;

  const statusArray = [
    {label: 'Active', value: 'active'},
    {label: 'Inactive', value: 'inactive'},
  ];

  const dropdownData = {
    statusOptions: statusArray,
  };

  const TAB_CONFIG = useMemo(
    () => ({
      Employees: {
        heading: t('Employee Name'),
        data: apiData,
        statusLabel: t('Status'),
        emptyText: t('No Employees Yet!'),
        emptyIcon: <Svgs.emptyUser />,
        endPoint: '/company-admins/workers',
        name: item => `${item.first_name} ${item.last_name}`,
        status: item => {
          if (item.status === 'email_pending') {
            return 'Pending';
          } else {
            return capitalize(item.status);
          }
        },
        onItemPress: item =>
          navigation.navigate(SCREENS.WORKERDETAILS, {
            status: item.status,
            item,
          }),
        onDeleteIconPress: async item => {
          setSelectedItem(item);
          const connected = await checkConnectivity(false);
          if (!connected) {
            showAlert(
              'Deleting requires internet connection. Please try again when online.',
              'error',
            );
            return;
          }

          setTimeout(() => {
            deleteSheetRef.current.open();
          }, 300);
        },
        onDeletePress: id => {
          deleteSheetRef.current.close();
          deleteWorker(id);
        },
        onEditPress: async item => {
          console.log(" item", item);

          const connected = await checkConnectivity(false);
          if (!connected) {
            showAlert(
              'Updating Status requires internet connection. Please try again when online.',
              'error',
            );
            return;
          }
          navigation.navigate(SCREENS.EDITWORKER, {workerData: item});
        },
        onMessagePress: item => {
          navigation.navigate(SCREENS.CONVERSATION, {
            id: null,
            name: `${item?.first_name || ''} ${item?.middle_name || ''} ${
              item?.last_name || ''
            }`.trim(),
            avatar: item?.profile_image,
            other_user_id: item?.id,
          });
        },
        onBtnPress: item => {
          setSelectedItem(item);
          selectorBottomSheetRef.current?.open();
        },
        deleteBtmSheetHeading: t('Delete Employee'),
        deleteBtmSheetSubHeading: t(
          'Are you sure you want to delete employee?',
        ),
        searchPlaceHolder: t('Search by Employee Name'),
      },
      Departments: {
        heading: t('Department Name'),
        data: apiData,
        name: item => item.name,
        statusLabel: t('Status'),
        emptyText: t('No Departments Yet!'),
        emptyIcon: <Svgs.emptyUser />,
        endPoint: '/departments',
        status: item => (item?.is_active ? 'Active' : 'Inactive'),
        onItemPress: item =>
          navigation.navigate(SCREENS.DEPARTMENTDETAILS, {item: item}),
        onDeleteIconPress: async item => {
          const connected = await checkConnectivity(false);
          if (!connected) {
            showAlert(
              'Deleting requires internet connection. Please try again when online.',
              'error',
            );
            return;
          }
          setSelectedItem(item);

          setTimeout(() => {
            deleteSheetRef.current.open();
          }, 300);
        },
        onDeletePress: id => {
          deleteSheetRef.current.close();
          deleteDepartment(id);
        },
        onEditPress: async item => {
          const connected = await checkConnectivity(false);
          if (!connected) {
            showAlert(
              'Updating Status requires internet connection. Please try again when online.',
              'error',
            );
            return;
          }
          handleDepartmentPress(item);
        },
        onBtnPress: item => {
          setSelectedItem(item);
          selectorBottomSheetRef.current?.open();
        },
        deleteBtmSheetHeading: t('Delete Department'),
        deleteBtmSheetSubHeading: t(
          'Are you sure you want to delete department?',
        ),
        searchPlaceHolder: t('Search by department name'),
      },
    }),
    [
      t,
      apiData,
      isDarkMode,
      navigation,
      showAlert,
      selectorBottomSheetRef,
      updateStatusBtmSheetRef,
    ],
  );
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  const updateWorkerStatus = useCallback(
    async (id, newStatus) => {
      setIsStatusLoading(true);

      try {
        const isActive = newStatus === 'active';

        const {ok, data} = await fetchApis(
          isActive
            ? updateWorkerActiveStatusURL(id)
            : updateWorkerInactiveStatusURL(id),
          'PUT',
          null,
          null,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
          },
        );

       
        if (!ok || data?.error) {
          logger.log('error', data, {context: 'Worker'});

          ApiResponse(showAlert, data, language);
          return;
        }

        setApiData(prevData =>
          prevData.map(item =>
            item.id === id ? {...item, status: newStatus} : item,
          ),
        );

        ApiResponse(showAlert, data, language);
      } catch (error) {
        logger.log('error', error, {context: 'Worker'});
        showAlert('Something went wrong.', 'error');
      } finally {
        setIsStatusLoading(false);
      }
    },
    [token, showAlert, language, setApiData],
  );

  const currentTabConfig = TAB_CONFIG[selectedTab];

  const buildApiUrl = useCallback(
    (pageNumber, endPoint, status, selectedTab) => {
      let url = `${baseUrl}${endPoint}?page=${pageNumber}&limit=${PAGINATION_LIMIT}&sortBy=created_at&sortOrder=desc`;

      if (status) {
        const statusParam = 'status';
        const statusValue = status;
        url += `&${statusParam}=${statusValue}`;
      }
      if (selectedTab === 'Employees') {
        if (filterState.department_id)
          url += `&department_id=${filterState.department_id}`;
        if (filterState.shift) url += `&shift=${filterState.shift}`;
        if (filterState.salary) url += `&salary=${filterState.salary}`;
        if (filterState.work_hours)
          url += `&work_hours=${filterState.work_hours}`;
      }

      if (selectedTab === 'Departments') {
        // Only include inactive departments if status is NOT 'active'
        if (filterState.status !== 'active') {
          url += `&includeInactive=true`;
        }
        if (filterState.startDate) url += `&startDate=${filterState.startDate}`;
        if (filterState.endDate) url += `&endDate=${filterState.endDate}`;
      }
      if (showSearch && searchText.trim())
        url += `&search=${encodeURIComponent(searchText.trim())}`;

      console.log({url})
      return url;
    },
    [
      selectedTab,
      filterState.startDate,
      filterState.endDate,
      filterState.department_id,
      filterState.shift,
      filterState.salary,
      filterState.work_hours,
      showSearch,
      searchText,
      filterState,
    ],
  );

  // ✅ Replace extractApiData
  const extractApiData = useCallback((apiData, selectedTab) => {
    if (selectedTab === 'Employees') {
      // Adjusted for new response
      return apiData?.data?.workers || [];
    }
    if (selectedTab === 'Departments') {
      return apiData?.data?.departments || [];
    }
    return [];
  }, []);

  // Event handlers
  const handleDepartmentPress = useCallback(async item => {
    const connected = await checkConnectivity();
    if (!connected) {
      showAlert(
        'Editing requires internet connection. Please try again when online.',
        'error',
      );
      return;
    }

    setSelectedDep(item);
    setIsDepEdit(true);
    addDepartmentBottomSheetRef.current?.open();
  }, []);

  const handleTabChange = useCallback(
    tab => {
      if (tab !== selectedTab) {
        console.log({tab});
        setSelectedTab(tab);
        setApiData([]);
        // Don't call resetPagination and handleReset here to avoid circular dependency
        // They will be called by the effect when selectedTab changes
      }
    },
    [selectedTab],
  );

  const onStatusChangePress = value => {
    if (value === 'active') {
      // logger.log(item.attendanceSettings, value, 'item,value', { context: 'Worker' });
      updateStatusBtmSheetRef.current?.close();
      setTimeout(() => {
        setIsAttendanceModalVisible(true);
      }, 300);
    } else {
      updateWorkerStatus(selectedItem?.id, value);
      fetchData(true, true);
    }
  };

  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => {
      // If we're closing search, clear the text
      if (prev) {
        setSearchText('');
        setIsSearchFocused(false);
      } else {
        // If we're opening search, set focus state
        setIsSearchFocused(true);
      }
      return !prev;
    });
  }, []);

  const handleReset = useCallback(async () => {
    setSearchText('');
    setShowSearch(false);
    setIsSearchFocused(false);
    setPage(1);
    setHasNext(false);
    // Don't call fetchData to avoid circular dependency with the useEffect
  }, []);

  const handleAddPress = useCallback(() => {
    if (selectedTab === 'Employees') {
      if (false) {
      // if (isAtWorkerLimit) {
        showAlert(
          `Employee limit reached. Please upgrade your plan to add more employees.`,
          'error',
        );
      } else {
        navigation.navigate(SCREENS.ADDWORKER);
      }
      
    } else {
      setIsDepEdit(false);
      addDepartmentBottomSheetRef.current?.open();
    }
  }, [selectedTab, isAtWorkerLimit, totalWorkers, maxWorkers, showAlert]);

  const fetchData = useCallback(
    async (reset = false, noLoading = false) => {
      const connected = await checkConnectivity(false);
      if (!connected) {
        return;
      }
      if (isLoading || (!reset && !hasNext)) return;

      if (!noLoading) {
        const loadingState = reset ? setIsLoading : setIsLoadingMore;
        loadingState(true);
      }

      try {
        const url = buildApiUrl(
          reset ? 1 : page,
          currentTabConfig.endPoint,
          filterState.status,
          selectedTab,
        );

        const {ok, data: responseData} = await fetchApis(
          url,
          'GET',
          null,
          null,
          showAlert,
          {Authorization: `Bearer ${token}`},
        );

        if (!ok || responseData?.error) {
          ApiResponse(showAlert, data, language);
          return;
        }

        const fetchedData = extractApiData(responseData, selectedTab);

        const total = responseData?.data?.pagination?.total || 0;

        setTotalWorkers(total);
        setApiData(prevData =>
          reset ? fetchedData : [...prevData, ...fetchedData],
        );
        setHasNext(responseData?.data?.pagination?.has_next || false);
        setPage(reset ? 2 : page + 1);
      } catch (error) {
        logger.error('Fetch error:', error, {context: 'Worker'});
        showAlert('Something went wrong.', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      isLoading,
      hasNext,
      buildApiUrl,
      page,
      currentTabConfig.endPoint,
      token,
      extractApiData,
      selectedTab,
      setApiData,
      setHasNext,
      setPage,
      setIsLoading,
      setIsLoadingMore,
      searchText,
    ],
  );

  const formatCardData = useCallback(() => {
    const cards = [
      {
        title: 'Pending Employee Registrations',
        value: attendanceCounters?.pendingEmployeeRegistration || '0',
      },
      {
        title: 'Active Employee Registrations',
        value: attendanceCounters?.activeEmployeeRegistration || '0',
      },
      {
        title: 'Employee Present Today',
        value: attendanceCounters?.employeePresentToday || '0',
      },
      {
        title: 'Employee Arriving on Time',
        value: attendanceCounters?.employeeArrivingOnTime || '0',
      },
      {
        title: 'Employee Arriving Late',
        value: attendanceCounters?.employeeArrivingLate || '0',
      },
      {
        title: 'Absent Employees',
        value: attendanceCounters?.employeeAbsent || '0',
      },
      {
        title: 'Pending Tasks',
        value: attendanceCounters?.pendingTask || '0',
      },
      {
        title: 'Pending Requests',
        value: attendanceCounters?.pendingRequests || '0',
      },
      {
        title: 'Pending Received Documents',
        value: attendanceCounters?.pendingReceivedDocuments || '0',
      },
      {
        title: 'Pending Reimbursement Requests',
        value: attendanceCounters?.pendingReimbursementRequests || '0',
      },
    ];
    return cards;
  }, [attendanceCounters]);

  const DashboardSection = useCallback(({data, isDarkMode, Colors}) => {
    const styles = useMemo(
      () => dynamicStyles(isDarkMode, Colors),
      [isDarkMode, Colors],
    );

    const renderDashboardItem = useCallback(
      ({item}) => (
        <View style={styles.dashboardItemWrapper}>
          <DashboardCard title={item.title || ''} value={item.value || '0'} />
        </View>
      ),
      [styles],
    );

    if (!data || data.length === 0) return null;

    return (
      <View style={styles.dashboardSection}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dashboardListContainer}
          renderItem={renderDashboardItem}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      </View>
    );
  }, []);

  const updateDepartmentStatus = useCallback(
    async (id, newStatus, name = null) => {
      setIsDepEdit(false);
      setIsStatusLoading(true);

      try {
        const isActive = newStatus === 'active' || newStatus === true;
        const payload = name
          ? {name, is_active: isActive}
          : {is_active: isActive};

        const {ok, data} = await fetchApis(
          `${baseUrl}/departments/${id}`,
          'PUT',
          null,
          payload,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );
        ApiResponse(showAlert, data, language);

        if (!ok || data?.error) {
          return;
        }

        addDepartmentBottomSheetRef.current?.close();

        // Update local state
        setApiData(prevData =>
          prevData.map(item =>
            item.id === id
              ? {...item, ...(name && {name}), is_active: isActive}
              : item,
          ),
        );
      } catch (error) {
        logger.error('Update error:', error, {context: 'Worker'});
        showAlert('An error occurred while updating.', 'error');
      } finally {
        setIsStatusLoading(false);
        setIsDepEdit(false);
      }
    },
    [showAlert, token, setApiData],
  );

  const addDepartment = useCallback(
    async name => {
      try {
        const payload = {name};
        if (!isConnectedState) {
          const result = await savePendingAction('CREATE_DEPARTMENT', {
            url: `${baseUrl}/departments`,
            data: payload,
            token,
            type: 'department',
          });

          logger.log(JSON.stringify(payload, null, 2), {context: 'Worker'});

          if (result?.rowsAffected > 0 || result?.insertId) {
            showAlert(
              'You are offline. The request has been queued and will sync automatically.',
              'success',
            );

            gettPendingActions('CREATE_DEPARTMENT');
          } else {
            showAlert(
              'Could not save offline request. Please try again.',
              'error',
            );
          }
        } else {
          const {ok, data} = await fetchApis(
            `${baseUrl}/departments`,
            'POST',
            setIsStatusLoading,
            payload,
            showAlert,
            {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          );
          ApiResponse(showAlert, data, language);

          if (!ok || data?.error) {
            return;
          }

          setApiData(prevData => [...prevData, data?.data?.department]);
          fetchData(true);
        }
      } catch (error) {
        logger.error('Add error:', error, {context: 'Worker'});
        showAlert('An error occurred while adding department.', 'error');
      }
    },
    [showAlert, token, setApiData, fetchData],
  );

  const deleteDepartment = useCallback(async id => {
    deleteSheetRef.current?.close();
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/departments/${id}`,
        'DELETE',
        setIsStatusLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );
      ApiResponse(showAlert, data, language);
      if (!ok || data?.error) {
        return;
      }

      setApiData(prevData => prevData.filter(item => item.id !== id));

      // Update local state
    } catch (error) {
      logger.error('Update error:', error, {context: 'Worker'});
      showAlert('An error occurred while updating.', 'error');
    } finally {
      setSelectedItem(null);
      setIsStatusLoading(false);
    }
  }, []);

  const deleteWorker = useCallback(async id => {
    deleteSheetRef.current?.close();
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/admin/workers/${id}`,
        'DELETE',
        setIsStatusLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );
      logger.log(`${baseUrl}/company-admins/workers/${id}`, {
        context: 'Worker',
      });

      ApiResponse(showAlert, data, language);

      if (!ok || data?.error) {
        showAlert(data?.message || 'Something went wrong.', 'error');
        return;
      }

      // logger.log(data)
      setTotalWorkers(prev => prev - 1);

      setApiData(prevData => prevData.filter(item => item.id !== id));

      // Update local state
    } catch (error) {
      logger.error('Update error:', error, {context: 'Worker'});
      showAlert('An error occurred while updating.', 'error');
    } finally {
      setSelectedItem(null);
      setIsStatusLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true);
    refetch();
    setRefreshing(false);
    if (selectedTab === 'Employees') {
      const {yes, data} = await fetchApis(
        `${baseUrl}/company-admins/workers`,
        'GET',
        null,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );
      if (yes) {
        const total = data?.data?.pagination?.total || 0;
        setTotalWorkers(total);
      }
    }
  }, [fetchData]);

  const loadMoreData = useCallback(() => {
    if (hasNext && !isLoadingMore && !isLoading) {
      fetchData(false);
    }
  }, [hasNext, isLoadingMore, isLoading, fetchData]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      resetPagination();
      handleReset();
      fetchData(true);
      refetch();
      gettPendingActions(
        selectedTab === 'Employees' ? 'CREATE_WORKER' : 'CREATE_DEPARTMENT',
      );
    }, [selectedTab, filterState, resetPagination, handleReset]),
  );

  const handleSearch = () => {
    fetchData(true);
    // Keyboard.dismiss(); // Remove this line to keep keyboard open
  };

  // Render functions
  const renderListHeader = useCallback(
    () => (
      <View style={{marginHorizontal: wp(0)}}>
       


        {/* Subscription Alert Banner */}
        <SubscriptionAlertBanner
          onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
        />

        {/* Worker Limit Alert */}
        <WorkerLimitAlert
          planDetails={planDetails}
          totalWorkers={totalWorkers}
          onUpgradePress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
        />

        {/* Map Section - Only for Employees */}
        {selectedTab === 'Employees' &&
          (isLoading ? (
            <View
              style={[
                styles.mapImage,
                {justifyContent: 'center', alignItems: 'center'},
              ]}>
              <Loader size={wp(10)} />
            </View>
          ) : (
            <View style={{flex: 1}}>
              <LeafLetMapComponent
                initialZoom={1}
                markers={apiData
                  .filter(item => item.latitude && item.longitude) // only items with lat/lng
                  .map(item => ({
                    title: `${item.first_name} ${item.last_name}`,
                    popup: item.email,
                    status: item.status,
                    color:
                      statusStyles[capitalize(item.status)]?.backgroundColor ||
                      '#ccc', // fallback
                    lat: parseFloat(item.latitude),
                    lng: parseFloat(item.longitude),
                  }))}
                showSearch={false}
                style={styles.mapImage}
                height={1}
                shouldShowInitialMarker={false}
              />
              <Text style={styles.mapText}>
                {t('Only records with valid Latitude/Longitude are shown')}
              </Text>
            </View>
          ))}

        {/* Dashboard Section - Only for Employees */}
        {selectedTab === 'Employees' && (
          <DashboardSection
            data={formatCardData()}
            isDarkMode={isDarkMode}
            Colors={Colors}
          />
        )}

        {/* Tab Selector */}
        <TabSelector
          tabs={Object.keys(TAB_CONFIG)}
          selectedTab={selectedTab}
          onTabPress={handleTabChange}
        />

 
        {/* Pending Requests */}
        {pendingActions.length > 0 && (
          <View style={styles.pendingRequestMainContainer}>
            <View style={{flexDirection: 'row', gap: wp(2)}}>
              <Text style={styles.headingText}>{t('Pending Requests')}</Text>
              {isPendingLoading && <Loader />}
              {!isConnectedState && (
                <Text style={styles.offlineIndicator}>({t('Offline')})</Text>
              )}
            </View>
            {pendingActions.map((item, index) => (
              <PendingRequestCard
                type={item.data.type}
                data={item.data.data}
                key={index}
                onCancelPress={() => handleCancelPendingAction(item.id)}
                onSyncPress={() =>
                  handleSyncPendingAction(
                    item,
                    item.data.type === 'worker'
                      ? 'CREATE_WORKER'
                      : 'CREATE_DEPARTMENT',
                  )
                }
                disabled={!isConnectedState} // Disable sync when offline
              />
            ))}
          </View>
        )}

        {/* Worker Status Headers */}
        {/* <View style={styles.workerStatusContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.headingText}>{currentTabConfig.heading}</Text>
            {isStatusLoading && <Loader />}
          </View>
          <Text style={styles.headingText}>{currentTabConfig.statusLabel}</Text>
        </View> */}
      </View>
    ),
    [
      selectedTab,
      isLoading,
      apiData,
      isDarkMode,
      FilterApplied,
      showSearch,
      currentTabConfig.searchPlaceHolder,
      currentTabConfig.heading,
      currentTabConfig.statusLabel,
      pendingActions,
      isPendingLoading,
      isConnectedState,
      t,
      filterBtmSheetRef,
      clearFilters,
      handleSearchToggle,
      planDetails,
      totalWorkers,
      formatCardData,
      DashboardSection,
      handleTabChange,
      setSearchText,
      handleSearch,
      handleReset,
      setIsSearchFocused,
      handleCancelPendingAction,
      handleSyncPendingAction,
      isStatusLoading,
      styles,
      Colors,
      statusStyles,
      capitalize,
      navigation,
      Svgs,
    ],
  );

  const renderListItem = useCallback(
    ({item}) => {
      if (selectedTab === 'Employees') {
        return (
          <EmployeeCard
            item={item}
            onPress={() => currentTabConfig.onItemPress(item)}
            onMessagePress={() => currentTabConfig.onMessagePress(item)}
            onBtnPress={() => {
              // For now, we'll show edit and delete actions directly
              // You can replace this with a menu bottom sheet if needed
              currentTabConfig.onBtnPress(item);
            }}
            onDeletePress={() => currentTabConfig.onDeleteIconPress(item)}
            onImageError={handleImageError}
            imageErrors={imageErrors}
            containerStyle={{marginHorizontal: hp(2)}}
          />
        );
      } else {
        return (
          <DepartmentCard
            item={item}
            onPress={() => currentTabConfig.onItemPress(item)}
            onBtnPress={() => {
              // For now, we'll show edit and delete actions directly
              currentTabConfig.onBtnPress(item);
            }}
            onDeletePress={() => currentTabConfig.onDeleteIconPress(item)}
            containerStyle={{marginHorizontal: hp(2)}}
          />
        );
      }
    },
    [selectedTab, currentTabConfig],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyCard
        icon={<Svgs.emptyUser height={hp(10)} width={hp(10)} />}
        heading="Empty!"
        subheading={currentTabConfig.emptyText}
        containerStyle={styles.emptyCardContainer}
      />
    ),
    [currentTabConfig],
  );

  const renderFooter = useCallback(
    () => (isLoadingMore ? <Loader size={wp(10)} /> : null),
    [isLoadingMore],
  );

  const gettPendingActions = async (actionType = 'CREATE_WORKER') => {
    try {
      const pending = await getPendingActions(actionType);

      // Collect id + formData in one array
      const formDataArray = pending?.map(action => {
        const formData = JSON.parse(action.data);
        return {
          id: action.id,
          data: formData,
        };
      });

      setPendingActions(formDataArray || []);
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {context: 'Worker'});
    }
  };

  const renderOfflineBanner = () => {
    if (isConnectedState) return null;

    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>
          {t('You are offline. Please check your internet connection.')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetryConnection}>
          <Text style={styles.retryButtonText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleRetryConnection = async () => {
    setIsLoading(true);
    const connected = await checkConnectivity();
    if (connected) {
      await fetchData(true);
    }
    setIsLoading(false);
  };

  const syncAllPendingActions = async () => {
    const connected = await checkConnectivity(false);

    if (!connected || pendingActions.length === 0) return;
    // setSyncAllModalVisible(true);
    for (const item of pendingActions) {
      await handleSyncPendingAction(
        item,
        item.data.type === 'worker' ? 'CREATE_WORKER' : 'CREATE_DEPARTMENT',
      );
    }
  };

  useEffect(() => {
    if (isConnectedState && !showOfflineMode && pendingActions.length > 0) {
      syncAllPendingActions();
    }
  }, [isConnectedState, showOfflineMode, , pendingActions]);

  const handleCancelPendingAction = async id => {
    logger.log('id', id, {context: 'Worker'});

    try {
      await removePendingAction(id);
      gettPendingActions('CREATE_WORKER');
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {context: 'Worker'});
    }
  };

  const uploadFileToServer = useCallback(
    async (file, type = 'image') => {
      if (!file) return null;
      const connected = await checkConnectivity(false);
      if (!connected) {
        logger.log('Image upload skipped - offline', {context: 'Worker'});
        return file; // Return local path for offline storage
      }
      const formData = new FormData();
      const isDocument = type === 'document';
      logger.log({type}, {context: 'Worker'});

      formData.append(isDocument ? 'pdf' : 'image', {
        uri: file,
        type: isDocument ? 'application/pdf' : 'image/jpeg',
        name: `upload-${Date.now()}.${isDocument ? 'pdf' : 'jpg'}`,
      });

      try {
        const endpoint = `${baseUrl}/upload/${isDocument ? 'pdf' : 'image'}`;

        const {ok, data} = await fetchFormDataApi(
          endpoint,
          'POST',
          null,
          formData,
          null,
          {'Content-Type': 'multipart/form-data'},
        );

        if (!ok) {
          throw new Error(data?.message || 'Upload failed');
        }

        const imageUrl = ok ? data?.data?.url : file;
        return imageUrl;
      } catch (error) {
        logger.error(`${type} upload failed:`, error, {context: 'Worker'});
        return null;
      }
    },
    [baseUrl],
  );

  const handleSyncPendingAction = async (item, type) => {
    const connected = await checkConnectivity();
    if (!connected) {
      showAlert(
        'Sync requires internet connection. Please try again when online.',
        'error',
      );
      return;
    }

    const data = item.data.data;
    // setIsPendingLoading(true);
    logger.log(type, {context: 'Worker'});

    try {
      if (type === 'CREATE_DEPARTMENT') {
        const {ok, data: response} = await fetchApis(
          item.data.url,
          'POST',
          setIsStatusLoading,
          {
            name: data.name,
          },
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );
        ApiResponse(showAlert, response, language);

        if (!ok || response?.error) {
          return;
        }

        await removePendingAction(item.id);
        gettPendingActions(type);

        setApiData(prevData => [...prevData, response?.data?.department]);
        fetchData(true);
      } else {
        const [uploadedImageUrl, UploadedNationalID] = await Promise.all([
          uploadFileToServer(data.profile_image, 'image'),

          uploadFileToServer(data.document_url, data.nationalIDType),
        ]);

        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          middle_name: data.middle_name,
          email: data.email,
          phone: `${data.phone}`,
          dob: data.dob,
          profile_image: uploadedImageUrl,

          department_id: data.department_id,
          position: data.position,
          employee_type: data.employee_type,
          hire_date: data.hire_date,
          assign_region: data.assign_region,
          country: data.country,
          province: data.province,
          city: data.city,
          street_address: data.street_address,
          postal_code: data.postal_code,
          shift_schedule: data.shift_schedule,
          country_code: data.country_code,
          document_url: UploadedNationalID,
          work_hours: data.work_hours,
          salary: data.salary,
        };

        logger.log('payload', payload, {context: 'Worker'});

        try {
          const {ok, data: responseData} = await fetchApis(
            item.data.url,
            'POST',
            null,
            payload,
            showAlert,
            {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          );

          ApiResponse(showAlert, responseData, language);
          if (ok && !responseData.error) {
            logger.log('Response: ', responseData, {context: 'Worker'});
            await removePendingAction(item.id);
            gettPendingActions(type);
            fetchData(true);
          } else {
          }
        } catch (error) {
          logger.log(`🚨 Error syncing action ID ${item.id}:`, error, {
            context: 'Worker',
          });
          showAlert('Sync failed. Please try again.', 'error');
        }
      }
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {context: 'Worker'});
      showAlert('Sync failed. Please try again.', 'error');
    } finally {
      onRefresh();
      setIsPendingLoading(false);
    }
  };

  const onApplyFilters = data => {
    const newFilterState = {
      startDate: data.date_from,
      endDate: data.date_to,
      status: data.status,
      department_id: data.department_id,
      shift: data.shift,
      salary: data.salary,
      work_hours: data.work_hours,
    };
    setFilterState(newFilterState);
    setFilterApplied(true);
    filterBtmSheetRef.current?.close();
    resetPagination();
  };

  useEffect(() => {
    if (route.params?.status) {
      onApplyFilters({status: route.params.status});
      setSelectedTab('Employees');
    }
  }, [route.params]);

  const handleUpdateStatus = useCallback(
    statusData => {
      if (selectedTab === 'Employees') {
        onStatusChangePress(statusData.status);
        // updateWorkerStatus(selectedItem?.id, statusData.status);
        setSelectedItem(prev => ({
          ...prev,
          selectedStatus: statusData.status,
        }));
      } else if (selectedTab === 'Departments') {
        updateDepartmentStatus(selectedItem?.id, statusData.status);
      }
    },
    [
      selectedTab,
      selectedItem,
      updateWorkerStatus,
      updateDepartmentStatus,
      fetchData,
    ],
  );
  const clearFilters = () => {
    setFilterState({
      startDate: null,
      endDate: null,
      status: null,
      department_id: null,
      shift: null,
      salary: null,
      work_hours: null,
    });

    setFilterApplied(false);
    filterBtmSheetRef?.current?.clearFilters()

    // Reset pagination and refetch data
    resetPagination();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      {renderOfflineBanner()}
       {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.screenHeading,
              ]}>
              {t('Employee Management')}
            </Text>
            {isStatusLoading && <Loader />}
          </View>
          <View style={styles.iconContainer}>
           
            {FilterApplied ? (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => clearFilters()}>
                <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => filterBtmSheetRef.current?.open()}>
                <Svgs.filter />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearchToggle}>
              {isDarkMode ? <Svgs.searchD /> : <Svgs.SearchL />}
            </TouchableOpacity>
             <TouchableOpacity
                onPress={() => navigation.navigate(SCREENS.MESSAGES)}
                // style={{marginRight: wp(2)}}
                >
                {isDarkMode ? (
                  <Svgs.messageD height={hp(4)} />
                ) : (
                  <Svgs.messageL height={hp(5)} width={wp(7)} />
                )}
                {totalCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {totalCount > 99 ? '99+' : totalCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
          </View>
        </View>

               {/* Search Input */}
        {showSearch && (
          <TxtInput
            placeholder={t(currentTabConfig.searchPlaceHolder)}
            onChangeText={(value)=>{
              console.log({value})
              setSearchText(value)}}
            value={searchText}
            containerStyle={styles.searchInput}
            rightSvg={
              isDarkMode ? (
                <Svgs.crossWhite height={hp(8)} width={wp(8)} />
              ) : (
                <Svgs.Cross height={hp(3.5)} width={wp(3.5)} />
              )
            }
            onSubmitEditing={handleSearch}
            rightIconPress={handleReset}
            autoFocus={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            focusedStyle={isSearchFocused ? styles.focusedInput : {}}
            style={{marginVertical: hp(1), marginHorizontal: wp(4)}}
          />
        )}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader size={wp(10)} />
        </View>
      ) : (
        <FlatList
          data={currentTabConfig.data}
          keyExtractor={(item, index) => `${item?.id || index}`}
          refreshControl={
            <RefreshControl
              colors={[Colors.darkTheme.primaryColor]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={renderListHeader}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(_, index) => ({
            length: hp(8),
            offset: hp(8) * index,
            index,
          })}
        />
      )}

      <TouchableOpacity
        style={[
          styles.floatingButton,
          isAtWorkerLimit &&
            selectedTab === 'Employees' &&
            styles.disabledFloatingButton,
        ]}
        onPress={handleAddPress}
        // disabled={isAtWorkerLimit && selectedTab === 'Employees'}
      >
        <Svgs.whitePlus height={hp(5)} width={wp(5)} />
      </TouchableOpacity>

      <AddDepartmentBottomSheet
        refRBSheet={addDepartmentBottomSheetRef}
        height={hp('30%')}
        selectedDep={selectedDep}
        setSelectedDep={setSelectedDep}
        isDepEdit={isDepEdit}
        onEdit={updateDepartmentStatus}
        onAdd={addDepartment}
        loading={addLoading}
      />

      <ConfirmationBottomSheet
        ref={deleteSheetRef}
        icon={<Svgs.deleteAcc height={hp(10)} />}
        title={currentTabConfig.deleteBtmSheetHeading}
        description={currentTabConfig.deleteBtmSheetSubHeading}
        onConfirm={() => {
          currentTabConfig.onDeletePress(selectedItem?.id);
        }}
        onCancel={() => {
          deleteSheetRef.current?.close();
          setSelectedItem(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <UpdateStatusBtmSheet
        refRBSheet={updateStatusBtmSheetRef}
        onApplyFilters={handleUpdateStatus}
        dropdownData={dropdownData}
        currentStatus={
          selectedTab === 'Employees'
            ? selectedItem?.status
            : selectedItem?.is_active
            ? 'active'
            : 'inactive'
        }
      />

      <EditAttendanceSettingsModal
        visible={isAttendanceModalVisible}
        onClose={() => {
          setIsAttendanceModalVisible(false);
        }}
        workerId={selectedItem?.id} // REQUIRED
        item={selectedItem?.attendanceSettings} // No item → ADD MODE
        onPress={() => {
          updateWorkerStatus(selectedItem?.id, selectedItem?.selectedStatus);
          fetchData(true, true);
        }}
      />
      <WorkerFilterBtmSheet
        key={selectedTab} // This forces re-render when tab changes
        ref={filterBtmSheetRef}
        onApplyFilters={onApplyFilters}
        height={selectedTab === 'Employees' ? hp(80) : hp(35)}
        // showPicker={selectedTab === 'Departments'}
        selectedTab={selectedTab}
        onClearFilters={clearFilters}
      />

      <ReusableBottomSheet
        height={hp('36%')}
        refRBSheet={selectorBottomSheetRef}
        sheetTitle={'Select An Option'}
        options={[
          {
            title: 'Update Status',
            onPress: () => {
              selectorBottomSheetRef.current?.close();
              setTimeout(() => {
                updateStatusBtmSheetRef.current?.open();
              }, 300);
            },
          },
          {
            title:
              selectedTab === 'Employees' ? 'Edit Employee' : 'Edit Department',
            onPress: () => {
              selectorBottomSheetRef.current?.close();
              if (selectedTab === 'Employees') {
                currentTabConfig.onEditPress(selectedItem);
              } else {
                currentTabConfig.onEditPress(selectedItem);
              }
            },
          },
          {
            title:
              selectedTab === 'Employees'
                ? 'Delete Employee'
                : 'Delete Department',
            onPress: () => {
              selectorBottomSheetRef.current?.close();
              currentTabConfig.onDeleteIconPress(selectedItem);
            },
          },
        ]}
      />
    </KeyboardAvoidingView>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    mainContainer: {
      flex: 1,
    },
    sectionContainer: {
      flex: 1,
      marginTop: hp(2),
    },
    emptyCardContainer: {
      marginTop: hp(20),
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      justifyContent: 'space-between',
    },
    screenHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    searchContainer: {
      marginHorizontal: wp(5),
      marginBottom: hp(2),
    },
    searchInput: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : 'transparent',
      height: hp(6),
    },
    focusedInput: {
      borderWidth: 2,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    headingText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    mapText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: Colors.lightTheme.secondryTextColor,
      marginTop: hp(1),
      marginLeft: wp(4),
    },
    workerStatusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(1),
      marginHorizontal: wp(4),
    },
    headerRow: {
      flexDirection: 'row',
      gap: wp(2),
      alignItems: 'center',
    },
    listContainer: {
      paddingBottom: hp(2),
      paddingHorizontal: wp(0),
      flexGrow: 1,
      
    },
    floatingButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(13),
      height: wp(13),
      borderRadius: wp(7.5),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    disabledFloatingButton: {
      backgroundColor: Colors.lightTheme.secondryTextColor,
      opacity: 0.6,
    },

    offlineBanner: {
      backgroundColor: '#ff6b6b',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    offlineText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      flex: 1,
    },
    retryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: 5,
    },
    retryButtonText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
    },
    pendingRequestMainContainer: {
      marginTop: hp(0),
    },
    offlineIndicator: {
      color: '#ff6b6b',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.2),
      fontStyle: 'italic',
    },
    mapImage: {
      width: wp(100),
      height: hp(30),
      // marginTop: hp(2),
      // flex: 1,
    },
    clearFilterButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(1),
      paddingVertical: hp(0.5),
      borderRadius: hp(0.5),
      marginLeft: wp(2),
    },
    clearFilterText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    dashboardSection: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingVertical: hp(1.5),
    },
    dashboardListContainer: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.5),
    },
    dashboardItemWrapper: {
      marginRight: wp(3),
    },
     badgeContainer: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderRadius: wp(3),
      minWidth: wp(5),
      height: wp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: RFPercentage(pxToPercentage(10)),
      fontFamily: Fonts.PoppinsBold,
      textAlign: 'center',
    },
  });

export default React.memo(Worker);
