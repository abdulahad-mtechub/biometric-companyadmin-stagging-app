import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Svgs} from '@assets/Svgs/Svgs';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import TabSelector from '@components/TabSelector/TabSelector';
import TodayLogs from './Tabs/TodayLogs';
import UnvalidatedPunches from './Tabs/UnvalidatedPunches';
import ManualCorrections from './Tabs/ManualCorrections';
import AttendanceHistory from './Tabs/AttendanceHistory';
import {SCREENS} from '@constants/Screens';
import {useTranslation} from 'react-i18next';
import {useApiData, useUnvalidatedPunches} from '@utils/Hooks/Hooks';
import moment from 'moment';
import {useAlert} from '@providers/AlertContext';
import {baseUrl} from '@constants/urls';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import AttendenceFilterBtmSheet from '@components/BottomSheets/AttendenceFilterBtmSheet';
import {useFocusEffect} from '@react-navigation/native';
import AttendenceSettings from './Tabs/AttendenceSettings';
import DashboardCard from '@components/Cards/DashboardCard';
import SubscriptionAlertBanner from '@components/SubscriptionAlertBanner/SubscriptionAlertBanner';
import AttendenceTodaysLogsFilterBtmSheet from '@components/BottomSheets/AttendenceTodaysLogsFilterBtmSheet';
import logger from '@utils/logger';
import TxtInput from '@components/TextInput/Txtinput';
import {pxToPercentage} from '@utils/responsive';

const AttendanceHistoryStatusOptions = [
  {label: 'Present', value: 'PRESENT'},
  {label: 'Absent', value: 'ABSENT'},
  {label: 'Late Clock In', value: 'LATE_ARRIVAL'},
  {label: 'Early Out', value: 'EARLY_OUT'},
  {label: 'Late and Early Out', value: 'LATE_AND_EARLY_OUT'},
  {label: 'Invalid', value: 'HAS_ISSUES'},
  {label: 'Half Day', value: 'HALF_DAY'},
  {label: 'Overtime', value: 'OVERTIME'},
];
const UnvalidatedStatusOptions = [
  {label: 'Validated', value: 'Validated'},
  {label: 'Invalid', value: 'Invalid'},
  {label: 'Pending', value: 'Pending'},
];

