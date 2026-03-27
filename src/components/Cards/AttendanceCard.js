import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import {Symbols} from '@constants/DummyData';
import logger from '@utils/logger';

const AttendanceCard = ({
  date,
  name,
  timeRange,
  location,
  locationStatus,
  onPress,
  status,
  contianerStyle,
}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const getStatus = () => {
    switch (status) {
      case 'punch_in':
        return 'Clock In';
      case 'punch_out':
        return 'Clock Out';
      case 'break_start':
        return 'Break Start';
      case 'break_end':
        return 'Break End';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {borderBottomColor: theme.BorderGrayColor},
        contianerStyle,
      ]}>
      {/* Header Row - Date, Status Icon, Location Status */}
      <View style={styles.leftHeader}>
        {status && (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor:
                  Symbols[getStatus()]?.backgroundColor || '#9CA3AF',
              },
            ]}>
            {Symbols[getStatus()]?.icon || (
              <Svgs.alertWhite height={hp(2)} width={hp(2)} />
            )}
          </View>
        )}
        <Text style={[styles.date, {color: theme.primaryTextColor}]}>
          {date}
        </Text>
      </View>

      {/* Main Content Row */}
      <View style={styles.mainRow}>
        <View style={styles.leftContent}>
          {/* Name and Time */}
          <Text style={[styles.name, {color: theme.primaryTextColor}]}>
            {name}
          </Text>

          {/* Location if provided */}
          {location && (
            <View style={styles.locationRow}>
              <Text
                style={[styles.location, {color: theme.primaryTextColor}]}
                numberOfLines={2}>
                {location}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.time, {color: theme.primaryTextColor}]}>
          {timeRange}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    card: {
      paddingVertical: hp(1),
      borderBottomWidth: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(4),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    leftContent: {
      flex: 1,
    },
    iconWrapper: {
      height: hp(3),
      width: hp(3),
      borderRadius: hp(1.5),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
    },
    date: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    name: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsMedium,
    },
    time: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsMedium,
      textAlign: 'right',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    location: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsRegular,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: wp(2.5),
      borderRadius: wp(2),
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsMedium,
    },
  });

export default AttendanceCard;
