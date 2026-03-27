import moment from 'moment';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
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
import DashboardCard from '@components/Cards/DashboardCard';
import EmptyCard from '@components/Cards/EmptyCard';
import TodayLogsCard from '@components/Cards/TodayLogsCard';
import Loader from '@components/Loaders/loader';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import {t} from 'i18next';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const getStatus = status => {
  if (!status) return 'Unknown';

  const statusMap = {
    CLOCK_IN: 'Clock In',
    CLOCK_OUT: 'Clock Out',
    BREAK: 'Break Start',
    BACK_FROM_BREAK: 'Break End',
    ABSENT: 'Absent',
    PRESENT: 'Present',
    LATE_ARRIVAL: 'Late Clock In',
    ON_LEAVE: 'On Leave',
  };

  return statusMap[status] || status;
};
const getStatusColor = status => {
  if (!status) return '#808080'; // Gray for unknown
  const statusMap = {
    CLOCK_IN: '#579DFF', // Green
    CLOCK_OUT: '#FB923C', // Blue
    BREAK: '#FB923C', // Yellow
    BACK_FROM_BREAK: '#34D399', // Orange
    ABSENT: '#DC3545', // Red
    PRESENT: '#34D399', // Green
    LATE_ARRIVAL: '#DC3545', // Deep Orange
    ON_LEAVE: '#FACC15', // Purple
  };

  return statusMap[status] || '#34D399'; // default green
};

const WorkerItem = memo(({item, navigation}) => {
  if (!item) return null;

  return (
    <View style={{paddingHorizontal: wp(5), paddingVertical: hp(0.8)}}>
      <TodayLogsCard
        item={item}
        onPress={() => {
          navigation?.navigate?.(SCREENS.TODAYLOGSATTENDENCEDETAILS, {
            status: item.status || 'unknown',
            item: item,
          });
        }}
      />
    </View>
  );
});

const MapHeader = memo(
  ({
    usersWithLocation,
    isDarkMode,
    t,
    Colors,
    setScrollEnabled,
    isLoading,
    apiData,
    filterApplied,
    refRBSheet,
    clearfilters,
    selectedDate,
    setSelectedDate,
    setIsDatePickerVisible,
    filterState
  }) => {
    const styles = useMemo(
      () => dynamicStyles(isDarkMode, Colors),
      [isDarkMode, Colors],
    );

    return (
      <View style={styles.mapHeaderContainer}>
        <View style={styles.punchHeader}>
          <Text style={styles.punchHeaderText}>
            {apiData.length} {t('Punches')}
          </Text>
          {filterApplied ? (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => clearfilters()}>
              <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => refRBSheet.current?.open()}>
              <Svgs.filter />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={styles.mapWrapper}
          onStartShouldSetResponder={() => setScrollEnabled(false)}>
          {isLoading ? (
            <View
              style={[
                styles.mapImage,
                {justifyContent: 'center', alignItems: 'center'},
              ]}>
              <Loader size={wp(10)} />
            </View>
          ) : (
            <View>
              <LeafLetMapComponent
                initialZoom={1}
                markers={usersWithLocation}
                style={styles.mapImage}
                initialMarkerTitle={'Current Location'}
                showSearch={false}
                showCurrentLocation={false}
                shouldShowInitialMarker={false}
              />
              <Text style={styles.mapText}>
                {t('Only records with valid Latitude/Longitude are shown')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(true)}
            style={styles.mapDateContainer}>
            <Text style={styles.mapDateText}>
              {moment(filterState.selectedDate).format('D MMM, YYYY')}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={RFPercentage(3)}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* <View
          style={styles.sectionHeader}
          onStartShouldSetResponder={() => setScrollEnabled(true)}>
          <Text style={styles.sectionTitle}>
            {t ? t('Employee') : 'Employee'}
          </Text>
          <Text style={styles.sectionTitle}>{t ? t('Status') : 'Status'}</Text>
        </View> */}
      </View>
    );
  },
);

const DashboardSection = ({data, isDarkMode, Colors, filterState}) => {
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );
  const renderDashboardItem = useCallback(
    ({item, index}) => {
      return (
        <View style={styles.dashboardItemWrapper}>
          <DashboardCard
            title={item.title || ''}
            value={item.value || '0'}
            // onPress={() => item.onPress && item.onPress()}
            isSelected={item.status === filterState?.selectedStatus}
          />
        </View>
      );
    },
    [styles, filterState],
  );

  const keyExtractor = useCallback(
    (item, index) => item.id?.toString() || `dashboard_${index}`,
    [],
  );

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.dashboardSection}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dashboardListContainer}
        renderItem={renderDashboardItem}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
};

