import {Svgs} from '@assets/Svgs/Svgs';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import UpdateStatusBtmSheet from '@components/BottomSheets/UpdateStatusBtmSheet';
import CustomButton from '@components/Buttons/customButton';
import EmployeeCard from '@components/Cards/EmployeeCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import logger from '@utils/logger';
import moment from 'moment';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RefreshControl, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import EmptyCard from '@components/Cards/EmptyCard';

import {useSelector} from 'react-redux';

const PAGINATION_LIMIT = 20;

const DepartmentDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode, Colors);
  const item = route.params?.item;
  const [departmentDetails, setDepartmentDetails] = useState({});
  const [selectedItem, setSelectedItem] = useState();
  const deleteSheetRef = useRef(null);
  const selectorBottomSheetRef = useRef(null);
  const updateStatusBtmSheetRef = useRef(null);

  const {
    apiData: workers,
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

  const {t} = useTranslation();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [attendanceSettings, setAttendanceSettings] = useState(null);

  const statusArray = [
    {label: 'Active', value: 'active'},
    {label: 'Inactive', value: 'inactive'},
  ];

  const dropdownData = {
    statusOptions: statusArray,
  };

  const {showAlert} = useAlert();

  const buildApiUrl = useCallback(pageNumber => {
    let url = `${baseUrl}/departments/${item?.id}?page=${pageNumber}&limit=${PAGINATION_LIMIT}`;
    return url;
  }, []);

  const fetchData = useCallback(
    async (reset = false) => {
      if (isLoading || (!reset && !hasNext)) return;

      const loadingState = reset ? setIsLoading : setIsLoadingMore;
      loadingState(true);

      try {
        const url = buildApiUrl(reset ? 1 : page);

        const {ok, data: responseData} = await fetchApis(
          url,
          'GET',
          null,
          null,
          showAlert,
          {Authorization: `Bearer ${token}`},
        );

        if (!ok || responseData?.error) {
          ApiResponse(showAlert, responseData, language);
          return;
        }

        const fetchedWorkers = responseData?.data?.department?.workers || [];
        setDepartmentDetails(responseData?.data?.department);
        setApiData(prevData =>
          reset ? fetchedWorkers : [...prevData, ...fetchedWorkers],
        );
        setHasNext(
          responseData?.data?.department?.pagination?.has_more || false,
        );
        setPage(reset ? 2 : page + 1);
      } catch (error) {
        logger.error('Fetch error:', error, {context: 'DepartmentDetails'});
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
      token,
      setApiData,
      setHasNext,
      setPage,
      setIsLoading,
      setIsLoadingMore,
    ],
  );
  const fetchAttendanceData = useCallback(async () => {
    try {
      const {ok, data: responseData} = await fetchApis(
        `${baseUrl}/company-admins/departments/${item?.id}/attendance-settings`,
        'GET',
        null,
        null,
        showAlert,
        {Authorization: `Bearer ${token}`},
      );

      if (!ok || responseData?.error) {
        ApiResponse(showAlert, responseData, language);
        return;
      }

      setAttendanceSettings(responseData.data);
      logger.log(responseData.data, {context: 'DepartmentDetails'});
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'DepartmentDetails'});
      showAlert('Something went wrong.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    fetchAttendanceData();
  }, []);

  const updateWorkerActiveStatusURL = id =>
    `${baseUrl}/company-admins/approve-worker/${id}`;
  const updateWorkerInactiveStatusURL = id =>
    `${baseUrl}/company-admins/reject-worker/${id}`;

  const loadMoreData = useCallback(() => {
    if (hasNext && !isLoadingMore && !isLoading) {
      fetchData(false);
    }
  }, [hasNext, isLoadingMore, isLoading, fetchData]);

  const updateWorkerStatus = async (id, newStatus) => {
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

      ApiResponse(showAlert, data, language);

      if (!ok || data?.error) {
        logger.log('error', data, {context: 'DepartmentDetails'});

        ApiResponse(showAlert, data, language);
        return;
      } else {
        setApiData(prevData =>
          prevData.map(item =>
            item.id === id ? {...item, status: newStatus} : item,
          ),
        );
      }
    } catch (error) {
      logger.log('error', error, {context: 'DepartmentDetails'});
      showAlert('Something went wrong.', 'error');
    } finally {
      setIsStatusLoading(false);
    }
  };
  const renderListItem = useCallback(
    ({item}) => {
      return (
        <EmployeeCard
          item={item}
          onPress={() => {
            // Navigate to employee details if needed
            navigation.navigate(SCREENS.WORKERDETAILS, {
              status: item.status,
              item,
            });
          }}
          onBtnPress={() => {
            setSelectedItem(item);
            selectorBottomSheetRef.current?.open();
          }}
          onMessagePress={() => {
            navigation.navigate(SCREENS.CONVERSATION, {
              id: null,
              name: `${item?.first_name || ''} ${item?.middle_name || ''} ${
                item?.last_name || ''
              }`.trim(),
              avatar: item?.profile_image,
              other_user_id: item?.id,
            });
          }}
          showDesignationInsteadOfDepartment={true}
          containerStyle={styles.employeeCardStyle}
        />
      );
    },
    [styles],
  );

  const renderFooter = useCallback(
    () => (isLoadingMore ? <Loader size={wp(10)} /> : null),
    [isLoadingMore],
  );

  const deleteDepartment = useCallback(async id => {
    deleteSheetRef.current?.close();
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/departments/${departmentDetails.id}`,
        'DELETE',
        null,
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

      navigation.goBack();

      // Update local state
    } catch (error) {
      logger.error('Update error:', error, {context: 'DepartmentDetails'});
      showAlert('An error occurred while updating.', 'error');
    } finally {
      setSelectedItem(null);
    }
  }, []);

  const deleteBtmSheetContent = {
    heading: selectedItem ? 'Delete Employee' : 'Delete Department',
    description: selectedItem
      ? 'Are you sure you want to delete this employee?'
      : 'Are you sure you want to delete this department?',
    OnDeletePress: () => {
      deleteSheetRef.current.close();
      if (selectedItem) {
        deleteWorker(selectedItem.id);
        setSelectedItem(null);
      } else {
        deleteDepartment();
      }
    },
  };

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

      ApiResponse(showAlert, data, language);

      if (!ok || data?.error) {
        return;
      }

      // logger.log(data)

      setApiData(prevData => prevData.filter(item => item.id !== id));
    } catch (error) {
      logger.error('Update error:', error, {context: 'DepartmentDetails'});
      showAlert('An error occurred while updating.', 'error');
    } finally {
      setSelectedItem(null);
      setIsStatusLoading(false);
    }
  }, []);

  const handleUpdateStatus = useCallback(
    statusData => {
      updateWorkerStatus(selectedItem?.id, statusData.status);
    },
    [selectedItem, updateWorkerStatus],
  );

  return isLoading ? (
    <Loader size={wp(20)} style={{flex: 1, justifyContent: 'center'}} />
  ) : (
    <View style={styles.container}>
      <StackHeader
        title={item?.name}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerContainer}
        rightIcon={<Svgs.deleteOutline />}
        rightIconPress={() => deleteSheetRef.current?.open()}
      />

      <View style={{flex: 1}}>
        <View style={styles.statusContainer}>
          <WorkerStatus
            name={'Status'}
            status={
              departmentDetails
                ? departmentDetails.is_active
                  ? 'Active'
                  : 'Inactive'
                : item.is_active
                ? 'Active'
                : 'Inactive'
            }
            nameTextStyle={styles.statusText}
          />
          <View style={[styles.rowViewSB, {marginTop: hp(0.5)}]}>
            <Text style={styles.statusText}>{t('Created')}</Text>
            <Text style={styles.value}>
              {moment(departmentDetails?.created_at).format('DD MMM, YYYY')}
            </Text>
          </View>
        </View>

        <View style={[styles.tabsContainer]}>
          <View style={styles.headerRow}>
            <Text style={[styles.reportHeading]}>{t('Employees')}</Text>

            {isStatusLoading && <Loader />}
          </View>
          <FlatList
            data={workers}
            keyExtractor={(item, index) => `${item?.id || index}`}
            refreshControl={
              <RefreshControl
                colors={[Colors.darkTheme.primaryColor]}
                refreshing={refreshing}
                onRefresh={() => {
                  fetchData(true);
                  fetchAttendanceData();
                }}
              />
            }
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={() => (
              <EmptyCard
                icon={<Svgs.emptyUser height={hp(10)} width={hp(10)} />}
                heading="Empty!"
                subheading={'No Employees Yet!'}
                containerStyle={styles.emptyCardContainer}
              />
            )}
            ListFooterComponent={renderFooter}
            renderItem={renderListItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </View>

      <ConfirmationBottomSheet
        ref={deleteSheetRef}
        icon={<Svgs.deleteAcc height={hp(10)} />}
        title={deleteBtmSheetContent.heading}
        description={deleteBtmSheetContent.description}
        onConfirm={() => {
          deleteBtmSheetContent.OnDeletePress();
        }}
        onCancel={() => {
          deleteSheetRef.current?.close();
          setSelectedItem(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
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
            title: 'Delete Employee',
            onPress: () => {
              selectorBottomSheetRef.current?.close();
              setTimeout(() => {
                deleteSheetRef.current?.open();
              }, 300);
            },
          },
        ]}
      />
      <UpdateStatusBtmSheet
        refRBSheet={updateStatusBtmSheetRef}
        onApplyFilters={handleUpdateStatus}
        dropdownData={dropdownData}
        currentStatus={selectedItem?.status}
      />
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Update Attendance Scehedule'}
          onPress={() =>
            navigation.navigate(SCREENS.ADDDEPARTMENTATTENDANCESETTINGS, {
              DepId: item.id,
              settings: attendanceSettings?.hasSettings
                ? attendanceSettings
                : null,
            })
          }
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>
    </View>
  );
};

export default DepartmentDetails;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerContainer: {
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
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      padding: wp(2),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.9),
    },
    value: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp(0.5),
      marginBottom: hp(1),
    },
    listContainer: {
      paddingHorizontal: wp(2),
      paddingBottom: hp(15),
    },
    employeeCardStyle: {
      marginBottom: hp(1),
    },
    flatListContainer: {
      marginBottom: wp(1.5),
      marginTop: wp(3),
      // margin: wp(4),
    },
    tabsContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginBottom: hp(2),
      borderRadius: wp(2),
      paddingVertical: wp(3),
      marginHorizontal: wp(4),
      marginBottom: hp(2),
    },
    ChartText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },

    iconWrapper: {
      height: hp(2),
      width: hp(2),
      borderRadius: hp(2.25),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(1),
    },

    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,

      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    cancelBtn: {
      backgroundColor: isDarkMode ? Colors.error : Colors.error,
    },

    reportHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
     
      paddingHorizontal: wp(2),
    },
    rowView: {flexDirection: 'row', alignItems: 'center'},
    headingText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    workerStatusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    headerRow: {
      flexDirection: 'row',
      gap: wp(2),
      alignItems: 'center',
       borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      paddingBottom: hp(1),
      marginBottom: hp(1),
    
    },
  });
