import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {normalizeFontSize} from '@utils/responsive';
import logger from '@utils/logger';

const DateTimeFormatter = ({date, time}) => {

  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const formatDate = date => {
    if (typeof date === 'string' && /^\d{1,2}\s\w{3}\s\d{4}$/.test(date)) {
      return date;
    }

    else if (date instanceof Date || !isNaN(Date.parse(date))) {
      const formattedDate = new Date(date);
      return formattedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return 'Invalid Date';
  };

  const formatTime = time => {
    if (typeof time === 'string' && /^\d{2}:\d{2}\s(AM|PM)$/.test(time)) {
      // Already in correct format
      return time;
    } else if (time instanceof Date || !isNaN(Date.parse(time))) {
      const formattedTime = new Date(time);
      return formattedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return 'Invalid Time';
    }
  };
  const styles = StyleSheet.create({
    text: {
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      fontSize: normalizeFontSize(13),
    },
  });
  return (
    <View>
      {date && <Text style={styles.text}>{`${formatDate(date)}`}</Text>}
      {time && <Text style={styles.text}>{`${formatTime(time)}`}</Text>}
    </View>
  );
};

export default DateTimeFormatter;
