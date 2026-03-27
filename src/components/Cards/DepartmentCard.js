import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import StatusBox from './StatusBox';
import {useTranslation} from 'react-i18next';
import {capitalize} from '@utils/Helpers';
import moment from 'moment';

export default function DepartmentCard({
  item,
  onPress,
  onBtnPress,
  onDeletePress,
  containerStyle,
}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  // Format date and time
  const formattedDateTime = item?.created_at
    ? moment(item.created_at).format('DD MMM YYYY - h:mm a')
    : '--';

  // Get status from is_active field
  const departmentStatus = item?.is_active ? 'Active' : 'Inactive';

  // Department details
  const departmentName = item?.name || 'Unknown Department';
  const employeeCount = item?.worker_count || '0';

  // Department ID
  const departmentId = item?.id || '';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Icon and Name */}
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Svgs.DepartmentBlue height={hp(4)} width={hp(4)} />
          </View>
          <View style={styles.headerInfo}>
            <Text
              style={styles.departmentName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {departmentName}
            </Text>
            <Text style={styles.departmentId}>ID: {departmentId}</Text>
          </View>
        </View>

        {/* Right: Menu Dots Button */}
        <View style={styles.headerRight}>
          {onBtnPress && (
            <TouchableOpacity
              onPress={onBtnPress}
              style={styles.menuButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Svgs.menuDots height={hp(3)} width={hp(3)} />
            </TouchableOpacity>
          )}
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
              <Text style={styles.detailLabel}>{t('Employees')}:</Text>
            </View>
            <Text style={styles.detailValue}>{employeeCount}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Status')}:</Text>
            </View>
            <StatusBox
              status={capitalize(departmentStatus)}
              backgroundColor={item?.is_active ? '#4CAF50' : '#F44336'}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={[styles.detailItem, {flex: 1}]}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Date - Time')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedDateTime}
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
    iconContainer: {
      marginRight: wp(3),
    },
    headerInfo: {
      flex: 1,
    },
    departmentName: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.2),
    },
    departmentId: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.NunitoRegular,
      color: isDarkMode
        ? Colors.darkTheme.thirdTextColor
        : Colors.lightTheme.thirdTextColor,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    menuButton: {
      padding: wp(1),
      justifyContent: 'center',
      alignItems: 'center',
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
