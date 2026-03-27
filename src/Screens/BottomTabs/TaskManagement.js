import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  FlatList,
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
import {Svgs} from '@assets/Svgs/Svgs';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import TaskFilterBtmSheet from '@components/BottomSheets/TaskFilterBtmSheet';
import DashboardCard from '@components/Cards/DashboardCard';
import EmptyCard from '@components/Cards/EmptyCard';
import SymbolCard from '@components/Cards/SymbolCard';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import {TaskSymbols} from '@constants/DummyData';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {
  ApiResponse,
  fetchApis,
  fetchFormDataApi,
  isConnected,
} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import TaskCalendar from '../MainStack/TaskCalender';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import {getPendingActions, removePendingAction} from '@utils/sqlite';
import PendingRequestCard from '@components/Cards/PendingRequestCard';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import TaskManagementCard from '@components/Cards/TaskManagementCard';
import TaskHistoryCard from '@components/Cards/TaskHistoryCard';
import logger from '@utils/logger';
import {pxToPercentage} from '@utils/responsive';

// Constants
const TABS = ['All Tasks', 'Task History', 'Calendar View'];

const INITIAL_FILTERS = {
  worker: null,
  priority: null,
  datefrom: null,
  dateto: null,
  filterApplied: false,
  searchText: null,
  status: null,
  department: null,
};

