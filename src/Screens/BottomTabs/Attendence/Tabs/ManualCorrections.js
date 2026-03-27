import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import {
  AttendancePunchData,
  AttendanceSymbols,
} from '@constants/DummyData';
import { Fonts } from '@constants/Fonts';
import { SCREENS } from '@constants/Screens';
import { Svgs } from '@assets/Svgs/Svgs';
import CalendarBtn from '@components/Buttons/CalenderBtn';
import AttendancePunchCard from '@components/Cards/AttendancePunchCard';
import SymbolCard from '@components/Cards/SymbolCard';
import logger from '@utils/logger';

const ManualCorrections = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  const handleYearChange = newYear => {
    logger.log('Selected year:', newYear, { context: 'ManualCorrections' });
  };
  return (
    <View style={styles.contentContainerStyle}>
      <View style={styles.rowSb}>
        <Text style={[styles.SubHeading, {fontSize: RFPercentage(2)}]}>
          120 {t("Manual Punches")}
        </Text>
        <Svgs.filter />
      </View>
      <CalendarBtn onYearChange={handleYearChange} mode={true} />
      <SymbolCard heading={'Attendence Symbols'} array={AttendanceSymbols} />
      <View style={[styles.rowSb, {marginBottom: hp(1)}]}>
        <Text style={[styles.SubHeading]}>{t("All Attendance")}</Text>
        <Text style={[styles.SubHeading, {fontFamily: Fonts.PoppinsMedium}]}>
          {t("Date - Time")}
        </Text>
      </View>
      {AttendancePunchData.map(item => (
        <AttendancePunchCard
          key={item.id}
          date={item.date}
          name={item.name}
          timeRange={item.timeRange}
          status={item.status}
          onPress={() => {
            navigation.navigate(SCREENS.MANUALATTENDANCEDETAILS, {
              status: item.status,
            });
          }}
        />
      ))}
    </View>
  );
};

export default ManualCorrections;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    contentContainerStyle: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
      marginTop: -hp(1.4),
    },
    rowSb: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: hp(3),
    },
    SubHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });
