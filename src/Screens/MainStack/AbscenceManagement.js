import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
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
import AbscenceFilterBtmSheet from '@components/BottomSheets/AbscenceFilterBtmSheet';
import EditAbsenceBottomSheet from '@components/BottomSheets/EditAbsenceBottomSheet';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import AbscenceCard from '@components/Cards/AbscenceCard';
import DashboardCard from '@components/Cards/DashboardCard';
import EmptyCard from '@components/Cards/EmptyCard';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {exportAbsenceExcel, exportAbsencePDF} from '@utils/exportUtils';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import AbsenceCalendar from './AbsenceCalendar';
import {getPendingActions, removePendingAction} from '@utils/sqlite';
import PendingRequestCard from '@components/Cards/PendingRequestCard';
import logger from '@utils/logger';
import {t} from 'i18next';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';

const INITIAL_FILTERS = {
  worker: null,
  datefrom: null,
  dateto: null,
  filterApplied: false,
  searchText: null,
  status: null,
  showSearch: false,
  type: null,
};

// Reusable SummaryCard Component
const SummaryCard = ({data, type, icon, isDarkMode, Colors}) => {
  const styles = cardStyles(isDarkMode, Colors);
  const renderTypeCard = () => (
    <>
      <Text style={styles.cardTitle}>
        {t(
          data[0].replace(/_/g, ' ') === 'MEDICAL'
            ? 'SICK LEAVE'
            : data[0].replace(/_/g, ' '),
        )}
      </Text>
      <Text style={styles.statText}>
        {data[1].count} {t(data[1].count === 1 ? 'Absence' : 'Absences')}
      </Text>
      <Text style={styles.statText}>
        {data[1].days} {t(data[1].days === 1 ? 'Day' : 'Days')}
      </Text>
      <Text style={styles.percentageText}>{data[1].percentage}%</Text>
    </>
  );

  const renderWorkerCard = () => (
    <>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.cardTitle}>{data[1].workerName}</Text>
      <Text style={styles.statText}>
        {data[1].totalAbsences}{' '}
        {t(data[1].totalAbsences === 1 ? 'Absence' : 'Absences')}
      </Text>
      {data[1].totalDays !== undefined && (
        <Text style={styles.statText}>
          {data[1].totalDays} {t(data[1].totalDays === 1 ? 'Day' : 'Days')}
        </Text>
      )}
    </>
  );

  return (
    <View style={styles.cardContainer}>
      {type === 'type' ? renderTypeCard() : renderWorkerCard()}
    </View>
  );
};