const TaskManagement = ({navigation, route}) => {
  const {home} = route?.params || false;
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const {workers, departments} = useSelector(store => store.states);
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('tasks');
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );
  const sheetRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState(
    route?.params?.isFromHome ? 'Calendar View' : 'All Tasks',
  );
  const {totalCount} = useSelector(store => store.messageSlice);

  const [counters, setCounters] = useState(null);
  const [isConnectedState, setIsConnectedState] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const filterSheetRef = useRef();
  const isTasks = selectedTab === 'All Tasks';
  const isHistory = selectedTab === 'Task History';
  const isCalendar = selectedTab === 'Calendar View';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD'),
  });
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
      if (route.params?.isFromHome) {
        setSelectedTab('Calendar View');
      }
    }, [route.params]);



  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      worker: data.workerId,
      priority: data.priority,
      status: data.status,
      filterApplied: true,
      department: data.department,
    }));
  }, []);

  const TaskManagementData = useMemo(() => {
    return [
      {
        title: 'Assigned Projects',
        value: counters?.assigned,
      },
      {
        title: 'Completed Projects',
        value: counters?.completed,
      },
      {
        title: 'Ongoing Projects',
        value: counters?.in_progress,
      },
      {
        title: 'Delayed',
        value: counters?.delayed,
      },
      {
        title: 'Cancelled',
        value: counters?.cancelled,
      },
      {
        title: 'Not Done',
        value: counters?.not_done,
      },
    ];
  }, [counters]);

  const updateDateRange = useCallback(date => {
    const startDate = moment(date).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(date).endOf('month').format('YYYY-MM-DD');

    setDateRange({startDate, endDate});
  }, []);

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
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const buildApiUrl = (
    pageNumber,
    currentTab = selectedTab,
    resetSearch = false,
  ) => {
    let url = `${baseUrl}/task-management/admin/tasks`;

    if (currentTab === 'All Tasks') {
      url += `?page=${pageNumber}&page_size=10&sort=created_at:desc`;
      const filterParams = [
        filters.datefrom && `from=${filters.datefrom}`,
        filters.dateto && `to=${filters.dateto}`,
        filters.worker && `worker_id=${filters.worker}`,
        filters.priority && `priority=${filters.priority}`,
        filters.status && `status=${filters.status}`,
        !resetSearch && filters.searchText && `q=${filters.searchText}`,
      ].filter(Boolean);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }

      // Always today's logs
    } else if (currentTab === 'Calendar View') {
      url += `?page=${pageNumber}&page_size=100&sort=created_at:desc&from=${dateRange.startDate}&to=${dateRange.endDate}`;
      const filterParams = [
        filters.worker && `worker_id=${filters.worker}`,
        filters.priority && `priority=${filters.priority}`,
        filters.status && `status=${filters.status}`,
      ].filter(Boolean);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }
    } else if (currentTab === 'Task History') {
      url += `/attendance-history?page=${pageNumber}`;
      const filterParams = [
        filters.datefrom && `dateFrom=${filters.datefrom}`,
        filters.dateto && `dateTo=${filters.dateto}`,
        filters.worker && `workerId=${filters.worker}`,
        filters.status && `status=${filters.status}`,
        filters.department && `department=${filters.department}`,
        !resetSearch && filters.searchText && `q=${filters.searchText}`,
      ].filter(Boolean);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }
    }
    return url;
  };

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      worker: null,
      priority: null,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      status: null,
      department: null,
    }));
  }, []);
  console.log(filters);

  const fetchData = useCallback(
    async (reset = false, tabOverride = null, resetSearch = true) => {
      if (isLoading || (!reset && !hasNext)) return;

      const loadingState = reset ? setIsLoading : setIsLoadingMore;
      loadingState(true);

      try {
        const url = buildApiUrl(
          reset ? 1 : page,
          tabOverride || selectedTab,
          resetSearch,
        );

        console.log(url);

        const {ok, data: responseData} = await fetchApis(
          url,
          'GET',
          null,
          null,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );

        if (!ok || responseData?.error) {
          ApiResponse(showAlert, responseData, language);

          return;
        }

        const fetchedData = responseData?.data;
        console.log(responseData);

        if (isTasks) {
          setApiData(prevData =>
            reset
              ? fetchedData?.tasks
              : [...(prevData || []), ...(fetchedData?.tasks || [])],
          );
        } else if (isHistory) {
          setApiData(prevData =>
            reset
              ? fetchedData?.tasks
              : [...(prevData || []), ...(fetchedData?.tasks || [])],
          );
        } else if (isCalendar) {
          setApiData(prevData =>
            reset
              ? fetchedData?.tasks
              : [...(prevData || []), ...(fetchedData?.tasks || [])],
          );
        }

        setHasNext(responseData?.data?.pagination?.has_next || false);
        setPage(reset ? 2 : page + 1);
      } catch (error) {
        logger.error('Fetch error:', error, {context: 'TaskManagement'});
        showAlert('Something went wrong', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      isLoading,
      hasNext,
      page,
      selectedTab,
      filters.datefrom,
      filters.dateto,
      filters.worker,
      filters.priority,
      filters.status,
      filters.searchText,
      token,
      showAlert,
      language,
      isTasks,
      isCalendar,
      setApiData,
      setHasNext,
      setPage,
      resetPagination,
      buildApiUrl,
    ],
  );

  const fetchCounters = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks/counters`,
        'GET',
        null,
        null,
        null,
        {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      );

      if (ok && !data?.error && data?.data?.counters) {
        setCounters(data.data.counters);
      } else {
        ApiResponse(showAlert, data, language);
      }
    } catch (error) {
      logger.error('Error fetching workers:', error, {
        context: 'TaskManagement',
      });
      showAlert('Failed to fetch employees', 'error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
      gettPendingActions();
      checkConnectivity();
    }, [
      selectedTab,
      filters.priority,
      filters.worker,
      filters.datefrom,
      filters.dateto,
      filters.status,
      filters.filterApplied,
      dateRange.endDate,
      dateRange.startDate,
    ]),
  );

  useEffect(() => {
    fetchCounters();
  }, [fetchCounters]);

  const resetSearch = useCallback(() => {
    setFilters(prev => ({...prev, searchText: null}));
    setShowSearch(false);
    fetchData(true, true);
  }, [fetchData]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFloatingButtonPress = useCallback(() => {
    sheetRef.current?.open();
  }, []);

  const handleCreateTask = useCallback(() => {
    sheetRef.current?.close();
    navigation.navigate(SCREENS.CREATETASK, {type: 'Task'});
  }, [navigation]);

  const handleTaskPress = useCallback(
    async item => {
      const connected = await checkConnectivity();
      if (connected) {
        navigation.navigate(SCREENS.TASKDETAILS, {item});
      } else {
        showAlert(
          'To view task details, please connect to the internet',
          'error',
        );
      }
    },
    [navigation],
  );

  const bottomSheetOptions = useMemo(
    () => [
      {
        icon: <Svgs.createTask height={hp(4)} />,
        title: 'Create Task',
        onPress: () => {
          handleCreateTask();
          sheetRef.current?.close();
          clearFilters();
        },
      },
    ],
    [handleCreateTask],
  );

  const renderFloatingButton = useCallback(() => {
    if (!isTasks) return null;

    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleFloatingButtonPress}>
        <Svgs.whitePlus height={hp(3)} width={hp(3)} />
      </TouchableOpacity>
    );
  }, [isTasks, styles.floatingButton, handleFloatingButtonPress]);

  const renderDashboardCard = useCallback(
    ({item}) => {
      return <DashboardCard title={item.title} value={item.value} />;
    },
    [TaskManagementData],
  );

  const renderTaskItem = useCallback(
    ({item}) => <TaskManagementCard item={item} onPress={handleTaskPress} />,
    [styles.taskItemContainer, handleTaskPress],
  );
  const renderTaskHistoryItem = useCallback(
    ({item}) => <TaskHistoryCard item={item} onPress={handleTaskPress} />,
    [styles.taskItemContainer, handleTaskPress],
  );

  const renderOfflineBanner = () => {
    if (isConnectedState) return null;

    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>
          {t('You are offline. Please check your internet connection.')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkConnectivity}>
          <Text style={styles.retryButtonText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const loadMoreData = () => {
    if (!isLoadingMore && !isLoading) {
      fetchData(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    resetPagination();
    await fetchData(true);
    setRefreshing(false);
    gettPendingActions();
  };
  const handleCancelPendingAction = async id => {
    logger.log('id', id, {context: 'TaskManagement'});

    try {
      await removePendingAction(id);
      gettPendingActions('CREATE_TASK');
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'TaskManagement',
      });
    }
  };
  const getStatusColor = status => {
    if (!status) return '#808080'; // Gray for unknown

    const statusMap = {
      assigned: '#28A745', // Green
      'in-progress': '#007BFF', // Blue
      pending: '#FFC107', // Yellow
      completed: '#FF8C00', // Orange
    };

    return statusMap[status] || '#28A745'; // default green
  };
  const renderListHeader = useCallback(() => {
    const renderDashboardCards = () => {
      if (!counters) return null;

      return (
        <View
          style={{flexDirection: 'row'}}
          onStartShouldSetResponder={() => setScrollEnabled(true)}>
          <FlatList
            data={TaskManagementData}
            keyExtractor={(_, index) => `dashboard-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListContainer}
            contentContainerStyle={{flexGrow: 1}}
            renderItem={renderDashboardCard}
          />
        </View>
      );
    };

    const renderPendingRequests = () => {
      if (pendingActions.length === 0) return null;

      return (
        <View
          style={styles.pendingRequestMainContainer}
          onStartShouldSetResponder={() => setScrollEnabled(true)}>
          <View style={{flexDirection: 'row', gap: wp(2)}}>
            <Text style={[styles.title, {marginTop: 0}]}>
              {t('Pending Requests')}
            </Text>
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
              onSyncPress={() => handleSyncPendingAction(item)}
              disabled={!isConnectedState}
            />
          ))}
        </View>
      );
    };

    const renderFilterSection = () => {
      return (
        <View
          style={[
            styles.rowViewSB,
            {
              marginTop: hp(2),
              borderColor: isDarkMode
                ? Colors.darkTheme.BorderGrayColor
                : Colors.lightTheme.BorderGrayColor,
              borderWidth: 1,
              paddingHorizontal: wp(3),
              paddingVertical: hp(1.5),
              borderRadius: 8,
            },
          ]}
          onStartShouldSetResponder={() => setScrollEnabled(true)}>
          <Text style={styles.TabHeading}>{`${apiData.length} ${t(
            'Tasks',
          )}`}</Text>
          {filters.filterApplied ? (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}>
              <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => filterSheetRef.current?.open()}>
              <Svgs.filter />
            </TouchableOpacity>
          )}
        </View>
      );
    };

    const renderSymbolCard = () => {
      return (
        <SymbolCard
          heading="Status Symbols"
          array={TaskSymbols}
          contianerStyle={styles.symbolCardContainer}
        />
      );
    };

    return (
      <View style={styles.listHeaderContainer}>
        <View onStartShouldSetResponder={() => setScrollEnabled(false)}>
          <LeafLetMapComponent
            initialZoom={1}
            markers={apiData
              .filter(item => item.location_lat && item.location_lng)
              .map(item => ({
                id: item.id,
                name: item.title,
                status: item.status,
                lat: Number(item.location_lat),
                lng: Number(item.location_lng),
                address: item.location_address,
                color: getStatusColor(item.status),
              }))}
            style={styles.mapImage}
            initialMarkerTitle={'Current Location'}
            searchPlaceholder={t('Find a place...')}
            onLocationFound={result => {
              logger.log('Found:', result, {context: 'TaskManagement'});
            }}
            showSearch={false}
            shouldShowInitialMarker={false}
          />
        </View>

        {renderPendingRequests()}
        {renderDashboardCards()}
        {renderFilterSection()}
        {renderSymbolCard()}
      </View>
    );
  }, [
    counters,
    TaskManagementData,
    renderDashboardCard,
    pendingActions,
    isPendingLoading,
    isConnectedState,
    t,
    apiData.length,
    filters.filterApplied,
    clearFilters,
    isDarkMode,
    Colors,
    renderSearchInput,
  ]);
  const renderHistoryListHeader = useCallback(() => {
    const renderFilterSection = () => {
      return (
        <View
          style={[
            styles.rowViewSB,
            {
              marginTop: hp(2),
              borderColor: isDarkMode
                ? Colors.darkTheme.BorderGrayColor
                : Colors.lightTheme.BorderGrayColor,
              borderWidth: 1,
              paddingHorizontal: wp(3),
              paddingVertical: hp(1.5),
              borderRadius: 8,
            },
          ]}
          onStartShouldSetResponder={() => setScrollEnabled(true)}>
          <Text style={styles.TabHeading}>{`${apiData.length} ${t(
            'Tasks',
          )}`}</Text>
          {filters.filterApplied ? (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}>
              <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => filterSheetRef.current?.open()}>
              <Svgs.filter />
            </TouchableOpacity>
          )}
        </View>
      );
    };

    return (
      <View style={styles.listHeaderContainer}>{renderFilterSection()}</View>
    );
  }, [
    counters,
    TaskManagementData,
    renderDashboardCard,
    pendingActions,
    isPendingLoading,
    isConnectedState,
    t,
    apiData.length,
    filters.filterApplied,
    clearFilters,
    isDarkMode,
    Colors,
    renderSearchInput,
  ]);

  const renderTasksContent = useCallback(
    () => (
      <View style={styles.contentContainerStyle}>
        <FlatList
          data={apiData}
          scrollEnabled={scrollEnabled}
          renderItem={renderTaskItem}
          onEndReached={loadMoreData}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: hp(40)}}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoadingMore ? <Loader size={wp(10)} /> : null}
          ListEmptyComponent={
            <EmptyCard
              icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
              heading="Empty!"
              subheading={'No tasks yet'}
            />
          }
          refreshControl={
            <RefreshControl
              colors={[Colors.darkTheme.primaryColor]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={renderListHeader}
        />
      </View>
    ),
    [
      styles,
      t,
      renderTaskItem,
      apiData,
      isLoadingMore,
      refreshing,
      onRefresh,
      renderListHeader,
    ],
  );
  const renderTasksHistoryContent = useCallback(
    () => (
      <View style={styles.contentContainerStyle}>
        <FlatList
          data={apiData}
          scrollEnabled={scrollEnabled}
          renderItem={renderTaskHistoryItem}
          onEndReached={loadMoreData}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: hp(40)}}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoadingMore ? <Loader size={wp(10)} /> : null}
          ListEmptyComponent={
            <EmptyCard
              icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
              heading="Empty!"
              subheading={'No tasks yet'}
            />
          }
          refreshControl={
            <RefreshControl
              colors={[Colors.darkTheme.primaryColor]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={renderHistoryListHeader}
        />
      </View>
    ),
    [
      styles,
      t,
      renderTaskItem,
      apiData,
      isLoadingMore,
      refreshing,
      onRefresh,
      renderHistoryListHeader,
    ],
  );

  const handleSearchTextChange = useCallback(value => {
    setFilters(prev => ({...prev, searchText: value}));
  }, []);

  const handleSearch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const renderSearchInput = useCallback(() => {
    if (!showSearch) return null;

    return (
      <Animated.View style={styles.searchContainer}>
        <TxtInput
          placeholder={t('Search')}
          onChangeText={handleSearchTextChange}
          value={filters.searchText}
          containerStyle={[
            styles.searchInput,
            {
              backgroundColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : 'transparent',
            },
          ]}
          rightSvg={
            isDarkMode ? (
              <Svgs.crossWhite height={hp(8)} width={wp(8)} />
            ) : (
              <Svgs.Cross height={hp(3.5)} width={wp(3.5)} />
            )
          }
          rightIconPress={resetSearch}
          onSubmitEditing={handleSearch}
        />
      </Animated.View>
    );
  }, [
    showSearch,
    styles,
    t,
    handleSearchTextChange,
    filters.searchText,
    isDarkMode,
    resetSearch,
    handleSearch,
  ]);
  const gettPendingActions = async (actionType = 'CREATE_TASK') => {
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
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'TaskManagement',
      });
    }
  };
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
      logger.error('Connectivity check failed:', error, {
        context: 'TaskManagement',
      });
      setIsConnectedState(false);
      return false;
    }
  };

  const uploadDocumentToServer = useCallback(async document => {
    if (!document) return null;
    if (!isConnectedState) return document;
    const formData = new FormData();
    formData.append('pdf', {
      uri: document,
      type: 'application/pdf',
      name: `upload-${Date.now()}.pdf`,
    });

    try {
      const {ok, data} = await fetchFormDataApi(
        `${baseUrl}/upload/pdf`,
        'POST',
        null,
        formData,
        null,
        {'Content-Type': 'multipart/form-data'},
      );

      if (!ok) {
        throw new Error(data?.message || 'Upload failed');
      }

      return data?.data?.url || document;
    } catch (error) {
      logger.error('Document upload failed:', error, {
        context: 'TaskManagement',
      });
      throw error;
    }
  }, []);

  const imageUploadURL = `${baseUrl}/upload/image`;

  const uploadImageToServer = useCallback(async path => {
    setIsLoading(true);
    if (!path) return false;
    if (!isConnectedState) return path;

    const formDataa = new FormData();
    formDataa.append('image', {
      uri: path,
      type: 'image/jpeg',
      name: `upload-${Date.now()}.jpg`,
    });

    try {
      const {ok, data} = await fetchFormDataApi(
        imageUploadURL,
        'POST',
        null,
        formDataa,
        null,
        {'Content-Type': 'multipart/form-data'},
      );

      const imageUrl = ok ? data?.data?.url : path;

      return imageUrl;
    } catch (error) {
      logger.error('Image upload failed:', error, {context: 'TaskManagement'});
      return false;
    }
  }, []);

  const uploadMultipleImages = useCallback(
    async images => {
      if (!images?.length) return [];

      try {
        const uploadedUrls = await Promise.all(
          images.map(imgPath => uploadImageToServer(imgPath)),
        );

        // Filter out any failed uploads (false values)
        const validUrls = uploadedUrls.filter(url => url);

        return validUrls;
      } catch (error) {
        logger.error('Multiple image upload failed:', error, {
          context: 'TaskManagement',
        });
        return [];
      }
    },
    [uploadImageToServer],
  );

  const uploadMultipleDocuments = useCallback(
    async documents => {
      if (!documents?.length) return [];

      try {
        const uploadedUrls = await Promise.all(
          documents.map(doc => uploadDocumentToServer(doc)),
        );

        // remove null/failed uploads
        return uploadedUrls.filter(url => url);
      } catch (error) {
        logger.error('Multiple document upload failed:', error, {
          context: 'TaskManagement',
        });
        return [];
      }
    },
    [uploadDocumentToServer],
  );

  const syncAllPendingActions = async () => {
    const connected = await checkConnectivity(false);

    if (!connected || pendingActions.length === 0) return;
    // setSyncAllModalVisible(true);
    for (const item of pendingActions) {
      await handleSyncPendingAction(item);
    }
  };
  useEffect(() => {
    if (isConnectedState && !showOfflineMode && pendingActions.length > 0) {
      syncAllPendingActions();
    }
  }, [isConnectedState, showOfflineMode, , pendingActions]);
  const handleSyncPendingAction = async item => {
    const connected = await checkConnectivity();
    if (!connected) {
      showAlert(
        'Sync requires internet connection. Please try again when online.',
        'error',
      );
      return;
    }

    const data = item.data.data;
    setIsPendingLoading(true);

    try {
      let urls = [];
      let documentUrls = [];
      let imageUrls = [];

      // Correct: check length + correct upload function
      if (data?.documents?.length > 0) {
        documentUrls = await uploadMultipleDocuments(data.documents);
        urls = [...urls, ...documentUrls];
      }

      if (data?.images?.length > 0) {
        imageUrls = await uploadMultipleImages(data.images);
        urls = [...urls, ...imageUrls];
      }

      logger.log('📄 Document URLs:', documentUrls, {
        context: 'TaskManagement',
      });
      logger.log('🖼 Image URLs:', imageUrls, {context: 'TaskManagement'});

      const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        start_at: data.start_at,
        end_at: data.end_at,
        location: data?.location,
        assignees: data?.assignees,
        attachments: urls ? urls : [],
        face_required: true,
        location_required: true,
        evidence_required: true,
        completion_policy: 'all',
        meta: {
          timezone: 'Europe/Madrid',
          allow_decline: true,
          allow_reschedule: true,
        },
      };

      logger.log(payload, {context: 'TaskManagement'});

      const {ok, data: responseData} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks`,
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
      await removePendingAction(item.id);
      gettPendingActions();

      if (ok && !responseData?.error) {
      }
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'TaskManagement',
      });
      showAlert('Sync failed. Please try again.', 'error');
    } finally {
      onRefresh();
      setIsPendingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {renderOfflineBanner()}

      {hasFeature !== false && renderFloatingButton()}
      {hasFeature === false && (
        <UpgradeFeatureView
          navigation={navigation}
          featureName="Tasks Management"
        />
      )}

      <View style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <Text style={[styles.ScreenHeading]}>{t('Task Management')}</Text>
          <View style={styles.iconContainer}>
            {selectedTab === 'All Tasks' && (
              <TouchableOpacity
                onPress={() => {
                  if (showSearch) {
                    setFilters(prev => ({...prev, searchText: null}));
                    setShowSearch(false);
                  } else {
                    setShowSearch(true);
                  }
                }}>
                {isDarkMode ? <Svgs.searchD /> : <Svgs.SearchL />}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.MESSAGES)}>
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
            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}>
              {isDarkMode ? (
                <Svgs.BellD height={hp(4)} />
              ) : (
                <Svgs.BellL height={hp(4)} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {renderSearchInput()}

        <TabSelector
          tabs={TABS}
          selectedTab={selectedTab}
          onTabPress={tab => {
            setSelectedTab(tab);
            setFilters(prev => ({...prev, searchText: null}));
            setShowSearch(false);
            setApiData([]);
            resetPagination();
          }}
        />

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader size={wp(10)} />
          </View>
        ) : isTasks ? (
          renderTasksContent()
        ) : isHistory ? (
          renderTasksHistoryContent()
        ) : isCalendar ? (
          <TaskCalendar
            updateDateRange={updateDateRange}
            data={apiData}
            dateRange={dateRange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        ) : null}
      </View>

      <ReusableBottomSheet
        height={hp('15%')}
        refRBSheet={sheetRef}
        sheetTitle="Select An Option"
        options={bottomSheetOptions}
      />

      <TaskFilterBtmSheet
        refRBSheet={filterSheetRef}
        workers={workers}
        height={isHistory ? hp(80) : hp(72)}
        onApplyFilters={onApplyFilters}
        isHistory={isHistory}
        departments={departments}
      />
    </View>
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
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      justifyContent: 'space-between',
    },
    ScreenHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(5),
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    contentContainerStyle: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
    },
    listHeaderContainer: {
      backgroundColor: 'transparent',
    },
    flatListContainer: {
      marginTop: hp(2),
      flex: 1,
    },
    listContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
      borderRadius: wp(4),
      paddingBottom: hp(2),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      marginTop: hp(1),
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(1),
      marginLeft: wp(1.5),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
    },
    TabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    title: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(2),
    },
    taskItemContainer: {
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      paddingVertical: hp(1),
    },
    floatingButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(13),
      height: wp(13),
      borderRadius: wp(6.5),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    symbolCardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    sectionContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      flex: 1,
    },
    calenderContainer: {
      paddingVertical: wp(2),
      paddingHorizontal: wp(4),
      marginTop: wp(10),
      borderRadius: wp(5),
      marginHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
    },
    sectionHeading: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    // New styles for month navigation
    monthNavigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(2),
      marginVertical: hp(1),
      borderRadius: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    monthNavButton: {
      padding: wp(2),
      borderRadius: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: wp(10),
    },
    monthYearContainer: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: hp(1),
    },
    monthYearText: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: hp(30),
    },
    eventContainer: {
      marginVertical: hp(1),
      borderRadius: wp(100),
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },

    clearFilterButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(0.5),
    },
    clearFilterText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
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
      height: hp(40),
      // marginTop: hp(2),
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: wp(5),
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

export default TaskManagement;
