import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs'; // Ensure this contains your icons
import {pxToPercentage} from '@utils/responsive';
import Loader from '@components/Loaders/loader';
import {formatNumbertoK} from '@utils/Helpers';
import logger from '@utils/logger';

const cardStyles = {
  // First layout styles
  Employees: {
    icon: <Svgs.workerWhite />,
    backgroundColor: '#579DFF',
    subTextIcon: <Svgs.greenArrow />,
  },
  'Assigned Task': {
    icon: <Svgs.workerWhite />,
    backgroundColor: '#579DFF',
    subTextIcon: <Svgs.greenArrow />,
  },
  Departments: {icon: <Svgs.DepartmentWhite />, backgroundColor: '#9F8FEF'},
  Request: {icon: <Svgs.RequestWhite />, backgroundColor: '#FEA362'},
  'Ongoing Projects': {
    icon: <Svgs.RequestWhite />,
    backgroundColor: '#F5CD47',
    subTextIcon: <Svgs.greenArrow />,
  },
  'Completed Projects': {
    icon: <Svgs.CheckOutline height={hp(3)} width={hp(2.5)} />,
    backgroundColor: '#4BCE97',
    subTextIcon: <Svgs.greenArrow />,
  },
  'Completed Task': {
    icon: <Svgs.CheckOutline height={hp(3)} width={hp(2.5)} />,
    backgroundColor: '#4BCE97',
    subTextIcon: <Svgs.greenArrow />,
  },
  Ongoing: {
    icon: <Svgs.ongoingWhite />, // Replace with actual SVG
    backgroundColor: '#9F8FEF',
    subTextIcon: <Svgs.Spinner />, // Replace with actual spinner SVG
  },
  'Ongoing Projects': {
    icon: <Svgs.ongoingWhite />, // Replace with actual SVG
    backgroundColor: '#9F8FEF',
    subTextIcon: <Svgs.Spinner />, // Replace with actual spinner SVG
  },
  Requests: {
    icon: <Svgs.RequestBlack />, // Replace with actual SVG
    backgroundColor: '#F5CD47',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual calendar SVG
  },
  'Assigned Projects': {
    icon: <Svgs.leaveWhite />, // Replace with actual SVG
    backgroundColor: '#579DFF',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual calendar SVG
  },
  Delayed: {
    icon: <Svgs.delayed />, // Replace with actual SVG
    backgroundColor: '#F87168',
    subTextIcon: <Svgs.redArrow />, // Replace with actual arrow SVG
  },
  Issue: {
    icon: <Svgs.conflict />, // Replace with actual SVG
    backgroundColor: '#FEA362',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  "Unvalidated Punches": {
    icon: <Svgs.conflict />, // Replace with actual SVG
    backgroundColor: '#FEA362',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Not Done': {
    icon: <Svgs.conflict />, // Replace with actual SVG
    backgroundColor: '#000000',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  Hold: {
    icon: <Svgs.hold />, // Replace with actual SVG
    backgroundColor: '#F5CD47',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  Absent: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />, // Replace with actual SVG
    backgroundColor: '#F75555',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  Cancelled: {
    icon: <Svgs.crossWhite height={hp(4)} width={hp(4)} />, // Replace with actual SVG
    backgroundColor: '#F75555',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  Present: {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Clock In': {
    icon: <Svgs.checkin height={hp(4)} width={hp(4)} />, // Replace with actual SVG
    backgroundColor: '#ffffff',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Late Clock In': {
    icon: <Svgs.delayed height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Late Arrival': {
    icon: <Svgs.delayed height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Late Clock In': {
    icon: <Svgs.delayed height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
    subTextIcon: <Svgs.calenderBlue />, // Replace with actual arrow SVG
  },
  'Early Out': {
    icon: <Svgs.earlyOut height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#B891F3',
  },
  Leave: {
    icon: <Svgs.leaveWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#65B7F3',
  },
  'Half Leave': {
    icon: <Svgs.halfLeav height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FFD645',
  },
  'On Time Clock In': {
    icon: <Svgs.OnTimecheckIn height={hp(4)} width={hp(4)} />,
    backgroundColor: '#ffffff',
  },
  'On Time Clock Out': {
    icon: <Svgs.OnTimecheckout height={hp(4)} width={hp(4)} />,
    backgroundColor: '#ffffff',
  },
  'Start Break': {
    icon: <Svgs.checkInSvg height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '',
  },
  'Break End': {
    icon: <Svgs.BreakSvg height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '',
  },
  'Clock Out': {
    icon: <Svgs.checkout height={hp(4.5)} width={hp(4.5)} />,
    backgroundColor: '',
  },
  'Late Clock Out': {
    icon: <Svgs.lateWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F75555',
  },
  'Active Employees': {
    icon: <Svgs.leaveWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#579DFF',
  },
  'Pending Employee Registrations': {
    icon: <Svgs.pending height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#579DFF',
  },
  'Active Employee Registrations': {
    icon: <Svgs.leaveWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#4BCE97',
  },
  'Employee Present Today': {
    icon: <Svgs.tickWhite height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#4BCE97',
  },
  'Employee Arriving on Time': {
    icon: <Svgs.ClockD height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#579DFF',
  },
  'Employee Arriving Late': {
    icon: <Svgs.delayed height={hp(2.5)} width={hp(2.5)} />, // Replace with actual SVG
    backgroundColor: '#FBA64C'
  },
  'Absent Employees': {
   icon: <Svgs.earlyOut height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#F75555',
  },
  'Pending Tasks': {
   icon: <Svgs.taskBlackD height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
  },
  'Pending Requests': {
   icon: <Svgs.RequestWhite height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
  },
  'Pending Received Documents': {
   icon: <Svgs.document height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
  },
  'Pending Reimbursement Requests': {
   icon: <Svgs.documentD height={hp(2.5)} width={hp(2.5)} />,
    backgroundColor: '#FBA64C',
  },
  'Messages': {
   icon: <Svgs.MessagesActive height={hp(3.5)} width={hp(3.5)} />,
    backgroundColor: '#ffffff',
  },
};

export default function DashboardCard({
  title,
  value,
  isLoading,
  onPress,
  isSelected,
}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const {icon, backgroundColor, subTextIcon} = cardStyles[title] || {
    icon: null,
    backgroundColor: '#9CA3AF',
    subTextIcon: null,
  };

  const showDollar =
    title === 'Earning' ||
    title === 'Pending Earnings' ||
    title === 'Total Commissions' ||
    title === 'Payouts';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        isSelected && {
          borderWidth: 2,
          borderColor: Colors.lightTheme.primaryColor,
        },
      ]}>
      {isLoading ? (
        <Loader size={wp(10)} />
      ) : (
        <View style={{paddingHorizontal: wp(2)}}>
          {icon && (
            <View style={[styles.iconContainer, {backgroundColor}]}>
              {icon}
            </View>
          )}

          <Text style={styles.title}>{t(title)}</Text>

          <Text style={styles.value}>
            {showDollar ? `$${formatNumbertoK(value)}` : formatNumbertoK(value)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    card: {
      width: wp('42%'),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp('3%'),
      paddingTop: hp('2%'),
      // paddingBottom: hp('2%'),
      marginRight: wp('4%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
    },
    iconContainer: {
      width: wp('9%'),
      height: wp('9%'),
      borderRadius: wp('100%'),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp('1.5%'),
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    value: {
      fontSize: RFPercentage(pxToPercentage(28)),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    subTextRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subTextIcon: {
      marginRight: wp('1%'),
    },
    subText: {
      fontSize: RFPercentage(pxToPercentage(13)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(30),
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
    },

    unit: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      marginLeft: wp('1%'),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });
