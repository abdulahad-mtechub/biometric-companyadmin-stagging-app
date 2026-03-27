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

const AttendancePunchCard = ({date, name, timeRange, onPress, status ,contianerStyle}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
    const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
    const getStatus = () => {
      switch (status) {
        case 'punch_in':
          return 'Punch In';
        case 'punch_out':
          return 'Punch Out';
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
      style={[styles.card, {borderBottomColor: theme.BorderGrayColor}, contianerStyle]}>
      <View style={styles.row}>
        <View>
          <View style={[styles.row, {marginBottom: hp(0.5), width:wp(32),}]}>
            {status &&  <View
              style={[
                styles.iconWrapper,
                {backgroundColor: Symbols[getStatus()].backgroundColor || '#9CA3AF'},
              ]}>
              {Symbols[getStatus()].icon || (
                <Svgs.alertWhite height={hp(6)} width={hp(6)} />
              )}
            </View>}
          
            <Text style={[styles.date, {color: theme.primaryTextColor}]}>
              {date}
            </Text>
          </View>

          <View style={styles.row}>
            {/* <Image
              source={Images.placeholderImg} // Replace with your actual avatar image
              style={styles.avatar}
            /> */}
            <Text style={[styles.name, {color: theme.secondryTextColor}]}>
              {name}
            </Text>
          </View>
        </View>
        <Text style={[styles.time, {color: theme.secondryTextColor}]}>
          {timeRange}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
  card: {
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    backgroundColor: isDarkMode
      ? Colors.darkTheme.secondryColor
      : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(5),
    marginRight: wp(2),
  },
  date: {
    fontSize: RFPercentage(1.9),
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'left',
    marginLeft: wp(2),
  },
  name: {
    fontSize: RFPercentage(1.7),
    fontFamily: Fonts.PoppinsRegular,
  },
  time: {
    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.PoppinsMedium,
  },
  iconWrapper: {
    height: hp(3),
    width: hp(3),
    borderRadius: hp(2.25),
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: wp(3),
  },
});

export default AttendancePunchCard;
