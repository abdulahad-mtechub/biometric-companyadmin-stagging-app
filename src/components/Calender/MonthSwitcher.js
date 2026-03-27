import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const MonthSwitcher = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showYearSelector, setShowYearSelector] = useState(false);

  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const handlePrev = () => {
    setSelectedDate(prev => showYearSelector ? moment(prev).subtract(1, 'year') : moment(prev).subtract(1, 'month'));
  };

  const handleNext = () => {
    setSelectedDate(prev => showYearSelector ? moment(prev).add(1, 'year') : moment(prev).add(1, 'month'));
  };

  const toggleSelector = () => setShowYearSelector(prev => !prev);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrev}>
        <Icon name="chevron-left" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor} />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleSelector}>
        <Text style={styles.dateText}>
          {showYearSelector 
            ? selectedDate.format('YYYY') 
            : selectedDate.format('MMMM YYYY')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleNext}>
        <Icon name="chevron-right" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor} />
      </TouchableOpacity>
    </View>
  );
};

export default MonthSwitcher;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      alignSelf: 'center',
      gap: wp(2),
    },
    dateText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
  });
