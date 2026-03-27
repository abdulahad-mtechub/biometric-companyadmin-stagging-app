import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {Svgs} from '@assets/Svgs/Svgs';
import {useNavigation} from '@react-navigation/native';
import { SCREENS } from '@constants/Screens';
import logger from '@utils/logger';

const SchedulesCard = ({item}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item?.fullName}</Text>
      <Text style={styles.shiftText}>{item?.email}</Text>
      <Text style={styles.name}>{t('Shift Timing')}</Text>
      <Text style={styles.shiftText}>
        {t('Start Time:')}{' '}
        {moment(item.schedule?.startTime, 'HH:mm:ss').format('h:mm a')}
      </Text>
      <Text style={styles.shiftText}>
        {t('End Time:')}{' '}
        {moment(item.schedule?.endTime, 'HH:mm:ss').format('h:mm a')}
      </Text>
      <Text style={styles.name}>{t('Working Location')}</Text>
      <Text style={styles.shiftText}>{item?.workLocation?.locationName}</Text>
      {item?.schedule?.workingDays?.length > 0 && (
        <>
          <Text style={styles.name}>{t('Working Days')}</Text>
          <View style={styles.rowView}>
            {item?.schedule?.workingDays?.map((item, index) => (
              <View key={index.toString()} style={styles.weekDaysContainer}>
                <Text style={styles.weekDaysText}>{item}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={{position: 'absolute', top: hp(2), right: wp(2)}}
        onPress={() => {
          navigation.navigate(SCREENS.EDITATTENDANCESETTINGS, {item});
        }}>
        <Svgs.editCircled />
      </TouchableOpacity>
    </View>
  );
};

export default SchedulesCard;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      paddingVertical: hp(1.5),
      borderBottomWidth: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    name: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
    },
    updatedText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(12)),
    },
    shiftText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(13)),
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
      // justifyContent: 'space-between',
    },
    weekDaysContainer: {
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      // paddingHorizontal: wp(2),
      // paddingVertical: wp(2.5),
      borderRadius: '100%',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      marginRight: wp(2),
      width: wp(9),
      height: wp(9),
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekDaysText: {
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(12)),
    },
  });
