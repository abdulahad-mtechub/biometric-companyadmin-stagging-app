import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
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
import {statusStyles} from '@constants/DummyData';
import {capitalize, formatCurrency} from '@utils/Helpers';
import moment from 'moment';

export default function EmployeeCard({
  item,
  onPress,
  onBtnPress,
  onMessagePress,
  onDeletePress,
  onImageError,
  imageErrors,
  containerStyle,
  showDesignationInsteadOfDepartment = false,
}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  // Get status styling from statusStyles
  const statusStyle = statusStyles[capitalize(item?.status)] || {};

  // Format full name
  const fullName = `${item?.first_name || ''} ${item?.middle_name || ''} ${
    item?.last_name || ''
  }`.trim();

  // Format salary
  const formattedSalary = item?.salary
    ? formatCurrency(parseFloat(item.salary))
    : '--';

  // Format work hours
  const formattedWorkHours = item?.work_hours ? `${item.work_hours} hrs` : '--';

  // Format registered date
  const formattedDate = item?.created_at
    ? moment(item.created_at).format('DD MMMM, YYYY')
    : '--';

  // Employee details
  const employeeEmail = item?.email || '';
  const employeePhone = item?.phone || '';
  const departmentName = item?.department_name || '';
  const designation = item?.designation || '';
  const employeeType = item?.employee_type || '';
  const shiftSchedule = item?.shift_schedule || '';
  const employeeStatus = item?.status || 'N/A';

  // Employee ID (use worker_id for department employees, id for regular employees)
  const employeeId =  item?.id || '';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            {item?.profile_image && !imageErrors?.[item.id] ? (
              <Image
                source={{uri: item.profile_image}}
                style={styles.logo}
                onError={() => onImageError && onImageError(item.id)}
              />
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
              {fullName || 'Unknown Employee'}
            </Text>
            <Text style={styles.employeeId}>ID: {employeeId}</Text>
          </View>
        </View>

        {/* Right: Message Button, Menu Dots Button */}
        <View style={styles.headerRight}>
          {(onMessagePress && employeeStatus === 'active')  && (
            <TouchableOpacity
              onPress={onMessagePress}
              style={styles.messageButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Svgs.messageL height={hp(2.5)} width={hp(2.5)} />
            </TouchableOpacity>
          )}

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
              <Text style={styles.detailLabel}>{t('Email')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {employeeEmail || '--'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Phone')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {employeePhone || '--'}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>
                {showDesignationInsteadOfDepartment
                  ? t('Designation')
                  : t('Department')}
                :
              </Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {showDesignationInsteadOfDepartment
                ? capitalize(designation) || '--'
                : capitalize(departmentName) || '--'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Type')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {t(capitalize(employeeType)) || '--'}
            </Text>
          </View>
        </View>

        {!showDesignationInsteadOfDepartment && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Text style={styles.detailLabel}>{t('Shift')}:</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {shiftSchedule || '--'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Text style={styles.detailLabel}>{t('Salary')}:</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formattedSalary}
              </Text>
            </View>
          </View>
        )}
        {/* Row 3 */}

        {/* Row 4 */}
        <View style={styles.detailRow}>
          {showDesignationInsteadOfDepartment ? (
            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Text style={styles.detailLabel}>{t('Registered On')}:</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formattedDate}
              </Text>
            </View>
          ) : (
            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Text style={styles.detailLabel}>{t('Work Hours')}:</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formattedWorkHours}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Status')}:</Text>
            </View>
            <StatusBox
              status={capitalize(employeeStatus)}
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>
        </View>

        {!showDesignationInsteadOfDepartment && (
          <View style={styles.detailRow}>
            <View style={[styles.detailItem, {flex: 1}]}>
              <View style={styles.detailLabelContainer}>
                <Text style={styles.detailLabel}>{t('Registered On')}:</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
                {formattedDate}
              </Text>
            </View>
          </View>
        )}
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
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    messageButton: {
      padding: wp(2),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderWidth: 1,
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
