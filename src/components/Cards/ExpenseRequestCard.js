import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {capitalize} from '@utils/Helpers';
import {statusStyles} from '@constants/DummyData';
import StatusBox from './StatusBox';
import moment from 'moment';
import { pxToPercentage } from '@utils/responsive';

// Reusable Account Card Component
const ExpenseRequestCard = ({item, onPress}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const statusStyle =
    statusStyles[
      item?.status === 'initiated' ? 'Processing' : capitalize(item?.status)
    ] || {};

  // Format account executive name
  const accountExecutiveName = capitalize(item?.worker?.name || 'Unknown');

  // Format date
  const formattedDate = item?.date_of_expense
    ? moment(item?.date_of_expense).format('DD MMMM, YYYY')
    : '--';

  // Format amount
  const formattedAmount = item?.amount ? `$${item.amount}` : '--';

  // Status text
  const statusText = item?.status === 'initiated' ? 'Processing' : capitalize(item?.status);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, styles.container]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.headerLeft}>
          {/* <View style={styles.logoContainer}>
            {item?.worker?.profile_image ? (
              <Image source={{uri: item.worker.profile_image}} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>
                  {accountExecutiveName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View> */}
          <View style={styles.headerInfo}>
            <Text
              style={styles.employeeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {accountExecutiveName}
            </Text>
            <Text style={styles.employeeId}>ID: {item?.worker?.id || '--'}</Text>
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
              <Text style={styles.detailLabel}>{t('Description')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item?.description || '--'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Amount')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedAmount}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Date')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedDate}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Status')}:</Text>
            </View>
            <StatusBox
              status={statusText}
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    card: {},
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    section: {
      marginRight: wp(4),
      marginBottom: hp(1),
    },
    label: {
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: Fonts.PoppinsRegular,
    },
    accountName: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    email: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    amount: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoBold,
    },
    availableAmount: {
      fontSize: RFPercentage(1.8),
      color: '#10b981',
      fontFamily: Fonts.NunitoSemiBold,
    },
    status: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsMedium,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.8),
      borderRadius: wp(1.5),
      overflow: 'hidden',
    },
    Btn: {
      paddingHorizontal: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
    },
    btnText: {
      fontSize: RFPercentage(pxToPercentage(12)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      textAlign: 'center',
    },
  });

export default ExpenseRequestCard;

// USAGE EXAMPLE:
// <ThresholdCard
//   accountName="fatima account"
//   email="redalam986@haotuwu.com"
//   balance={29.97}
//   pending={0}
//   reserved={0}
//   available={20.03}
//   status="Below Threshold"
//   statusColor="#f97316"
// /
