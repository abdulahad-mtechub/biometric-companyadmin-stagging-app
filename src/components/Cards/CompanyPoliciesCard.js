import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {capitalize} from '@utils/Helpers';
import {Svgs} from '@assets/Svgs/Svgs';
import {statusStyles} from '@constants/DummyData';
import StatusBox from './StatusBox';

export default function CompanyPoliciesCard({
  item,
  onPress,
  onBtnPress,
  containerStyle,
}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const subject = item?.subject || '--';
  const documentName = item?.name || 'Unknown Document';
  const file_size = item?.file_size || '--';
  const description = item?.description || '--';
  const formattedDate = item?.expires_at
    ? moment(item.expires_at).format('DD MMM YYYY')
    : '--';
  const status = capitalize(item?.status) || null;

  const statusStyle = statusStyles[status] || {};

  const accessMode = item?.access_mode ? capitalize(item?.access_mode) : null;
  const accessModeStyle = statusStyles[accessMode] || {};
  const recipientsLength = item?.recipient_worker_ids?.length || 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      <View style={styles.detailsGrid}>
        {/* Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Subject')}:</Text>
            <Text style={styles.detailValue}>{capitalize(subject)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, {width: wp(36)}]}>{t('Document Name')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {documentName}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Description')}:</Text>
            <Text style={styles.detailValue}>{description}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Expire At')}:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          {file_size && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('File Size')}:</Text>
              <Text style={styles.detailValue}>{file_size}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Status')}:</Text>
            <StatusBox
              status={capitalize(status)}
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>
        </View>
        <View style={styles.detailRow}>
          {accessMode === 'Specific' && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('Recipients')}:</Text>
              <Text style={styles.detailValue}>{recipientsLength}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Access Mode')}:</Text>
            <StatusBox
              status={accessMode === 'All' ? t('All Employees') : 'Specific'}
              backgroundColor={accessModeStyle?.backgroundColor}
              color={accessModeStyle?.color}
              icon={accessModeStyle?.icon}
            />
          </View>
        </View>
      </View>

      {/* Menu Dots Button */}
      {onBtnPress && (
        <TouchableOpacity
          onPress={onBtnPress}
          style={styles.menuButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Svgs.menuDots height={hp(3)} width={hp(3)} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(4),
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
    detailsGrid: {
      gap: hp(1.5),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    detailItem: {
      flex: 1,
    },
    detailLabel: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(0.3),
    },
    detailValue: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.NunitoRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    menuButton: {
      position: 'absolute',
      top: hp(1),
      right: wp(1),
      padding: wp(1),
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
