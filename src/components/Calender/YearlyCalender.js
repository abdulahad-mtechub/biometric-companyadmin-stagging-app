import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const YearlyCalendar = ({year = 2024}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(4); // May is selected (0-indexed)
  const {isDarkMode,Colors} = useSelector(store => store.theme);
    const styles = dynamicStyles(isDarkMode,Colors);


  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fri', 'Sa', 'Su'];

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0
  };

  // Generate calendar days for a month
  const generateCalendarDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false,
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
      });
    }
    
    // Next month's leading days
    const remainingCells = 35 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }
    
    return days.slice(0, 42); // Ensure exactly 6 rows
  };

  const renderMonth = (monthIndex) => {
    const days = generateCalendarDays(year, monthIndex);
    const isSelected = selectedMonth === monthIndex;

    return (
      <View
        key={monthIndex}
        style={[
          styles.monthContainer,
          isSelected && styles.selectedMonthContainer,
        ]}>
        
        <Text style={styles.monthTitle}>{monthNames[monthIndex]}</Text>
        
        
        <View style={styles.dayHeadersRow}>
          {dayNames.map((dayName) => (
            <Text key={dayName} style={styles.dayHeader}>
              {dayName}
            </Text>
          ))}
        </View>
        
        
        <View style={styles.calendarGrid}>
          {days.map((dateObj, index) => {
            const isWeekEnd = index % 7 === 5 || index % 7 === 6; // Saturday or Sunday
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCell,
                  !dateObj.isCurrentMonth && styles.inactiveDateCell,
                ]}
                onPress={() => {
                  if (dateObj.isCurrentMonth) {
                    setSelectedDate({
                      month: monthIndex,
                      day: dateObj.day,
                    });
                  }
                }}>
                <Text
                  style={[
                    styles.dateText,
                    !dateObj.isCurrentMonth && styles.inactiveDateText,
                    selectedDate?.month === monthIndex &&
                      selectedDate?.day === dateObj.day &&
                      dateObj.isCurrentMonth &&
                      styles.selectedDateText,
                  ]}>
                  {dateObj.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Group months into rows of 2
  const renderMonthRows = () => {
    const rows = [];
    for (let i = 0; i < 12; i += 2) {
      rows.push(
        <View key={i} style={styles.monthRow}>
          {renderMonth(i)}
          {i + 1 < 12 && renderMonth(i + 1)}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.yearContainer}>
        
        
        
        <View style={styles.monthsContainer}>
          {renderMonthRows()}
        </View>
      </View>
    </ScrollView>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
      container: {
    flex: 1,
  },
  yearContainer: {
    padding: wp(2),
  },
 
  monthsContainer: {
    flex: 1,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  monthContainer: {
    width: wp(45),
    backgroundColor: isDarkMode? Colors.darkTheme.secondryColor : Colors.lightTheme.backgroundColor,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    elevation: 2,
    shadowColor:isDarkMode? '#ffffff' : '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    paddingVertical: hp(1),
    
  },
  selectedMonthContainer: {
    borderWidth: 2,
    borderColor: Colors.darkTheme.primaryColor,
  },
  monthTitle: {
    fontSize: RFPercentage(2.2),
    fontFamily: Fonts.PoppinsMedium,
    color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    marginBottom: hp(1),
  },
  dayHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  dayHeader: {
    fontSize: RFPercentage(pxToPercentage(10)),
    fontFamily: Fonts.PoppinsMedium,
    color: isDarkMode? Colors.darkTheme.primaryTextColor:'#666',
    width: wp(5),
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: wp(5),
    height: hp(2),
    // paddingVertical: wp(1),
    // paddingHorizontal: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp(0.2),
  },
  inactiveDateCell: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: RFPercentage(pxToPercentage(10)),
    color: isDarkMode? Colors.darkTheme.primaryTextColor:'#333',
    fontFamily: Fonts.PoppinsRegular,
  },
  inactiveDateText: {
    color: '#999',
  },
  selectedDateText: {
    color: Colors.darkTheme.primaryTextColor,
    backgroundColor: Colors.darkTheme.primaryColor,
    borderRadius: wp(10),
    paddingVertical: wp(0.5),
    paddingHorizontal : wp(1.5)
  },
});

export default YearlyCalendar;