const AbscenceManagement = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const btmSheetRef = useRef(null);
  const {showAlert} = useAlert();
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language, company} = useSelector(store => store.auth);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const {workers} = useSelector(store => store.states);
  const [selectedItem, setSelectedItem] = useState(null);
  const filterSheetRef = useRef();
  const editSheetRef = useRef();
  const [totalRecords, setTotalRecords] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isCalenderView, setIsCalenderView] = useState(false);
  const [isConnectedState, setIsConnectedState] = useState(true);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('attendance');
  const [fitlerAbsenceType, setFilterAbsenceType] = useState([]);

  const [summary, setSummary] = useState({});

  // Calendar state
  const [calendarAbsences, setCalendarAbsences] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

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

  const columnHeaders = {
    ID: t('ID'),
    Worker: t('Employee'),
    Emp: t('Employee ID'),
    Department: t('Department'),
    Type: t('Type'),
    Paid: t('Paid'),
    Start: t('Start'),
    End: t('End'),
    Source: t('Source'),
    Partial: t('Partial'),
    PartialS: t('Partial Start'),
    PartialE: t('Partial End'),
    Comment: t('Comment'),
    Created: t('Created At'),
  };

  const companyLogo = company?.logo_url
    ? company?.logo_url
    : 'https://backend.biometricpro.app/api/uploads/profile-pictures/profile-1763719661642-489726642.png';

  const bottomSheetOptions = useMemo(
    () => [
      {
        icon: <Svgs.pdf height={hp(4)} />,
        title: 'Export to PDF',
        onPress: () => {
          btmSheetRef.current?.close();
          exportAbsencePDF(
            apiData,
            showAlert,
            t('Absence Report'),
            columnHeaders,
            companyLogo,
          );
        },
      },
      {
        icon: <Svgs.excel height={hp(4)} />,
        title: 'Export to Excel',
        onPress: () => {
          btmSheetRef.current?.close();
          exportAbsenceExcel(apiData, showAlert, columnHeaders);
        },
      },
    ],
    [apiData],
  );

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      worker: null,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      type: null,
    }));
  }, []);

  // Calendar helper functions
  const getDateRange = useCallback(date => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    };
  }, []);

  // Transform API data to calendar events
  const transformApiAbsences = useCallback(
    (apiCalendarData, mode) => {
      const absencesByDate = {};

      // Process calendar data
      apiCalendarData.forEach(dateData => {
        const dateStr = dateData.date;
        if (dateData.absences && Array.isArray(dateData.absences)) {
          dateData.absences.forEach(absence => {
            const absenceDate = new Date(dateStr);

            const absenceObj = {
              id: absence.id.toString(),
              title: absence.name,
              description: absence.comment || absence.name,
              start: new Date(dateStr),
              end: new Date(dateStr),
              color: absence.color,
              type: absence.type,
              name: absence.name,
              comment: absence.comment,
              isPaid: absence.isPaid,
              isPartial: absence.isPartial,
              worker: absence.worker,
              date: dateStr,
            };

            if (!absencesByDate[dateStr]) {
              absencesByDate[dateStr] = [];
            }
            absencesByDate[dateStr].push(absenceObj);
          });
        }
      });

      const calendarEvents = [];
      Object.entries(absencesByDate).forEach(([date, dateAbsences]) => {
        // For multiple absences on same day, group them
        if (dateAbsences.length === 1) {
          dateAbsences.forEach(absence => {
            calendarEvents.push(absence);
          });
        } else {
          const firstAbsence = dateAbsences[0];
          calendarEvents.push({
            id: `group_${date}`,
            title: `${dateAbsences.length} ${t('Absences')}`,
            description: `${dateAbsences.length} ${t('absences scheduled')}`,
            start: firstAbsence.start,
            end: firstAbsence.end,
            color: '#4A90E2',
            isGroup: true,
            absences: dateAbsences,
            date: date,
          });
        }
      });

      return calendarEvents;
    },
    [t],
  );

  // Fetch absences for calendar
  const fetchAbsences = useCallback(
    async date => {
      try {
        setCalendarLoading(true);
        const {startDate, endDate} = getDateRange(date);

        const {ok, data: response} = await fetchApis(
          `${baseUrl}/absences/admin/absences/calendar?start_date=${startDate}&end_date=${endDate}`,
          'GET',
          null,
          null,
          null,
          {Authorization: `Bearer ${token}`},
        );
        console.log(startDate, endDate);

        ApiResponse(showAlert, response, language);

        if (response?.data?.calendar?.calendar) {
          const transformedAbsences = transformApiAbsences(
            response.data.calendar.calendar,
            'month',
          );
          setCalendarAbsences(transformedAbsences);
        } else {
          setCalendarAbsences([]);
        }
      } catch (error) {
        logger.error('❌ Error fetching absence calendar:', error, {
          context: 'AbscenceManagement',
        });
        setCalendarAbsences([]);
      } finally {
        setCalendarLoading(false);
      }
    },
    [, token, language, showAlert],
  );

  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      worker: data.workerId,
      type: data.type,
      filterApplied: true,
    }));
  }, []);

  const buildApiUrl = (pageNumber, resetSearch = true) => {
    let url = `${baseUrl}/absences/admin/absences?page=${pageNumber}&limit=10`;

    const filterParams = [
      filters.datefrom && `start_date=${filters.datefrom}`,
      filters.dateto && `end_date=${filters.dateto}`,
      filters.worker && `worker_id=${filters.worker}`,
      filters.type && `absence_type=${filters.type}`,
      !resetSearch && filters.searchText && `search=${filters.searchText}`,
    ].filter(Boolean);

    if (filterParams.length) {
      url += `&${filterParams.join('&')}`;
    }


    return url;
  };

  const fetchData = async (reset = false, resetSearch = true) => {
    if (isLoading || (!reset && !hasNext)) return;

    const loadingState = reset ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const currentPage = reset ? 1 : page;
      const url = buildApiUrl(currentPage, resetSearch);
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
        logger.log('Fetch error:', responseData, {
          context: 'AbscenceManagement',
        });
        return;
      }

      const fetchedData = responseData?.data.absences || [];
      setSummary(responseData?.data.summary);
      setTotalRecords(responseData?.data.pagination.totalRecords);

      setApiData(prev => (reset ? fetchedData : [...prev, ...fetchedData]));

      setHasNext(responseData?.data.pagination.hasNext || false);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'AbscenceManagement'});
      showAlert('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      if (reset) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetPagination();
    fetchData(true);
    checkConnectivity();
    gettPendingActions();
  }, [resetPagination]);

  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingMore && !isLoading) {
      fetchData(false);
    }
  }, [hasNext, isLoadingMore, isLoading, fetchData]);

  const renderAbsenceItem = useCallback(({item, index}) => {
    return (
      <AbscenceCard
        item={item}
        onEditPress={async () => {
          const connected = await checkConnectivity();
          if (!connected) {
            showAlert(
              'Editing requires internet connection. Please try again when online.',
              'error',
            );
          } else {
            editSheetRef.current.open();
            setSelectedItem(item);
          }
        }}
        key={`request-${item.id || index}`}
        loading={item.id === selectedItem?.id && commentLoading}
      />
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <Loader size={wp(10)} />
        </View>
      );
    }
    return null;
  }, [isLoadingMore, t, styles]);

  // Header component with all summary sections
  const renderHeader = useCallback(
    () => (
      <>
        {/* Summary Cards */}
        <View>
          <FlatList
            data={summaryCardsData}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <DashboardCard
                title={item.title}
                value={item.value}
                subText={item.subText}
              />
            )}
          />
        </View>

        {/* Absence by Type Section */}
        <View style={{marginTop: hp(2)}}>
          <Text style={styles.TabHeading}>{t('Absence by Type')}</Text>
          <FlatList
            data={Object.entries(summary.byType || {})}
            keyExtractor={([type]) => type}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: hp(1)}}
            renderItem={({item}) => (
              <SummaryCard
                data={item}
                type="type"
                icon={<Svgs.WorkerActive height={hp(4)} />}
                isDarkMode={isDarkMode}
                Colors={Colors}
              />
            )}
          />
        </View>

        {Object.entries(summary.byWorker || {}).length > 0 && (
          <View style={{marginTop: hp(2)}}>
            <Text style={styles.TabHeading}>{t('Absence by Employee')}</Text>
            <FlatList
              data={Object.entries(summary.byWorker || {})}
              keyExtractor={([workerId]) => workerId}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: hp(1)}}
              renderItem={({item}) => (
                <SummaryCard
                  data={item}
                  type="worker"
                  icon={<Svgs.WorkerActive height={hp(4)} />}
                  isDarkMode={isDarkMode}
                  Colors={Colors}
                />
              )}
            />
          </View>
        )}

        {/* Most Absent Worker Section */}
        {summary.mostAbsentWorker && (
          <View style={{marginTop: hp(2)}}>
            <Text style={styles.TabHeading}>{t('Most Absent Employee')}</Text>
            <SummaryCard
              data={[null, summary.mostAbsentWorker]}
              type="worker"
              icon={<Svgs.WorkerActive height={hp(4)} />}
              isDarkMode={isDarkMode}
              Colors={Colors}
            />
          </View>
        )}

        {/* Calendar or List View Toggle */}
        <View style={[styles.rowViewSB, {marginTop: hp(2)}]}>
          <Text style={styles.TabHeading}>
            {`${totalRecords} ${t('Total Records')}`}
          </Text>
          {!isCalenderView &&
            apiData.length > 0 &&
            (filters.filterApplied ? (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={clearFilters}>
                <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={async () => {
                  const connected = await checkConnectivity();
                  if (!connected) {
                    showAlert(
                      'Filtering requires internet connection. Please try again when online.',
                      'error',
                    );
                  } else {
                    filterSheetRef.current?.open();
                  }
                }}>
                <Svgs.filter />
              </TouchableOpacity>
            ))}
        </View>

        {/* Calendar or List View Content - Only render when needed */}
        {isCalenderView && (
          <View style={styles.listContainer}>
            <AbsenceCalendar
              absences={calendarAbsences}
              currentDate={currentCalendarDate}
              setCurrentDate={setCurrentCalendarDate}
              loading={calendarLoading}
              showDailyView={false}
            />
          </View>
        )}
      </>
    ),
    [
      summary,
      summaryCardsData,
      t,
      styles,
      isDarkMode,
      Colors,
      totalRecords,
      apiData.length,
      filters.filterApplied,
      clearFilters,
      isCalenderView,
    ],
  );

  // Apply filters effect - only trigger on actual filter changes
  useEffect(() => {
    resetPagination();
      fetchData(true);
      gettPendingActions();
      checkConnectivity();
      getAbsenceTypes();

  }, [
    filters.datefrom,
    filters.dateto,
    filters.worker,
    filters.type,
    filters.searchText,
  ]);

  // Fetch calendar data when calendar view is activated
  useEffect(() => {
    if (isCalenderView) {
      fetchAbsences(currentCalendarDate);
    }
  }, [isCalenderView, currentCalendarDate]);

  // useFocusEffect(
  //   useCallback(() => {
  //     resetPagination();
  //     console.log('aadas')
  //     fetchData(true);
  //     getAbsenceTypes();
  //   }, []),
  // );

  const getAbsenceTypes = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/absences/admin/absences/types`,
        'GET',
        null,
        null,
        null,
        {Authorization: `Bearer ${token}`},
      );

      if (ok) {
        const types =
          data?.data?.absenceTypes?.map(item => ({
            label: item.name,
            value: item.code,
          })) || [];
        setFilterAbsenceType(types || []);
      } else {
        showAlert('Something went wrong while getting absence types', 'error');
      }
    } catch (error) {
      logger.error('Error fetching absence types:', error, {
        context: 'AbscenceManagement',
      });
    }
  }, [token, showAlert]);

  const updateComment = async comment => {
    setCommentLoading(true);
    const {ok, data} = await fetchApis(
      `${baseUrl}/absences/admin/absences/${selectedItem.id}/comment`,
      'PUT',
      setCommentLoading,
      {
        comment: comment,
      },
      showAlert,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    );

    ApiResponse(showAlert, data, language);

    if (ok && !data.error) {
      // showAlert(data.message, 'success');
      editSheetRef.current.close();
      resetPagination();
      fetchData(true);
      setSelectedItem(null);
    } else {
      setSelectedItem(null);
    }
  };

  const summaryCardsData = useMemo(() => {
    return [
      {
        title: 'Total Absences',
        value: summary.totalAbsences,
      },
      {
        title: 'Paid Absences',
        value: summary.paidAbsences,
      },
      {
        title: 'Unpaid Absences',
        value: summary.unpaidAbsences,
      },
      {
        title: 'Total Days',
        value: summary.totalDays,
      },
      {
        title: 'Paid Days',
        value: summary.paidDays,
      },
      {
        title: 'Unpaid Days',
        value: summary.unpaidDays,
      },
    ];
  }, [summary]);

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

  const checkConnectivity = async (showFeedback = true) => {
    try {
      const connected = await isConnected();
      setIsConnectedState(connected);

      return connected;
    } catch (error) {
      logger.error('Connectivity check failed:', error, {
        context: 'AbscenceManagement',
      });
      setIsConnectedState(false);
      return false;
    }
  };
  const gettPendingActions = async (actionType = 'ADD_ABSCENCE') => {
    try {
      const pending = await getPendingActions(actionType);
      logger.log('pending', pending, {context: 'AbscenceManagement'});

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
        context: 'AbscenceManagement',
      });
    }
  };

  const handleCancelPendingAction = async id => {
    try {
      await removePendingAction(id);
      gettPendingActions();
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'AbscenceManagement',
      });
    }
  };

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
      const payload = {
        worker_id: data.worker_id,
        absence_type_id: data.absence_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        comment: data.comment,
        is_partial: data.is_partial,
        partial_start_time: data.partial_start_time,
        partial_end_time: data.partial_end_time,
      };

      const {ok, data: responseData} = await fetchApis(
        `${baseUrl}/absences/admin/absences`,
        'POST',
        null,
        payload,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      // Always display API response
      ApiResponse(showAlert, responseData, language);
      await removePendingAction(item.id);
      gettPendingActions();
      // Success handling
      if (ok && !responseData?.error) {
        logger.log(responseData, {context: 'AbscenceManagement'});
      }
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'AbscenceManagement',
      });
      showAlert('Sync failed. Please try again.', 'error');
    } finally {
      onRefresh();
      setIsPendingLoading(false);
    }
  };

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

  return (
    <View style={styles.container}>
      {renderOfflineBanner()}
      <StackHeader
        title={t('Absence Management')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        rightIcon={
          isCalenderView ? (
            <Svgs.listView height={hp(5.5)} />
          ) : (
            <Svgs.calenderL />
          )
        }
        rightIconPress={() => {
          setIsCalenderView(!isCalenderView);
        }}
        rightIcon2={
          isDarkMode ? (
            <Svgs.exportD height={hp(4)} />
          ) : (
            <Svgs.exportL height={hp(5)} width={hp(4)} />
          )
        }
        rightIconPress2={() => {
          btmSheetRef.current?.open?.();
        }}
      />

      {hasFeature === false && (
        <UpgradeFeatureView
          navigation={navigation}
          featureName="Absence Management"
        />
      )}

      <View style={styles.contentContainerStyle}>
        {/* Pending Requests Section */}
        {pendingActions.length > 0 && (
          <View style={styles.pendingRequestMainContainer}>
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
        )}

        {/* Main FlatList with all sections */}
        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loader />
          </View>
        ) : (
          <FlatList
            data={isCalenderView ? [] : apiData}
            renderItem={renderAbsenceItem}
            keyExtractor={(item, index) => `request-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            style={styles.flatListStyle}
            ListEmptyComponent={
              isCalenderView ? null : (
                <EmptyCard
                  icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
                  heading="Empty!"
                  subheading={'No Data Found'}
                  containerStyle={{paddingVertical: hp(5)}}
                />
              )
            }
          />
        )}
      </View>

      <AbscenceFilterBtmSheet
        refRBSheet={filterSheetRef}
        workers={workers}
        height={hp(65)}
        onApplyFilters={onApplyFilters}
        fitlerAbsenceType={fitlerAbsenceType}
      />

      <EditAbsenceBottomSheet
        refRBSheet={editSheetRef}
        onSubmit={comment => updateComment(comment)}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate(SCREENS.ADDABSCENCE);
        }}>
        <Svgs.whitePlus height={hp(5)} width={wp(5)} />
      </TouchableOpacity>

      <ReusableBottomSheet
        height={hp('25%')}
        refRBSheet={btmSheetRef}
        sheetTitle="Select An Option"
        options={bottomSheetOptions}
      />
    </View>
  );
};

export default AbscenceManagement;

// Styles for SummaryCard component
const cardStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    cardContainer: {
      padding: hp(2),
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginRight: wp(3),
      minWidth: wp(35),
      alignItems: 'flex-start',
    },
    iconContainer: {
      marginBottom: hp(1),
    },
    cardTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
    statText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.3),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(0.5),
    },
    percentageText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      marginTop: hp(0.5),
    },
  });

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
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
    contentContainerStyle: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(1),
      marginLeft: wp(1.5),
      padding: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    TabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    listContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(4),
      flex: 1,
      marginBottom: hp(2),
    },
    flatListStyle: {
      flex: 1,
    },
    flatListContent: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
    },
    title: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(1),
    },
    loadingContainer: {
      padding: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    loadingText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
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
  });
