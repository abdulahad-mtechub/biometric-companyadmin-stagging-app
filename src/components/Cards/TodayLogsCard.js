import React, {useEffect, useState} from 'react';
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

const getStatus = status => {
  if (!status) return 'Unknown';
  const statusMap = {
    CLOCK_IN: 'Clock In',
    CLOCK_OUT: 'Clock Out',
    BREAK: 'Break Start',
    BACK_FROM_BREAK: 'Break End',
    ABSENT: 'Absent',
    PRESENT: 'Present',
    LATE_ARRIVAL: 'Late Clock In',
    ON_LEAVE: 'On Leave',
  };
  return statusMap[status] || status;
};

const getStatusColor = status => {
  if (!status) return '#808080';
  const statusMap = {
    CLOCK_IN: '#579DFF',
    CLOCK_OUT: '#FB923C',
    BREAK: '#FB923C',
    BACK_FROM_BREAK: '#34D399',
    ABSENT: '#DC3545',
    PRESENT: '#34D399',
    LATE_ARRIVAL: '#DC3545',
    ON_LEAVE: '#FACC15',
  };
  return statusMap[status] || '#34D399';
};

export default function TodayLogsCard({item, onPress, containerStyle, isHome}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const [hasImageError, setHasImageError] = useState(false);

  const fullName = item?.fullName || 'Unknown Worker';
  const email = item?.email || '--';
  const lastActivity = item?.time || '--:--';
  const locationText = item?.locationText || 'Location not available';
  const status = item?.lastStatus;
  const statusColor = getStatusColor(status);

  useEffect(() => {
    setHasImageError(false);
  }, [item?.profileImage]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            {!isHome && (
              item?.profileImage && !hasImageError ? (
                <Image
                  source={{uri: item.profileImage}}
                  style={styles.logo}
                  onError={() => setHasImageError(true)}
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>
                    {fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text
              style={styles.employeeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {fullName}
            </Text>
            <Text style={styles.employeeId} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Last Activity')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {lastActivity}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Status')}:</Text>
            </View>
            <StatusBox
              status={getStatus(status)}
              backgroundColor={statusColor}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={[styles.detailItem, {flex: 1}]}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Location')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2}>
              {locationText}
            </Text>
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
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(6),
      padding: wp(4),
      marginBottom: hp(1.5),
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
    employeeId: {
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
    },
  });