const WorkerList = ({
  data,
  isLoadingMore,
  refreshing,
  onRefresh,
  onLoadMore,
  navigation,
  isDarkMode,
  selectedDate,
  setSelectedDate,
  t,
  usersWithLocation,
  Colors,
  isLoading,
  filterApplied,
  refRBSheet,
  clearfilters,
  apiData,
  setIsDatePickerVisible,
  filterState
}) => {
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  const [scrollEnabled, setScrollEnabled] = useState(true);

  const renderWorkerItem = useCallback(
    ({item, index}) => (
      <WorkerItem key={index} item={item} navigation={navigation} />
    ),
    [navigation],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyStateContainer}>
        <EmptyCard
          icon={<Svgs.emptyUser height={hp(12)} width={hp(12)} />}
          heading={t ? t('No Employees') : 'No Employees'}
          subheading={
            t ? t('No employees available yet') : 'No employees available yet'
          }
        />
      </View>
    ),
    [styles, t],
  );

  const renderFooter = useCallback(
    () =>
      isLoadingMore ? (
        <View style={styles.footerLoader}>
          <Loader size={wp(8)} />
        </View>
      ) : null,
    [isLoadingMore, styles],
  );

  const keyExtractor = useCallback(
    (item, index) => item.id?.toString() || `worker_${index}`,
    [],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={[Colors?.darkTheme?.primaryColor || '#007AFF']}
        refreshing={refreshing}
        onRefresh={onRefresh}
        progressBackgroundColor={
          isDarkMode
            ? Colors?.darkTheme?.secondaryColor || '#1C1C1E'
            : Colors?.lightTheme?.backgroundColor || '#FFFFFF'
        }
        tintColor={isDarkMode ? '#FFFFFF' : '#007AFF'}
      />
    ),
    [refreshing, onRefresh, isDarkMode],
  );

  return (
    <FlatList
      data={data}
      scrollEnabled={scrollEnabled}
      keyExtractor={keyExtractor}
      renderItem={renderWorkerItem}
      onStartShouldSetResponder={() => setScrollEnabled(true)}
      onTouchMove={() => setScrollEnabled(true)}
      refreshControl={refreshControl}
      contentContainerStyle={styles.workerListContent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.2}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={
        <MapHeader
          usersWithLocation={usersWithLocation}
          isDarkMode={isDarkMode}
          t={t}
          Colors={Colors}
          scrollEnabled={scrollEnabled}
          setScrollEnabled={setScrollEnabled}
          isLoading={isLoading}
          apiData={apiData}
          filterApplied={filterApplied}
          refRBSheet={refRBSheet}
          clearfilters={clearfilters}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setIsDatePickerVisible={setIsDatePickerVisible}
          filterState={filterState}
        />
      }
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={11}
      removeClippedSubviews={true}
    />
  );
};

