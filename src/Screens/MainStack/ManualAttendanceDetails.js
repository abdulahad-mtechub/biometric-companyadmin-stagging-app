import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Images } from '@assets/Images/Images';
import { Svgs } from '@assets/Svgs/Svgs';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const ManualAttendanceDetails = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);
  const attendanceData = {
    checkIn: '09:02 Am',
    break: '01:12 PM - 2:20 PM',
    totalBreak: '1 Hours 8 mins',
    checkout: '07:02 Pm',
    PunchLocation: ['Calle de Alcalá, 32, 28009', 'Madrid, Spain'],
    WorkingHours: '8 Hours 58 mins',
    overtimeDetails: '56 Min Overtime',
  };
  const RequestDetails = [
    {label: 'Requested On', value: '15 May, 2025 - 06:24 PM'},
    {label: 'Date', value: '15 May, 2025'},
    {label: 'Punch-In/Out', value: '09:00 AM / 06:00 PM'},
    {label: 'Break-Start/End', value: '01:00 PM / 01:30 PM'},
    {
      label: 'Punched Location',
      value: 'Calle de Alcalá, 123, 28009 Madrid, Spain',
    },
    {label: 'Description', value: ['Went for appointment', 'Returned late']},
  ];
  const attendanceDetails = [
    {label: 'Clock In', value: '09:02AM'},
    {label: 'Break', value: '01:12 PM - 2:20 PM'},
    {label: 'Total Break', value: '1 Hours 8 mins'},
    {label: 'Clock Out', value: '07:00 PM'},
    {label: 'Working Hours', value: '8 Hours 58 mins'},
    {
      label: 'Punched Location',
      value: 'Calle de Alcalá, 123, 28009 Madrid, Spain',
    },
    {label: 'Details', value: ['56 Min Overtime']},
  ];

  const Row = ({label, value, valueComponent}) => (
    <View style={styles.row}>
      <Text style={styles.label}>{t(label)}</Text>
      <View style={styles.valueContainer}>
        {valueComponent ? (
          <View style={styles.valueComponent}>{valueComponent}</View>
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StackHeader
        title={'13 May, 2025'}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(2),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
      />

      <View style={styles.statusContainer}>
        <View style={styles.rowSb}>
          <Text style={[styles.statusText]}>{t('Employee')}</Text>
          <View style={{flexDirection: 'row'}}>
            <Image source={Images.placeholderImg} style={styles.image} />
            <Text
              style={[
                styles.value,
                {
                  width: undefined,
                  textAlignVertical: 'center',
                  fontSize: RFPercentage(1.6),
                  fontFamily: Fonts.NunitoRegular,
                },
              ]}>
              Brooklyn Simmons
            </Text>
          </View>
        </View>

        <WorkerStatus
          name={'Status'}
          status={'Present'}
          nameTextStyle={styles.statusText}
        />
        <View style={styles.rowSb}>
          <Text style={[styles.statusText]}>{t('Punch Type')}</Text>
          <Text
            style={[
              styles.statusText,
              {fontFamily: Fonts.PoppinsRegular, fontSize: RFPercentage(1.6)},
            ]}>
            {t('Manual')}
          </Text>
        </View>

        <View style={styles.rowSb}>
          <Text style={[styles.statusText]}>{t('Punch')}</Text>
          <Text
            style={[
              styles.statusText,
              {fontFamily: Fonts.PoppinsRegular, fontSize: RFPercentage(1.6)},
            ]}>
            {t('13 May, 2025')}
          </Text>
        </View>
      </View>
      <RequestDetailsCard
        details={attendanceDetails}
        heading={'Attendance Details'}
        showChevron={false}
      />

      <RequestDetailsCard details={RequestDetails} />
      <RequestDetailsCard details={RequestDetails} />

      <View style={styles.cardContainer}>
        <View style={styles.rowSb}>
          <Text style={styles.title}>{t('Action Details')}</Text>
          <Svgs.ChevronDownFilled height={wp(7)} width={wp(7)} />
        </View>
        <Row label={'Action on'} value={'13 May, 2025'} />
        <Row
          label={'Action on'}
          valueComponent={
            <WorkerStatus
              status={'Approved'}
              nameTextStyle={styles.statusText}
            />
          }
        />
        <Row
          label={'Admin Comment'}
          value={
            "Your request has been approved and will add your manual punch with in 2 days if your punch doesn't updated comment in request"
          }
        />
      </View>
    </ScrollView>
  );
};

export default ManualAttendanceDetails;

const dynamicStyles = (isDarkMode,Colors) =>
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
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
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
    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
    },
    sectionHeading: {
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.9),
      marginLeft: wp(5),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      flex: 1,
    },
    valueContainer: {
      flex: 1.2,
      alignItems: 'flex-end',
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
    },
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      margin: wp(4),
    },
    title: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'center',
      //   marginBottom: hp(2),
    },
    valueComponent: {
      width: '55%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    image: {
      width: wp(8),
      height: hp(4),
      borderRadius: 100,
      marginRight: wp(2),
      marginLeft: wp(6),
    },
  });
