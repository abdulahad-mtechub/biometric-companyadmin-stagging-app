import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';

import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';

import CustomButton from '@components/Buttons/customButton';
import EmploymentDetailsCard from '@components/Cards/EmploymentDetailsCard';
import UserInfoCard from '@components/Cards/UserInfoCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import {useAlert} from '@providers/AlertContext';

import moment from 'moment';
import {Svgs} from '@assets/Svgs/Svgs';
import Loader from '@components/Loaders/loader';
import {
  AttendanceSymbols,
  DocumentsSymbols,
  PaymentsSymbols,
  RequestSymbols,
  TaskSymbols,
  attendanceData,
  documentsData,
  paymentsData,
  requestsData,
  tasksData,
} from '@constants/DummyData';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {ApiResponse, capitalize, fetchApis} from '@utils/Helpers';
import logger from '@utils/logger';

const tabConfig = {
  Attendance: {
    heading: 'All Punches',
    heading1: 'Monthly Punch',
    heading2: 'Time',
    type: 'Attendance',
    data: attendanceData,
    symbols: AttendanceSymbols,
  },
  Tasks: {
    heading: 'All Tasks',
    heading1: 'All Tasks',
    heading2: 'Date - Time',
    type: 'Tasks',
    data: tasksData,
    symbols: TaskSymbols,
  },
  Requests: {
    heading: 'All Requests',
    heading1: 'Name',
    heading2: 'Date - Time',
    type: 'Requests',
    data: requestsData,
    symbols: RequestSymbols,
  },
  Payments: {
    heading: 'All Payments',
    heading1: 'Name',
    heading2: 'Date - Time',
    type: 'Payments',
    data: paymentsData,
    symbols: PaymentsSymbols,
  },
  Documents: {
    heading: 'All Documents',
    heading1: 'Name',
    heading2: 'Time',
    type: 'Documents',
    data: documentsData,
    symbols: DocumentsSymbols,
  },
};