const TodayLogs = ({
  navigation,
  loadMoreData,
  apiData = [],
  isLoading = false,
  isLoadingMore = false,
  refreshing = false,
  onRefresh,
  overViewCardsData = [],
  filterApplied = false,
  refRBSheet = null,
  filterState = {},
  onApplyFilters = () => {},
  clearfilters = () => {},
}) => {
  const {isDarkMode, Colors} = useSelector(store => store?.theme || {});
  const {t} = useTranslation();
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );

  const safeApiData = useMemo(
    () => (Array.isArray(apiData) ? apiData : []),
    [apiData],
  );

  const safeOverViewCardsData = useMemo(
    () => (Array.isArray(overViewCardsData) ? overViewCardsData : []),
    [overViewCardsData],
  );

  const usersWithLocation = useMemo(() => {
    if (!Array.isArray(safeApiData) || safeApiData.length === 0) return [];

    return safeApiData
      .filter(
        item =>
          item?.location?.coordinates?.lat != null &&
          item?.location?.coordinates?.lng != null &&
          !isNaN(item.location.coordinates.lat) &&
          !isNaN(item.location.coordinates.lng),
      )
      .map(item => ({
        lat: parseFloat(item.location.coordinates.lat),
        lng: parseFloat(item.location.coordinates.lng),
        fullName: item?.fullName || 'Unknown',
        title: item?.fullName || 'Unknown',
        email: item?.email || '',
        status: getStatus(item?.lastStatus),
        color: getStatusColor(item?.lastStatus),
      }));
  }, [safeApiData]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && loadMoreData) {
      loadMoreData();
    }
  }, [isLoadingMore, loadMoreData]);

  return (
    <View style={styles.container}>
      <DashboardSection
        data={safeOverViewCardsData}
        isDarkMode={isDarkMode}
        Colors={Colors}
        filterState={filterState}
      />

      <View style={styles.mainContent}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader size={wp(10)} />
            <Text style={styles.loadingText}>
              {t ? t('Loading employee...') : 'Loading employee...'}
            </Text>
          </View>
        ) : (
          <WorkerList
            data={safeApiData}
            isLoadingMore={isLoadingMore}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onLoadMore={handleLoadMore}
            navigation={navigation}
            isDarkMode={isDarkMode}
            t={t}
            usersWithLocation={usersWithLocation}
            Colors={Colors}
            isLoading={isLoading}
            filterApplied={filterApplied}
            refRBSheet={refRBSheet}
            clearfilters={clearfilters}
            apiData={safeApiData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setIsDatePickerVisible={setIsDatePickerVisible}
            filterState={filterState}
          />
        )}
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onClose={() => setIsDatePickerVisible(false)}
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');
          setSelectedDate(formatted);
        
          onApplyFilters({
            selectedDate: formatted,
            status: filterState?.selectedStatus,
          });
          
          setIsDatePickerVisible(false);
        }}
      />
    </View>
  );
};

export default TodayLogs;

const dynamicStyles = (isDarkMode, Colors) => {
  const darkTheme = Colors?.darkTheme || {
    secondaryColor: '#1C1C1E',
    primaryTextColor: '#FFFFFF',
    borderGrayColor: '#3A3A3C',
    primaryColor: '#007AFF',
    cardBackground: '#2C2C2E',
  };

  const lightTheme = Colors?.lightTheme || {
    backgroundColor: '#FFFFFF',
    primaryTextColor: '#000000',
    borderGrayColor: '#E5E5EA',
    cardBackground: '#F2F2F7',
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    mainContent: {
      flex: 1,
      backgroundColor: isDarkMode
        ? darkTheme.secondryColor
        : lightTheme.backgroundColor,
    },
    mapText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: Colors.lightTheme.secondryTextColor,
      marginTop: hp(1),
      marginLeft: wp(4),
    },
    dashboardSection: {
      backgroundColor: currentTheme.backgroundColor,
      paddingVertical: hp(1.5),
    },
    dashboardListContainer: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.5),
    },
    dashboardItemWrapper: {
      marginRight: wp(3),
    },
    mapHeaderContainer: {
      backgroundColor: currentTheme.backgroundColor,
    },
    mapWrapper: {
      position: 'relative',
      marginHorizontal: wp(5),
      borderRadius: 12,
      overflow: 'hidden',
    },
    mapImage: {
      width: '100%',
      height: hp(32),
      backgroundColor: currentTheme.cardBackground,
    },
    mapDateContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? hp(2) : hp(2),
      right: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(3.5),
      paddingVertical: hp(1),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
    },
    mapDateText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontWeight: '500',
    },
    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? darkTheme.BorderGrayColor
        : lightTheme.BorderGrayColor,
      backgroundColor: currentTheme.backgroundColor,
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
      color: currentTheme.primaryTextColor,
      fontWeight: '600',
      letterSpacing: 0.3,
    },

    // Worker List
    workerListContent: {
      flexGrow: 1,
      paddingBottom: hp(2),
    },
    workerItemContainer: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(0.8),
    },

    // Empty State
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: hp(40),
      paddingHorizontal: wp(10),
    },

    // Loading States
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: hp(50),
    },
    footerLoader: {
      paddingVertical: hp(3),
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: currentTheme.primaryTextColor,
      marginTop: hp(2),
      opacity: 0.7,
    },
    punchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(3),
      paddingBottom: hp(2),
      borderRadius: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },

    punchHeaderText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
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
  });
};
