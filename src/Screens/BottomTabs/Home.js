import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Image,
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
import {useDispatch, useSelector} from 'react-redux';
import {DashboardData as dumyCardData} from '@constants/DummyData';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import DashboardCard from '@components/Cards/DashboardCard';
import EmptyCard from '@components/Cards/EmptyCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import {
  setDepartment,
  setLocation,
  setPlanDetails,
  setTrail,
} from '@redux/Slices/authSlice';
import {ApiResponse, capitalize, fetchApis} from '@utils/Helpers';
import TaskCalendar from '@screens/MainStack/TaskCalender';
import SubscriptionAlertBanner from '@components/SubscriptionAlertBanner/SubscriptionAlertBanner';
import {
  useProfile,
  useUnvalidatedPunches,
  useDepartments,
} from '@utils/Hooks/Hooks';
import {getCurrentLocation, useReverseGeocoding, getAddressFromCoordinates ,   extractLocationHierarchy,
} from '@utils/LocationHelpers';
import {
  setAbsenceTypes,
  setAttendanceCounters,
} from '@redux/Slices/globalStatesSlice';
import logger from '@utils/logger';
import Loader from '../../components/Loaders/loader';
import {statusStyles} from '../../Constants/DummyData';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import {pxToPercentage} from '@utils/responsive';
const Home = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {totalCount} = useSelector(store => store.messageSlice);
  const {t} = useTranslation();
  const [requestsData, setRequestsData] = useState([]);
  const scrollRef = useRef(null);
  const {language, token, User, company} = useSelector(store => store.auth);
  const getCurrentSubscribtionStatusURL = `${baseUrl}/company-admins/trial-status`;
  const {showAlert} = useAlert();
  const features = useSelector(store => store.subscription?.features);
  const hasAbsentFeature = features?.includes('absences');
  const dispatch = useDispatch();
  const [taskCalendarData, setTaskCalendarData] = useState([]);
 const [dateRange, setDateRange] = useState({
     startDate: moment().startOf('month').format('YYYY-MM-DD'),
     endDate: moment().endOf('month').format('YYYY-MM-DD'),
   });
    const [currentDate, setCurrentDate] = useState(new Date());
  const [DashboardData, setDashboardData] = useState({
    todayLogsData: [],
    overViewCardsData: [],
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const {
    unValidatedPunchesCount,
    isLoading: unValidatedLoading,
    getUnvalidatedPunches,
  } = useUnvalidatedPunches();
  const {getDepartments} = useDepartments();
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );

  const [refreshing, setRefreshing] = useState(false);
  const {getProfile} = useProfile();
  const [loading, setLoading] = useState(false);

  const getStatus = status => {
    if (!status) return 'Unknown';

    switch (status) {
      case 'CLOCK_IN':
        return 'Clock In';
      case 'CLOCK_OUT':
        return 'Clock Out';
      case 'BREAK':
        return 'Break Start';
      case 'BACK_FROM_BREAK':
        return 'Break End';
      case 'ABSENT':
        return 'Absent';
      case 'PRESENT':
        return 'Present';
      case 'LATE_ARRIVAL':
        return 'Late Clock In';
      default:
        return status;
    }
  };

  const {getAddressFromLatLng} = useReverseGeocoding();

  const getCurrentPosition = useCallback(async () => {
    try {
       const {latitude, longitude} = await getCurrentLocation();
            const {addressComponent, address} = await getAddressFromCoordinates(
              latitude,
              longitude,
            );
            const locationHierarchy = extractLocationHierarchy(addressComponent);
      
           

      dispatch(
        setLocation({
          latitude: latitude,
          longitude: longitude,
          address: address,
          country: locationHierarchy.country,
          city: locationHierarchy.city,
          state: locationHierarchy.state,
        }),
      );
    } catch (err) {
      logger.warn('Failed to get current location:', err, {context: 'Home'});
    }
  }, []);

  const getRequestsData = async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/requests/v1/companies/${company?.id}/requests?page=1&limit=5`,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (ok && !data.error) {
        setRequestsData(data.data || []);
      }
    } catch (error) {
      logger.warn('Error fetching requests:', error, {context: 'Home'});
    }
  };
  const getTaskCalendarData = useCallback(async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks?page=1&page_size=100&sort=created_at:desc&from=${dateRange.startDate}&to=${dateRange.endDate}`,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (ok && !data.error) {
        setTaskCalendarData(data.data?.tasks || []);
      }
    } catch (error) {
      logger.warn('Error fetching task calendar:', error, {context: 'Home'});
    }
  }, [dateRange, token, showAlert]);

  const updateDateRange = useCallback(date => {
   const startDate = moment(date).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(date).endOf('month').format('YYYY-MM-DD');
  
    setDateRange({
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    });
  }, []);

  const getCurrentSubscribtionStatus = async () => {
    try {
      const {ok, data} = await fetchApis(
        getCurrentSubscribtionStatusURL,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok) {
        ApiResponse(showAlert, data, language);
        return;
      }

      if (data?.data?.subscription_info) {
        dispatch(setPlanDetails(data?.data?.subscription_info));
      } else {
        dispatch(setTrail(data?.data?.trial_info));
      }

      // showAlert(data?.message, 'success');
    } catch (error) {
      showAlert('Error fetching plans', 'error');
    }
  };

  const getTodayLogs = async () => {
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

    try {
      setLoading(true);
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/attendance/today?page=1&date=${selectedDate}`,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );
      if (!ok) {
        ApiResponse(showAlert, data, language);
        return;
      }

      if (ok && !data.error) {
        const rows = data.data?.rows ?? [];
        const counters = data.data?.counters ?? [];
        const mapPins = data.data?.mapPins ?? [];

        const transformedPins = mapPins.map(pin => ({
          lat: parseFloat(pin.coordinates.lat),
          lng: parseFloat(pin.coordinates.lng),
          title: pin.workerName || 'Unknown',
          popup:
            `${pin.workerName} - ${t(getStatus(pin.pinType))} ` +
            t('at') +
            ` ${pin.formattedTime}`,
          workerData: pin, // Store full worker data for reference
          status: t(getStatus(pin.pinType)),
          color:
            statusStyles[getStatus(pin.pinType)]?.backgroundColor || 'blue',
        }));

        setDashboardData(prev => ({
          ...prev,
          todayLogsData: rows.slice(0, 5),
          mapPins: transformedPins,
          overViewCardsData: counters,
        }));

        // Store attendance counters in Redux global state
        dispatch(setAttendanceCounters(counters));
      }

      // showAlert(data?.message, 'success');
    } catch (error) {
      logger.warn('Error in getTodayLogs:', error, {context: 'Home'});
      showAlert('Error fetching plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [selectedLocation, setSelectedLocation] = useState(null);

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
            value: item.id,
          })) || [];
        dispatch(setAbsenceTypes(types || []));
      } else {
        showAlert('Something went wrong while getting departments', 'error');
      }
    } catch (error) {
      logger.error('Error fetching departments:', error, {context: 'Home'});
    }
  }, [token, showAlert]);

  useEffect(() => {
    getCurrentPosition();
    onRefresh();
    getUnvalidatedPunches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getCurrentSubscribtionStatus();
    getTodayLogs();
    getRequestsData();
    getTaskCalendarData();
    getDepartments();
    setRefreshing(false);
    getProfile();
    getAbsenceTypes();
  };
  useEffect(() => {
    getTodayLogs();
  }, [selectedDate]);

  useEffect(() => {
    getTaskCalendarData();
  }, [dateRange]);

  const onTimeClockOut = Math.max(
    0,
    (DashboardData?.overViewCardsData?.clockout || 0) -
      (DashboardData?.overViewCardsData?.lateClockOut || 0),
  );

  const overViewCardData = useMemo(
    () => [
      {
        title: 'Pending Employee Registrations',
        value:
          DashboardData.overViewCardsData?.pendingEmployeeRegistration || '0',
        onPress: () => {
          navigation.navigate(SCREENS.WORKER, {status: 'pending'});
        },
      },
      {
        title: 'Active Employees',
        value:
          DashboardData.overViewCardsData?.activeEmployeeRegistration || '0',
        onPress: () => {
          navigation.navigate(SCREENS.WORKER, {status: 'active'});
        },
      },
      {
        title: 'Clock In',
        value: DashboardData.overViewCardsData?.present || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'check_in',
          });
        },
      },
      {
        title: 'On Time Clock In',
        value: DashboardData.overViewCardsData?.onTimeClockIn || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'onTimeClockIn',
          });
        },
      },
      {
        title: 'Late Clock In',
        value: DashboardData.overViewCardsData?.lateArrivals || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'lateClockIn',
          });
        },
      },
      {
        title: 'Start Break',
        value: DashboardData.overViewCardsData?.breakStart || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'breakStart',
          });
        },
      },
      {
        title: 'Break End',
        value: DashboardData.overViewCardsData?.breakEnd || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'breakEnd',
          });
        },
      },
      {
        title: 'Clock Out',
        value: DashboardData.overViewCardsData?.clockout || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'clockout',
          });
        },
      },
      {
        title: 'On Time Clock Out',
        value: onTimeClockOut,
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'onTimeClockOut',
          });
        },
      },
      {
        title: 'Late Clock Out',
        value: DashboardData.overViewCardsData?.lateClockOut || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {
            status: 'lateClockOut',
          });
        },
      },
      {
        title: 'Absent',
        value: DashboardData.overViewCardsData?.absent || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ABSCENCEMANAGEMENT);
        },
      },
      {
        title: 'Pending Tasks',
        value: DashboardData.overViewCardsData?.pendingTask || '0',
        onPress: () => {
          navigation.navigate(SCREENS.TASKMANAGEMENT);
        },
      },
      // {
      //   title: 'Messages',
      //   value: totalCount || '0',
      //   onPress: () => {
      //     navigation.navigate(SCREENS.MESSAGES);
      //   },
      // },
      {
        title: 'Pending Requests',
        value: DashboardData.overViewCardsData?.pendingRequests || '0',
        onPress: () => {
          navigation.navigate(SCREENS.REQUESTMANAGEMENT);
        },
      },
      {
        title: 'Pending Received Documents',
        value: DashboardData.overViewCardsData?.pendingReceivedDocuments || '0',
        onPress: () => {
          navigation.navigate(SCREENS.DOCUMENTMANAGEMENT);
        },
      },
      {
        title: 'Pending Reimbursement Requests',
        value:
          DashboardData.overViewCardsData?.pendingReimbursementRequests || '0',
        onPress: () => {
          navigation.navigate(SCREENS.DOCUMENTMANAGEMENT);
        },
      },
      {
        title: 'Unvalidated Punches',
        value: unValidatedPunchesCount || '0',
        onPress: () => {
          navigation.navigate(SCREENS.ATTENDANCE, {tab: 'Unvalidated Punches'});
        },
        status: 'unvalidated_punches',
      },
    ],
    [DashboardData.overViewCardsData],
  );

  const [scrollEnabled, setScrollEnabled] = useState(true);


  return (
    <View style={styles.container}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}}
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        onStartShouldSetResponder={() => {
          setScrollEnabled(false);
          return false;
        }}
        refreshControl={
          <RefreshControl
            colors={[Colors.darkTheme.primaryColor]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        // onScroll={handleScroll}
        // scrollEventThrottle={16}
      >
        <View
          style={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.backgroundColor
              : Colors.lightTheme.backgroundColor,
          }}
          onStartShouldSetResponder={() => {
            setScrollEnabled(false);
            return false;
          }}>
          <View style={styles.headerContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View>
                <Text style={[styles.greetingText]}>{t('Hello!')}</Text>
                <Text
                  style={[styles.nameText]} ellipsizeMode='tail' numberOfLines={1} >{`${User?.user?.full_name}`}</Text>
              </View>
            </View>

            <View style={styles.iconContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate(SCREENS.MESSAGES)}
                style={{marginRight: wp(4)}}>
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
              <TouchableOpacity
                onPress={() => navigation.navigate(SCREENS.PROFILEDETAILS)}>
                <Image
                  source={
                    User?.user?.profile_picture
                      ? {uri: User?.user?.profile_picture}
                      : Images.placeholderImg
                  }
                  style={styles.profileImage}
                />
              </TouchableOpacity>
            </View>
          </View>
          <SubscriptionAlertBanner
            onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
          />
        </View>
        <View
          style={{
            flex: 1,
            marginHorizontal: hp(2),
            paddingTop: hp(1),
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            borderRadius: wp(5),
            marginTop: hp(2),
            overflow: 'hidden',
            marginBottom: hp(2),
          }}
          onStartShouldSetResponder={() => {
            setScrollEnabled(false);
            return false;
          }}>
          {loading ? (
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
                initialLat={selectedLocation?.latitude}
                initialLng={selectedLocation?.longitude}
                initialZoom={1}
                markers={DashboardData.mapPins || []}
                onMapPress={coordinates => {
                  setSelectedLocation({
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                    address: '',
                    name: '',
                  });
                }}
                style={styles.mapImage}
                initialMarkerTitle={'Current Location'}
                searchPlaceholder={t('Find a place...')}
                onLocationFound={result => {
                  logger.log('Found:', result, {context: 'Home'});
                }}
                showSearch={false}
                dashboard={true}
              />
              <Text style={styles.mapText}>
                {t('Only records with valid Latitude/Longitude are shown')}
              </Text>

              <TouchableOpacity
                onPress={() => setIsDatePickerVisible(true)}
                style={styles.mapDateContainer}>
                <Text style={styles.mapDateText}>
                  {moment(selectedDate).format('D MMM, YYYY')}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={RFPercentage(3)}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          onStartShouldSetResponder={() => {
            setScrollEnabled(true);
            return true;
          }}
          style={[styles.logsContainer, {paddingBottom: hp(2)}]}>
          <View style={styles.rowSb}>
            <Text style={styles.sectionHeading}>{t('Today’s Logs')}</Text>
            <TouchableOpacity
              style={styles.chevron}
              onPress={() => navigation.navigate(SCREENS.ATTENDANCE)}>
              <Svgs.chevronRight />
            </TouchableOpacity>
          </View>
          <View style={[styles.rowSb, styles.workerStatusContainer]}>
            <Text style={styles.SubHeading}>{t('Employee')}</Text>
            <Text style={styles.SubHeading}>{t('Status')}</Text>
          </View>

          {DashboardData.todayLogsData ? (
            DashboardData.todayLogsData.map((item, index) => (
              <WorkerStatus
                name={capitalize(item.fullName) || 'Unknown Employee'}
                key={index.toString()}
                status={getStatus(item?.lastStatus, hasAbsentFeature)}
                email={item.email}
                onPress={() => {
                  if (navigation && navigation.navigate) {
                    navigation.navigate(SCREENS.TODAYLOGSATTENDENCEDETAILS, {
                      item: item,
                    });
                  }
                }}
                // showIcon={true}
              />
            ))
          ) : (
            <EmptyCard
              icon={<Svgs.emptyUser height={hp(10)} width={hp(10)} />}
              heading={'Empty!'}
              subheading={'No logs for today'}
            />
          )}
          {DashboardData.todayLogsData?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(SCREENS.ATTENDANCE);
              }}
              style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>{t('See All')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={Array.isArray(overViewCardData) ? overViewCardData : []}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          style={styles.flatListContainer}
          renderItem={({item}) => {
            return (
              <DashboardCard
                title={item.title}
                value={item.value}
                onPress={() => {
                  if (item.onPress) {
                    item.onPress();
                  } else {
                  }
                }}
              />
            );
          }}
        />
        <View style={styles.requestContainer}>
          <View style={styles.rowSb}>
            <Text style={styles.sectionHeading}>{t('Requests')}</Text>
            <TouchableOpacity
              style={styles.chevron}
              onPress={() => navigation.navigate(SCREENS.REQUESTMANAGEMENT)}>
              <Svgs.chevronRight />
            </TouchableOpacity>
          </View>
          <View style={[styles.rowSb, styles.workerStatusContainer]}>
            <Text style={styles.SubHeading}>{t('Request Name')}</Text>
            <Text style={styles.SubHeading}>{t('Status')}</Text>
          </View>
          {requestsData.length > 0 ? (
            requestsData.slice(0, 5).map(
              (
                item,
                index, // Only first 5 items
              ) => (
                <WorkerStatus
                  key={index.toString()}
                  name={capitalize(item.subject) || 'Unknown Request'}
                  email={`${t('Requested by')}: ${capitalize(item.requester_name)}`}
                  status={
                    capitalize(item.status) === 'Info_requested'
                      ? 'Request Info'
                      : capitalize(item.status)
                  }
                  onPress={() => {
                    navigation.navigate(SCREENS.REQUESTDETAILS, {item});
                  }}
                  showIcon={false}
                />
              ),
            )
          ) : (
            <EmptyCard
              icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
              heading={'Empty!'}
              subheading={'No Requests Yet!'}
            />
          )}

          {DashboardData.todayLogsData?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(SCREENS.REQUESTMANAGEMENT);
              }}
              style={styles.seeAllContainer}>
              <Text style={styles.seeAllText}>{t('See All')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.taskCalendarContainer}>
          <View style={styles.rowSb}>
            <Text style={styles.sectionHeading}>{t('Task Calendar')}</Text>
            <TouchableOpacity
              style={styles.chevron}
              onPress={() =>
                navigation.navigate(SCREENS.TASKMANAGEMENT, {isFromHome: true})
              }>
              <Svgs.chevronRight />
            </TouchableOpacity>
          </View>

          <View
            style={styles.calendarMiniView}
            onStartShouldSetResponder={() => {
              setScrollEnabled(false);
              return false;
            }}
            onResponderRelease={() => {
              setScrollEnabled(true);
            }}
            onTouchEnd={() => {
              setTimeout(() => setScrollEnabled(true), 100);
            }}>
            <TaskCalendar
              data={taskCalendarData}
              currentDate={currentDate}
              // setCurrentDate={setCurrentDate}
              // dateRange={dateRange}
              // updateDateRange={updateDateRange}
              home={true}
            />
          </View>
        </View>
      </ScrollView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onClose={() => setIsDatePickerVisible(false)}
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');
          setSelectedDate(formatted);
          setIsDatePickerVisible(false);
        }}
      />
    </View>
  );
};

export default Home;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(2),
      justifyContent: 'space-between',
      marginHorizontal: wp(4),
    },
    greetingText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: -hp(0.7),
    },
    nameText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
        width: wp(50),
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(10),
      marginLeft: wp(5),
      backgroundColor: '#dcdcdc',
    },
    mapImage: {
      width: wp(100),
      height: hp(40),
      marginTop: hp(2),
      flex: 1,
    },
    mapText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: Colors.lightTheme.secondryTextColor,
      marginTop: hp(1),
      marginLeft: wp(4),
    },
    logsContainer: {
      paddingTop: hp(2),
      paddingHorizontal: wp(5),
      marginHorizontal: wp(5),
      paddingBottom: hp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      // borderBottomLeftRadius: wp(5),
      // borderBottomRightRadius: wp(5),
      borderRadius: wp(5),
    },
    sectionHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    SubHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    workerStatusContainer: {
      marginTop: hp(2),
      paddingBottom: hp(0.5),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      marginBottom: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    listContainer: {
      paddingHorizontal: wp(5),
    },
    flatListContainer: {
      marginTop: hp(2),
      flexWrap: 'wrap',
    },
    requestContainer: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(5),
      marginTop: hp(2),
      marginBottom: hp(2),
      marginHorizontal: wp(5),
    },
    ShiftsContianer: {
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(3),
      marginTop: hp(0),
    },
    ChartPercentageText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    chartStatesText: {
      fontFamily: Fonts.NunitoBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    taskCalendarContainer: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(5),
      marginTop: hp(2),
      marginBottom: hp(2),
      marginHorizontal: wp(5),
    },
    calendarMiniView: {
      marginTop: hp(1),
      minHeight: hp(15),
    },
    calendarSummary: {
      padding: wp(3),
    },
    calendarSummaryText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
    upcomingTasks: {
      marginTop: hp(1),
    },
    upcomingTasksTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    workerTasks: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: hp(0.3),
    },
    workerName: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    taskCount: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.secondaryTextColor
        : Colors.lightTheme.secondaryTextColor,
    },
    emptyCalendarCard: {
      paddingVertical: hp(2),
    },
    chevron: {
      backgroundColor: Colors.lightTheme.primaryColor,
      paddingVertical: wp(1.5),
      paddingHorizontal: wp(3),
      borderRadius: wp(2),
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
    seeAllContainer: {
      paddingVertical: hp(1),
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderWidth: 1,
      borderRadius: wp(3),
      marginTop: hp(2),
    },
    seeAllText: {
      color: Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.5),
    },
  });
