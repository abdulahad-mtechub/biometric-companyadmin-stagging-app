import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
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
import {statusStyles} from '@constants/DummyData';
import {capitalize} from '@utils/Helpers';

export default function ReceivedDocumentCard({item, onPress, containerStyle}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const category = item?.category || '--';
  const senderName = item?.owner?.name || '--';
  const senderEmail = item?.owner?.email || '--';
  const documentName = item?.name || 'Unknown Document';
  const description = item?.description || '--';
  const status = item?.status || 'N/A';
  const fileType = item?.file_type || '--';
  const formattedDate = item?.uploaded_at
    ? moment(item.uploaded_at).format('DD MMM YYYY')
    : '--';

  // Get status styling from statusStyles
  const statusStyle = statusStyles[capitalize(status)] || {};

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, containerStyle]}>
      <View style={styles.detailsGrid}>
        {/* Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Sender Name')}:</Text>
            <Text style={styles.detailValue}>{capitalize(senderName)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Sender Email')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {senderEmail}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Category')}:</Text>
            <Text style={styles.detailValue}>{t(capitalize(category))}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Document Name')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {documentName}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Description')}:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {description}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('File Type')}:</Text>
            <Text style={styles.detailValue}>{fileType.toUpperCase()}</Text>
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Status')}:</Text>
            <StatusBox
              status={capitalize(status)}
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Date')}:</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
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
  });