const WorkerDetails = ({navigation, route}) => {
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language} = useSelector(store => store.auth);
  const [loading, setLoading] = useState(false);
  const [Details, setDetails] = useState({});

  const status = route.params?.status || 'Invited';
  const item = route.params?.item || 'Invited';
  // logger.log(item, { context: 'WorkerDetails' });

  const fetchWorkerDetails = async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/workers/${item.id}?expand=attendanceSettings`,
        'GET',
        setLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (ok && !data?.error) {
        setDetails(data.data);
      } else {
        ApiResponse(showAlert, data, language);
        console.log(
          `${baseUrl}/company-admins/workers/${item.id}?expand=attendanceSettings`,
        );
      }
    } catch (error) {
      logger.error('Error fetching executive details:', error, {
        context: 'WorkerDetails',
      });
      showAlert(
        'Something went wrong while fetching executive details',
        'error',
      );
    }
  };

  useEffect(() => {
    fetchWorkerDetails();
  }, []);

  const [selectedTab, setSelectedTab] = useState('Attendance');

  const handleContinue = () => {};
  const handleYearChange = year =>
    logger.log('Selected year:', year, {context: 'WorkerDetails'});
  const underDevelopment = () => showAlert('Under Development', 'error');

  const currentTab = tabConfig[selectedTab];

  logger.log(Details, {context: 'WorkerDetails'});

  return loading ? (
    <Loader size={wp(20)} style={{flex: 1, justifyContent: 'center'}} />
  ) : (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <StackHeader
          title={Details.fullName}
          onBackPress={() => navigation.goBack()}
          headerTxtStyle={{textAlign: 'left'}}
          headerStyle={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            paddingTop: 10,
          }}
          rightIcon={<Svgs.edit height={hp(3)} width={hp(3)} />}
          rightIconPress={
            status !== 'Invited'
              ? () =>
                  navigation.navigate(SCREENS.EDITWORKER, {workerData: item})
              : underDevelopment
          }
        />

        <View style={styles.statusContainer}>
          <WorkerStatus
            name={t('Status')}
            status={capitalize(Details?.status)}
            nameTextStyle={styles.statusText}
          />
          <View style={[styles.rowViewSB, {marginTop: hp(0.5)}]}>
            <Text style={styles.statusText}>{t('Registered')}</Text>
            <Text style={styles.value}>
              {moment(Details?.createdAt).format('DD MMM, YYYY')}
            </Text>
          </View>
        </View>

        <UserInfoCard
          user={{
            fullName: Details.fullName,
            dob: Details.dob
              ? moment(Details.dob).format('DD MMM, YYYY')
              : null,
            email: Details.email,
            phone: Details.phone,
            country: Details.address?.country,
            province: Details.address?.province,
            city: Details.address?.city,
            postalCode: Details.address?.postalCode,
            street: Details.address?.streetAddress,
            image: Details.profileImage,
          }}
        />

        <EmploymentDetailsCard
          data={{
            department: Details.department?.name,
            designation: Details.designation,
            employmentType: Details.employeeType,
            hiringDate: moment(Details.hireDate).format('DD MMM, YYYY'),
            shift: Details.shiftSchedule,
            assignRegion: Details.assignRegion,
            assignZone: Details.assignZone,

            startTime: Details?.attendanceSettings?.schedule
              ? Details.attendanceSettings.schedule.startTime
              : null,
            endTime: Details?.attendanceSettings?.schedule
              ? Details.attendanceSettings.schedule.endTime
              : null,
            graceMinutes: Details?.attendanceSettings?.schedule
              ? `${Details.attendanceSettings.schedule.graceMinutes} Min`
              : null,
            dailyHours: Details?.attendanceSettings?.schedule
              ? `${Math.floor(
                  Details.attendanceSettings.schedule.dailyHours,
                )} hrs`
              : null,
            breakTime: Details?.attendanceSettings?.schedule
              ? `${Details.attendanceSettings.schedule.breakPolicy?.unpaid} Min`
              : null,
            workingDays: Details?.attendanceSettings?.schedule
              ? Details.attendanceSettings.schedule.workingDays
              : [],
            WorkLocation:
              Details?.attendanceSettings?.workLocation?.locationName || 'Add',
          }}
        />

        {/* <View style={styles.tabsContainer}>
          <TabSelector
            tabs={Object.keys(tabConfig)}
            selectedTab={selectedTab}
            onTabPress={setSelectedTab}
            isScrollable={true}
          />
        </View>

        <View style={[styles.tabsContainer, styles.contentContainerStyle]}>
          <>
            <View style={styles.rowViewSB}>
              <Text style={styles.TabHeading}>{t(currentTab.heading)}</Text>
            </View>

            {currentTab.symbols && (
              <SymbolCard
                heading={'Status Symbols'}
                array={currentTab.symbols}
              />
            )}

            <View style={styles.cardContainer}>
              <CalendarBtn onYearChange={handleYearChange} />
              <View style={styles.rowViewSB}>
                <Text style={styles.title}>{t(currentTab.heading1)}</Text>
                <Text style={styles.title}>{t(currentTab.heading2)}</Text>
              </View>
              <View style={styles.divider} />
              {currentTab.data.map((item, index) => (
                <StatusCardItem
                  key={index}
                  item={item}
                  type={currentTab.type}
                />
              ))}
            </View>
          </>
        </View> */}
      </ScrollView>

      {capitalize(Details?.status) === 'Active' && (
        <View style={styles.btnContainer}>
          <CustomButton
            text={t('Add Attendance Scehedule')}
            onPress={() =>
              navigation.navigate(SCREENS.ADDATTENDANCESETTINGS, {
                workerId: item.id,
              })
            }
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
          />
        </View>
      )}
    </View>
  );
};

export default WorkerDetails;
const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
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
      fontSize: RFPercentage(2.2),
    },
    value: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(0.5),
    },
    listContainer: {
      paddingHorizontal: wp(5),
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
      borderTopLeftRadius: wp(2),
      borderTopRightRadius: wp(2),
    },
    TabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
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
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginBottom: hp(2),
    },
    symbolRow: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      height: hp(2),
      width: hp(2),
      borderRadius: hp(2.25),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(1),
    },
    symbolText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      //   position: "absolute",
      //   bottom: hp(2.5),
      //   left: wp(0),
      //   right: wp(0),
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
    cardContainer: {
      padding: wp(4),
      borderRadius: wp(3),
      borderWidth: 1,
      marginVertical: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    reportHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      width: '70%',
      marginBottom: hp(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    contentContainerStyle: {
      marginHorizontal: wp(4),
      paddingTop: hp(1),
      paddingHorizontal: wp(2),
    },
    floatingButton: {
      backgroundColor: '#ffffff',
      borderRadius: wp(4),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(11),
      right: wp(2),
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    floatingButtonText: {
      color: Colors.darkTheme.primaryColor,
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
    },
  });
