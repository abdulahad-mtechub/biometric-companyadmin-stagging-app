// components/StatusBox.js

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import {Svgs} from '@assets/Svgs/Svgs';
import logger from '@utils/logger';
import { statusStyles } from '../../Constants/DummyData';

const StatusBox = ({
  status,
  backgroundColor, // for backward compatibility
  color, // for backward compatibility
  icon, // for backward compatibility
  showIcon,
  containerStyle,
}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();



  const getStatus = () => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'punch_in':
        return 'Punch In';
      case 'punch_out':
        return 'Punch Out';
      case 'break_start':
        return 'Break Start';
      case 'break_end':
        return 'Break End';
      case 'not_done':
        return 'Not Done';
      case 'in_progress':
        return 'Ongoing';
      case 'pending':
        return 'Pending';
      default:
        return status?.replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const normalizedStatus = getStatus();
  const style = statusStyles[normalizedStatus] || {}

  const finalBackgroundColor = backgroundColor || style.backgroundColor;
  const finalColor = color || style.color;
  const finalIcon = icon || style.icon;

  const showChevron =
    normalizedStatus === 'Invited' ||
    normalizedStatus === 'Request' ||
    normalizedStatus === 'Ongoing';

  return (
    <View
      style={[
        styles.statusBox,
        {backgroundColor: finalBackgroundColor},
        containerStyle,
        // Apply specific padding for punch/break statuses
        (normalizedStatus === 'Punch In' ||
          normalizedStatus === 'Punch Out' ||
          normalizedStatus === 'Break Start' ||
          normalizedStatus === 'Break End') && {paddingHorizontal: 0},
      ]}>
      {finalIcon}
      <Text style={[styles.statusText, {color: finalColor}]}>
        {t(normalizedStatus)}
      </Text>
      {showChevron && showIcon && (
        <MaterialCommunityIcons
          name="chevron-down"
          size={RFPercentage(3)}
          color={
            normalizedStatus === 'Invited' || normalizedStatus === 'Ongoing'
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor
          }
        />
      )}
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    statusBox: {
      borderRadius: wp(1),
      paddingHorizontal: wp(2.5),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: wp(0.5),
    },
    statusText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      textAlign: 'center',
      marginLeft: wp(1),
      color: Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
  });

export default StatusBox;
