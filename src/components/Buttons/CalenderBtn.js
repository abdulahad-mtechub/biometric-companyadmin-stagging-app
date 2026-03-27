import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons'; // You can replace this with an SVG if needed
import {Fonts} from '@constants/Fonts';
import {useSelector} from 'react-redux';
import logger from '@utils/logger';

const CalendarBtn = ({
  initialYear = new Date().getFullYear(),
  onYearChange,
  containerStyle,
  mode,
}) => {
  const [year, setYear] = useState(initialYear);
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const handlePrevYear = () => {
    const newYear = year - 1;
    setYear(newYear);
    onYearChange?.(newYear);
  };

  const handleNextYear = () => {
    const newYear = year + 1;
    setYear(newYear);
    onYearChange?.(newYear);
  };

  return (
    <View style={[styles.container, mode && styles.secondryContainer]}>
      <TouchableOpacity onPress={handlePrevYear}>
        <Icon
          name="chevron-left"
          size={RFPercentage(4)}
          color={mode ? (isDarkMode ? 'white' : 'black') : 'white'}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.yearText,
          mode
            ? isDarkMode
              ? {color: 'white'}
              : {color: 'black'}
            : isDarkMode
            ? Colors.darkTheme.primaryTextColor
            : Colors.darkTheme.primaryTextColor,
        ]}>
        {year}
      </Text>

      <TouchableOpacity onPress={handleNextYear}>
        <Icon
          name="chevron-right"
          size={RFPercentage(4)}
          color={mode ? (isDarkMode ? 'white' : 'black') : 'white'}
        />
      </TouchableOpacity>
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : '#003149',
      borderRadius: wp('2%'),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp('2%'),
      paddingVertical: wp('2%'),
    },
    secondryContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
    },
    yearText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
    },
  });

export default CalendarBtn;
