import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Symbols} from '@constants/DummyData';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {Svgs} from '@assets/Svgs/Svgs';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import {
  capitalize,
  formatCurrency,
  formatNumber,
  getFirstWord,
  truncateText,
} from '@utils/Helpers';
import moment from 'moment';
import logger from '@utils/logger';

const StatusCardItem = ({item, type, containerStyle, onPress}) => {
  const {t} = useTranslation();
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const status = item?.status;
  const getStatus = () => {
    switch (status) {
      case 'not_done':
        return 'Not Done';
      case 'in_progress':
        return 'Ongoing';
      default:
        return capitalize(status);
    }
  };
  console.log(item)
  const symbol = Symbols[getStatus()] || {};
  const Icon = symbol.icon || (
    <Svgs.alertWhite height={hp(2.5)} width={hp(2.5)} />
  );

  const backgroundColor = symbol.backgroundColor || '#9CA3AF';

  const getPrimaryText = () => {
    switch (type) {
      case 'Attendance':
        return item?.date;
      case 'Tasks':
        return truncateText(item?.title, 15);
      case 'Projects':
        return item?.id;
      case 'Requests':
        return item?.name;
      case 'Payments':
        return item?.name;
      case 'Documents':
        return item?.name;
      case 'Expense Request':
        return `${getFirstWord(item?.worker?.name)} | ${formatCurrency(
          item?.amount,
          item?.currency,
        )}`;
      case 'Expense Payroll':
        return `${item?.worker?.name} | $${item?.amount}`;
      default:
        return '';
    }
  };

  const getSecondryText = () => {
    switch (type) {
      case 'Attendance':
        return item?.time;
      case 'Tasks':
        return moment(item?.assigned_on).format('DD MMM - h:mm A');
      case 'Requests':
        return `${item?.date} - ${item?.time}`;
      case 'Payments':
        return `${item?.date} - ${item?.time}`;
      case 'Documents':
        return `${item?.date} - ${item?.time}`;
      case 'Expense Request':
        return moment(item?.created_at).format('DD MMM - h:mm A');
      case 'Expense Payroll':
        return moment(item?.created_at).format('DD MMM - h:mm A');
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.4}
      onPress={item => onPress && onPress(item)}
      style={[styles.rowViewSB, containerStyle]}>
      <View style={styles.symbolRow}>
        {/* <View style={[styles.iconWrapper, {backgroundColor}]}>{Icon}</View> */}
        <Text style={styles.symbolText}>{getPrimaryText()}</Text>
      </View>

      <Text style={styles.symbolText}>{getSecondryText()}</Text>
    </TouchableOpacity>
  );
};

export default StatusCardItem;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(0.5),
    },
    symbolRow: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      height: hp(3.5),
      width: hp(3.5),
      borderRadius: hp(2.25),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
    },
    symbolText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
    },
  });
