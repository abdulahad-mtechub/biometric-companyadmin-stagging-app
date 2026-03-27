import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import logger from '@utils/logger';

const CalendarSwitcher = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => moment(prevDate).subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => moment(prevDate).add(1, 'day'));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePreviousDay}>
        <Icon name="chevron-left" size={RFPercentage(3)} color={isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor} />
      </TouchableOpacity>

      <Text style={styles.dateText}>{selectedDate.format('MMM, DD')}</Text>

      <TouchableOpacity onPress={handleNextDay}>
        <Icon name="chevron-right" size={RFPercentage(3)} color={isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor} />
      </TouchableOpacity>
    </View>
  );
};

export default CalendarSwitcher;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: isDarkMode? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
      alignSelf: 'center',
    },
    dateText: {
    //   marginHorizontal: wp(3),
      fontSize: RFPercentage(2),
      color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
  });