const Attendance = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const status = route?.params?.status || null;
  const tab = route?.params?.tab || null;
  const styles = dynamicStyles(isDarkMode, Colors);
  const [selectedTab, setSelectedTab] = useState("Today's Logs");
  const {t} = useTranslation();
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const btmSheetRef = useRef();
  const btmTodayLogsSheetRef = useRef();
  const [overViewCardsData, setOverViewCardsData] = useState({});
  const {workers} = useSelector(store => store.states);
  const {totalCount} = useSelector(store => store.messageSlice);
  const [hasCustomFilter, setHasCustomFilter] = useState(false);
  const {
    unValidatedPunchesCount,
    isLoading: unValidatedLoading,
    getUnvalidatedPunches,
  } = useUnvalidatedPunches();
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterState, setFilterState] = useState({
    startDate: null,
    endDate: null,
    selectedWorker: null,
    selectedStatus: null,
    selectedDate: moment().format('YYYY-MM-DD'),
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

  const buildApiUrl = useCallback(
    (pageNumber, currentTab = selectedTab, filters = filterState) => {
      let url = `${baseUrl}/company-admins/attendance/`;

      if (currentTab === "Today's Logs") {
        url += `today?page=${pageNumber}&date=${filters.selectedDate}`;
        if (filters.selectedStatus) {
          url += `&filter=${filters.selectedStatus}`;
        }
      } else if (currentTab === 'Schedules') {
        url = `${baseUrl}/attendance/admin/schedules`;
        if (filters.startDate) {
          url += `&fromDate=${filters.startDate}`;
        }
        if (filters.endDate) {
          url += `&toDate=${filters.endDate}`;
        }
      } else if (currentTab === 'Attendance History') {
        url += `history?page=1&pageSize=10`;

        if (filters.startDate) {
          url += `&dateFrom=${filters.startDate}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (filters.endDate) {
          url += `&dateTo=${filters.endDate}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (filters.selectedWorker) {
          url += `&workerId=${filters.selectedWorker}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (filters.selectedStatus) {
          url += `&status=${filters.selectedStatus}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (showSearch && searchText.trim())
          url += `&search=${encodeURIComponent(searchText?.trim())}`;
        console.log(url);
      } else if (currentTab === 'Unvalidated Punches') {
        url += `unvalidated?page=${pageNumber}&pageSize=10`;

        if (filters.selectedWorker) {
          url += `&workerId=${filters.selectedWorker}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (filters.selectedStatus) {
          url += `&status=${filters.selectedStatus}`;
          logger.log('🚀 ~ buildApiUrl ~ url:', url, {context: 'Attendance'});
        }
        if (filters.startDate) {
          url += `&dateFrom=${filters.startDate}`;
        }
        if (filters.endDate) {
          url += `&dateTo=${filters.endDate}`;
        }
        if (showSearch && searchText.trim())
          url += `&search=${encodeURIComponent(searchText?.trim())}`;
        console.log(url);
      } else if (currentTab === 'Attendance Settings') {
        url = `${baseUrl}/company-admins/workers?expand=attendanceSettings&page=${pageNumber}&pageSize=20&hasSchedule=true&hasLocation=true`;
        if (showSearch && searchText.trim())
          url += `&search=${encodeURIComponent(searchText?.trim())}`;
        console.log(url);
      }

      console.log(url);

      return url;
    },
    [selectedTab, baseUrl, searchText, showSearch],
  ); // Remove filterState from dependencies
console.log(token)
  const fetchData = async (
    reset = false,
    tabOverride = null,
    filters = filterState,
  ) => {
    if (isLoading || (!reset && !hasNext)) return;

    const loadingState = reset ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const url = buildApiUrl(
        reset ? 1 : page,
        tabOverride || selectedTab,
        filters,
      );

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
        logger.log('Fetch error:', responseData, {context: 'Attendance'});
        ApiResponse(showAlert, responseData, language);
        return;
      }
      // ✅ Ensure data object always exists
      const fetchedData = responseData?.data || {};

      if (selectedTab === "Today's Logs") {
        const rows = fetchedData?.rows ?? [];
        const counters = fetchedData?.counters ?? [];

        setApiData(prevData => (reset ? rows : [...(prevData || []), ...rows]));

        setOverViewCardsData(prevData =>
          reset ? counters : {...prevData, ...counters},
        );
      } else if (selectedTab === 'Unvalidated Punches') {
        const punches = fetchedData?.punches ?? [];
        console.log(punches);
        setApiData(prevData =>
          reset ? punches : [...(prevData || []), ...punches],
        );
      } else if (selectedTab === 'Attendance History') {
        const records = fetchedData?.records ?? [];
        setApiData(prevData =>
          reset ? records : [...(prevData || []), ...records],
        );
      } else if (selectedTab === 'Attendance Settings') {
        const workers = Array.isArray(fetchedData?.workers)
          ? fetchedData.workers
          : [];

        const filteredArray = workers
          .filter(
            item =>
              item?.attendanceSettings?.schedule &&
              item?.attendanceSettings?.workLocation,
          )
          .map(item => ({
            id: item?.id ?? '',
            email: item?.email ?? '',
            fullName: `${item?.first_name ?? ''} ${
              item?.last_name ?? ''
            }`.trim(),
            schedule: item?.attendanceSettings?.schedule ?? '',
            workLocation: item?.attendanceSettings?.workLocation ?? '',
          }));

        setApiData(prevData =>
          reset ? filteredArray : [...(prevData || []), ...filteredArray],
        );
      }

      setHasNext(
        fetchedData?.pagination?.hasNext ??
          fetchedData?.pagination?.has_next ??
          false,
      );
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'Attendance'});
      showAlert('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const filterStateRef = useRef(filterState);

  // Update the ref whenever filterState changes
  useEffect(() => {
    filterStateRef.current = filterState;
  }, [filterState]);

  // Now modify useFocusEffect to use the ref
  useFocusEffect(
    useCallback(() => {
      resetPagination();
      // Use the ref to get the CURRENT filterState, not the one from closure
      fetchData(true, null, filterStateRef.current, 'useFocusEffect');
      getUnvalidatedPunches();
    }, [selectedTab, filterState]), // Only depend on selectedTab
  );

  const loadMoreData = () => {
    if (!isLoadingMore && !isLoading) {
      fetchData(false, null, filterStateRef.current, 'loadMoreData');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    resetPagination();
    await fetchData(true, null, filterStateRef.current, 'onRefresh');
    setRefreshing(false);
  };

  // 5. Update onApplyFilters to pass the new filter state
  const onApplyFilters = data => {
    const newFilterState = {
      startDate: data.date_from,
      endDate: data.date_to,
      selectedWorker: data.workerId,
      selectedStatus: data.status,
      selectedDate: data.selectedDate,
    };

    setApiData([]);
    setFilterState(newFilterState);
    setHasCustomFilter(true);
    btmSheetRef.current?.close();
    resetPagination();

    // Fetch with new filters immediately
    fetchData(true, null, newFilterState, 'onApplyFilters');
  };

  const clearFilters = () => {
    setFilterState({
      startDate: null,
      endDate: null,
      selectedWorker: null,
      selectedStatus: null,
      selectedDate: moment().format('YYYY-MM-DD'),
    });
    setHasCustomFilter(false);
    resetPagination();
    btmSheetRef?.current?.clearFilters();
    btmTodayLogsSheetRef?.current?.clearFilters();
  };

  const handleTabPress = tab => {
    setSelectedTab(tab);
    setFilterState({
      startDate: null,
      endDate: null,
      selectedWorker: null,
      selectedStatus: null,
      selectedDate: moment().format('YYYY-MM-DD'),
    });
    setApiData([]);
    setHasCustomFilter(false);
    resetPagination();
    setSearchText('');
    setShowSearch(false);
  };

  useEffect(() => {
    if (status) {
      const newFilterState = {
        status: status,
      };

      onApplyFilters(newFilterState);
    }

    if (tab) {
      console.log(tab);
      handleTabPress(tab);
    }
  }, [status, tab]);

  // Remove the onApplyFilters call from useEffect since filterState change will trigger useFocusEffect

  const OverViewData = [
    {
      title: 'Active Employees',
      value: overViewCardsData?.activeEmployeeRegistration || '0',
      onPress: () => onApplyFilters({status: 'active_employee'}),
      status: 'active_employee',
    },
    {
      title: 'Clock In',
      value: overViewCardsData?.present || '0',
      onPress: () => onApplyFilters({status: 'present'}),
      status: 'check_in',
    },
    {
      title: 'On Time Clock In',
      value: overViewCardsData?.onTimeClockIn || '0',
      onPress: () => onApplyFilters({status: 'onTimeClockIn'}),
      status: 'onTimeClockIn',
    },
    {
      title: 'Late Clock In',
      value: overViewCardsData?.lateArrivals || '0',
      onPress: () => onApplyFilters({status: 'lateClockIn'}),
      status: 'lateClockIn',
    },
    {
      title: 'Start Break',
      value: overViewCardsData?.breakStart || '0',
      onPress: () => onApplyFilters({status: 'breakStart'}),
      status: 'breakStart',
    },
    {
      title: 'Break End',
      value: overViewCardsData?.breakEnd || '0',
      onPress: () => onApplyFilters({status: 'breakEnd'}),
      status: 'breakEnd',
    },
    {
      title: 'Clock Out',
      value: overViewCardsData?.clockout || '0',
      onPress: () => onApplyFilters({status: 'clockout'}),
      status: 'clockout',
    },
    {
      title: 'On Time Clock Out',
      value: overViewCardsData?.onTimeClockOut || '0',
      onPress: () => onApplyFilters({status: 'onTimeClockOut'}),
      status: 'onTimeClockOut',
    },
    {
      title: 'Late Clock Out',
      value: overViewCardsData?.lateClockOut || '0',
      onPress: () => onApplyFilters({status: 'lateClockOut'}),
      status: 'lateClockOut',
    },
    {
      title: 'Absent',
      value: overViewCardsData?.absent || '0',
      onPress: () => onApplyFilters({status: 'absent'}),
      status: 'absent',
    },
    {
      title: 'Unvalidated Punches',
      value: unValidatedPunchesCount || '0',
      onPress: () => handleTabPress('Unvalidated Punches'),
      status: 'unvalidated_punches',
    },

    // {
    //   title: 'Early Out',
    //   value: overViewCardsData?.earlyOut || '0',
    //   onPress: () => onApplyFilters({status: 'early_out'}),
    //   status: 'early_out',
    // },
    // {
    //   title: 'Leave',
    //   value: overViewCardsData?.leave || '0',
    //   onPress: () => onApplyFilters({status: 'leave'}),
    //   status: 'leave',
    // },
    // {
    //   title: 'Half Leave',
    //   value: overViewCardsData?.halfLeave || '0',
    //   onPress: () => onApplyFilters({status: 'half_leave'}),
    //   status: 'half_leave',
    // },
  ];

  const handleSearch = () => {
    fetchData(true);
    // Keyboard.dismiss(); // Remove this line to keep keyboard open
  };
  const handleReset = useCallback(async () => {
    setSearchText('');
    setShowSearch(false);
    setPage(1);
    setHasNext(false);
    fetchData(true, null, filterStateRef.current);
    console.log('jaadasd', filterState);
    // Don't call fetchData to avoid circular dependency with the useEffect
  }, []);

  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => {
      // If we're closing search, clear the text
      if (prev) {
        setSearchText('');
      } else {
        // If we're opening search, set focus state
      }
      return !prev;
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.ScreenHeading]}>{t('Attendance Management')}</Text>
        <View style={styles.iconContainer}>
          {selectedTab === 'Attendance Settings' && (
            <TouchableOpacity onPress={handleSearchToggle}>
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
      <SubscriptionAlertBanner
        onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
      />
      {showSearch && (
        <TxtInput
          placeholder={t('Search Here')}
          onChangeText={value => {
            console.log(value);
            setSearchText(value);
          }}
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
          // onFocus={() => setIsSearchFocused(true)}
          // onBlur={() => setIsSearchFocused(false)}
          // focusedStyle={isSearchFocused ? styles.focusedInput : {}}
          style={{marginVertical: hp(1), marginHorizontal: wp(4)}}
        />
      )}
      <TabSelector
        tabs={[
          "Today's Logs",
          'Attendance History',
          'Unvalidated Punches',
          'Attendance Settings',
        ]}
        selectedTab={selectedTab}
        onTabPress={handleTabPress}
        isScrollable={true}
      />

      {selectedTab === "Today's Logs" ? (
        <TodayLogs
          navigation={navigation}
          loadMoreData={loadMoreData}
          apiData={apiData || []}
          isLoading={isLoading || false}
          isLoadingMore={isLoadingMore}
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          resetPagination={resetPagination}
          overViewCardsData={OverViewData || []}
          refRBSheet={btmTodayLogsSheetRef}
          filterApplied={hasCustomFilter}
          clearfilters={clearFilters}
          onApplyFilters={onApplyFilters}
          filterState={filterState}
        />
      ) : selectedTab === 'Unvalidated Punches' ? (
        <UnvalidatedPunches
          navigation={navigation}
          loadMoreData={loadMoreData}
          apiData={apiData || []}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          refRBSheet={btmSheetRef}
          resetPagination={resetPagination}
          filterApplied={hasCustomFilter}
          clearfilters={clearFilters}
        />
      ) : selectedTab === 'Attendance History' ? (
        <AttendanceHistory
          navigation={navigation}
          loadMoreData={loadMoreData}
          apiData={apiData}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          refRBSheet={btmSheetRef}
          filterApplied={hasCustomFilter}
          clearfilters={clearFilters}
          refreshing={refreshing || false}
          onRefresh={onRefresh}
        />
      ) : selectedTab === 'Attendance Settings' ? (
        <AttendenceSettings
          navigation={navigation}
          loadMoreData={loadMoreData}
          apiData={apiData}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          refRBSheet={btmSheetRef}
        />
      ) : null}

      <AttendenceFilterBtmSheet
        ref={btmSheetRef}
        onApplyFilters={onApplyFilters}
        showDropDown={
          selectedTab === 'Attendance History' ||
          selectedTab === 'Unvalidated Punches'
        }
        statusOptions={
          selectedTab === 'Attendance History'
            ? AttendanceHistoryStatusOptions
            : UnvalidatedStatusOptions
        }
        workers={workers}
        height={
          selectedTab === 'Attendance History'
            ? hp(75)
            : selectedTab === 'Unvalidated Punches'
            ? hp(55)
            : hp(45)
        }
      />

      <AttendenceTodaysLogsFilterBtmSheet
        ref={btmTodayLogsSheetRef}
        onApplyFilters={(data)=>{onApplyFilters({status:data?.status,selectedDate:filterState?.selectedDate })}}
      />

      {selectedTab === 'Attendance Settings' && (
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate(SCREENS.ADDATTENDANCESETTINGS);
          }}>
          <Svgs.whitePlus />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Attendance;

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
    listContainer: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
    },
    flatListContainer: {
      flexGrow: 1, // Prevent unnecessary growth
      // height: '30%',
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
    filterStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor + '20'
        : Colors.lightTheme.primaryColor + '20',
      marginHorizontal: wp(5),
      marginBottom: hp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      borderRadius: hp(1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    filterStatusText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
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
    mapImage: {
      width: wp(100),
      height: hp(40),
      marginTop: -hp(1.4),
      position: 'relative',
    },
    mapDateContainer: {
      position: 'absolute',
      top: hp(1),
      right: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      padding: hp(1),
      borderRadius: hp(1),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
    },
    mapDateText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    workerStatusContainer: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginBottom: hp(2),
      borderBottomLeftRadius: hp(2),
      borderBottomRightRadius: hp(2),
    },
    workerStatusContentContainer: {
      marginTop: hp(2),
      marginBottom: hp(1),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      paddingBottom: hp(1),
    },
    SubHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    floatingButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(13),
      height: wp(13),
      borderRadius: wp(100),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
      zIndex: 1000,
    },
    rowSb: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: hp(3),
    },
    contentContainerStyle: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
      marginTop: -hp(1.4),
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
