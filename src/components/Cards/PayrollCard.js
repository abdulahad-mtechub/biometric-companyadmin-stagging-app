import React, {useState} from 'react';
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
import {Svgs} from '@assets/Svgs/Svgs';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';

// Reusable Payroll Card Component
const PayrollCard = ({item, onPress}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  // State for modals
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const statusStyle =
    statusStyles[
      item?.status ? capitalize(item.status) : 'Paid'
    ] || {};

  // Format employee name
  const employeeName = capitalize(item?.worker?.name || 'Unknown');

  // Format date
  const formattedDate = item?.paid_at
    ? moment(item?.paid_at).format('DD MMMM, YYYY')
    : '--';

  // Format amount
  const formattedAmount = item?.amount ? `$${item.amount}` : '--';

  // Status text
  const statusText = item?.status ? capitalize(item.status) : 'Paid';

  // Check if attachment is image
  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };

  // Handle attachment preview
  const handleAttachmentPress = () => {
    if (!item?.attachment_url) return;

    if (isImageFile(item.attachment_url)) {
      setShowImageModal(true);
    } else {
      setShowDocumentModal(true);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, styles.container]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Profile Picture and Name */}
        <View style={styles.headerLeft}>
          {/* <View style={styles.logoContainer}>
            {item?.worker?.profile_image ? (
              <Image
                source={{uri: item.worker.profile_image}}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>
                  {employeeName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View> */}
          <View style={styles.headerInfo}>
            <Text
              style={styles.employeeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {employeeName}
            </Text>
            <Text style={styles.employeeId}>ID: {item?.worker?.id || '--'}</Text>
          </View>
        </View>

        {/* Right: Attachment Eye Icon */}
        {item?.attachment_url && (
          <TouchableOpacity
            onPress={handleAttachmentPress}
            style={styles.attachmentButton}>
            <Svgs.eye height={hp(3)} width={wp(6)} />
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Salary')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedAmount}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Payment Date')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedDate}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Payment Method')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item?.payment_method || 'N/A'}
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

        {/* Row 3 - Comments */}
        <View style={styles.detailRow}>
          <View style={styles.detailItemFull}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>{t('Comments')}:</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2}>
              {item?.note || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Document Preview Modal */}
      <DocumentViewModal
        visible={showDocumentModal}
        documentUrl={item?.attachment_url}
        onClose={() => setShowDocumentModal(false)}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={showImageModal}
        imageUri={item?.attachment_url}
        onClose={() => setShowImageModal(false)}
      />
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
    attachmentButton: {
      padding: wp(2),
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
    detailItemFull: {
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

export default PayrollCard;
