import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import logger from '@utils/logger';

const AttendanceDetailsCard = ({ details }) => {
  const { isDarkMode,Colors } = useSelector(store => store.theme);
  const { t } = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{t(label)}</Text>
      <View style={styles.valueContainer}>
        {Array.isArray(value)
          ? value.map((line, index) => (
              <Text key={index} style={styles.value}>
                {line}
              </Text>
            ))
          : <Text style={styles.value}>{value}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{t("Attendance Details")}</Text>

      <Row label="Clock In" value={details.checkIn} />
      <Row label="Clock In Location" value={details.checkInLocation} />
      <Row label="Clock Out" value={details.checkOut} />
      <Row label="Check Out Location" value={details.checkOutLocation} />
      <Row label="Working Hours" value={details.workingHours} />
      <Row label="Break" value={details.breakTime} />
      <Row label="Break Location" value={details.breakLocation} />
      <Row label="Total Break" value={details.totalBreak} />
      <Row label="Details" value={details.overtimeDetails} />
      <Row label="Locations" value={details.locationStatus} />
      <Row label="Selfie" value={details.selfieStatus} />
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
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
      marginBottom: hp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.9),
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
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
    },
  });

export default AttendanceDetailsCard;
