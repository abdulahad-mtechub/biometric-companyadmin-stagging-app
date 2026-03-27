import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import StatusBox from './StatusBox';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import { statusStyles } from '../../Constants/DummyData';
import {capitalize} from '@utils/Helpers';

const getPunchTime = (punches, actionType) => {
  if (!punches || !Array.isArray(punches)) return '--';
  const punch = punches.find(p => p.actionType === actionType);
  if (!punch?.occurredAt) return '--';
  return moment(punch.occurredAt).format('h:mm A');
};

const getStatusLabel = status => {
  if (!status) return 'Unknown';
  switch (status) {
    case 'HAS_ISSUES':
      return 'Has Issues';
    case 'OVERTIME':
      return 'Overtime';
    case 'EARLY_OUT':
      return 'Early Out';
    case 'HALF_DAY':
      return 'Half Day';
    case 'ABSENT':
      return 'Absent';
    case 'PRESENT':
      return 'Present';
    case 'LATE_ARRIVAL':
      return 'Late Clock In';
    case 'LATE_AND_EARLY_OUT':
      return 'Late & Early Out';
    default:
      return status;
  }
};

export default function AttendanceHistoryCard({item, onPress, containerStyle}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const fullName = item?.worker?.fullName || 'Unknown Worker';
  const profileImage = item?.worker?.profileImage;
  const formattedDate = item?.date
    ? moment(item.date).format('DD MMM YYYY')
    : '--';
  const locationSummary = item?.locationSummary || 'Location not available';
  const issuesCount = item?.attendance?.issuesCount || '0';
  const status = item?.statusBadge?.status;

  // Get status styling from statusStyles (like EmployeeCard)
  const statusLabel = getStatusLabel(status);
  const statusStyle = statusStyles[statusLabel] || {};

  // Get punch times
  const checkInTime = getPunchTime(item?.punches, 'CLOCK_IN');
  const checkOutTime = getPunchTime(item?.punches, 'CLOCK_OUT');
  const breakStartTime = getPunchTime(item?.punches, 'BREAK');
  const breakEndTime = getPunchTime(item?.punches, 'BACK_FROM_BREAK');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>
                  {fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text
              style={styles.employeeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {fullName}
            </Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Row 1: Check In & Check Out */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Clock In')}:</Text>
            </View>
            <Text style={styles.detailValue}>{checkInTime}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Clock Out')}:</Text>
            </View>
            <Text style={styles.detailValue}>{checkOutTime}</Text>
          </View>
        </View>

        {/* Row 2: Break Start & Break End */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Break Start')}:</Text>
            </View>
            <Text style={styles.detailValue}>{breakStartTime}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Break End')}:</Text>
            </View>
            <Text style={styles.detailValue}>{breakEndTime}</Text>
          </View>
        </View>

        {/* Row 3: Location */}
        <View style={styles.detailRow}>
          <View style={[styles.detailItem, {flex: 1}]}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Location')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2}>
              {locationSummary}
            </Text>
          </View>
        </View>

        {/* Row 4: Issues & Status */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Issues')}:</Text>
            </View>
            <Text style={styles.detailValue}>{issuesCount}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Status')}:</Text>
            </View>
            <StatusBox
              status={statusLabel}
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(6),
      padding: wp(4),
      margin: hp(1.5),
      elevation: 2,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      marginRight: wp(3),
    },
    logo: {
      width: hp(6),
      height: hp(6),
      borderRadius: hp(3),
    },
    logoPlaceholder: {
      width: hp(6),
      height: hp(6),
      borderRadius: hp(3),
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsSemiBold,
      color: '#FFFFFF',
    },
    headerInfo: {
      flex: 1,
    },
    employeeName: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.2),
    },
    dateText: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.NunitoRegular,
      color: isDarkMode
        ? Colors.darkTheme.thirdTextColor
        : Colors.lightTheme.thirdTextColor,
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.borderColor || 'rgba(255, 255, 255, 0.1)'
        : Colors.lightTheme.borderColor || 'rgba(0, 0, 0, 0.1)',
      marginBottom: hp(1.5),
    },
    detailsGrid: {
      gap: hp(1),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    detailItem: {
      flex: 1,
    },
    detailLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(0.3),
      gap: wp(1.5),
    },
    detailLabel: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    detailValue: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.NunitoRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      paddingLeft: hp(2) + wp(1.5),
    },
  });
