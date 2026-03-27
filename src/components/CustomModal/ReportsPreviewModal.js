import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
import { Colors } from '@constants/themeColors';
import { Fonts } from '@constants/Fonts';
import { exportToExcelPreview, exportToPDFReportPreview } from '@utils/exportUtils';
import { useAlert } from '@providers/AlertContext';
import { t } from 'i18next';
import { useSelector } from 'react-redux';
import logger from '@utils/logger';

const ReportsPreviewModal = ({
  visible,
  onClose,
  title = 'Document Preview',
  data = [],
  buttonLabel = 'Generate Document',
  onButtonPress,
  theme = 'light', // 'dark' or 'light'
}) => {
  const colorTheme = theme === 'dark' ? Colors.darkTheme : Colors.lightTheme;
  const { company} = useSelector(store => store.auth);

  const {showAlert} = useAlert()

  // Loading states for export operations
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);

  // Reset loading states when modal closes
  useEffect(() => {
    if (!visible) {
      setIsPdfLoading(false);
      setIsExcelLoading(false);
    }
  }, [visible]);

  const companyLogo = company?.logo_url
    ? company?.logo_url
    : 'https://biometric-staging-backend.caprover-testing.mtechub.com/api/uploads/profile-pictures/profile-1763719661642-489726642.png';

  // PDF export handler with loading state
  const handlePdfExport = async () => {
    setIsPdfLoading(true);
    try {
      await exportToPDFReportPreview(
        data,
        showAlert,
        onClose,
        t('Report Preview'),
        t('Label'),
        t('Value'),
        companyLogo
      );
    } catch (error) {
      logger.error('PDF export error:', error, { context: 'ReportsPreviewModal' });
      showAlert(t('Failed to export PDF'), 'error');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Excel export handler with loading state
  const handleExcelExport = async () => {
    setIsExcelLoading(true);
    try {
      await exportToExcelPreview(
        data,
        showAlert,
        onClose,
        t('Label'),
        t('Value')
      );
    } catch (error) {
      logger.error('Excel export error:', error, { context: 'ReportsPreviewModal' });
      showAlert(t('Failed to export Excel'), 'error');
    } finally {
      setIsExcelLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colorTheme.secondryColor },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colorTheme.primaryTextColor, fontFamily: Fonts.PoppinsSemiBold },
              ]}
            >
              {t(title)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{
                  fontSize: RFPercentage(2.5),
                  color: colorTheme.iconColor,
                  fontFamily: Fonts.PoppinsBold,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { borderBottomColor: colorTheme.BorderGrayColor }]} />

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: hp(60), marginTop: hp(1.5) }}
          >
            {data.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colorTheme.BorderGrayColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: colorTheme.secondryTextColor, fontFamily: Fonts.PoppinsRegular },
                  ]}
                >
                  {t(item.label)}
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: colorTheme.primaryTextColor, fontFamily: Fonts.PoppinsMedium },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isPdfLoading
                  ? Colors.lightTheme.BorderGrayColor
                  : colorTheme.primaryBtn.BtnColor,
                opacity: isPdfLoading ? 0.7 : 1,
              },
            ]}
            onPress={handlePdfExport}
            disabled={isPdfLoading || isExcelLoading}
          >
            {isPdfLoading ? (
              <ActivityIndicator
                color={colorTheme.primaryBtn.TextColor}
                size="small"
              />
            ) : (
              <Text
                style={{
                  color: colorTheme.primaryBtn.TextColor,
                  fontSize: RFPercentage(1.8),
                  fontFamily: Fonts.PoppinsMedium,
                }}
              >
                {t('Export to PDF')}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isExcelLoading
                  ? Colors.lightTheme.BorderGrayColor
                  : colorTheme.primaryBtn.BtnColor,
                opacity: isExcelLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleExcelExport}
            disabled={isPdfLoading || isExcelLoading}
          >
            {isExcelLoading ? (
              <ActivityIndicator
                color={colorTheme.primaryBtn.TextColor}
                size="small"
              />
            ) : (
              <Text
                style={{
                  color: colorTheme.primaryBtn.TextColor,
                  fontSize: RFPercentage(1.8),
                  fontFamily: Fonts.PoppinsMedium,
                }}
              >
                {t('Export to Excel')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReportsPreviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(85),
    borderRadius: wp(3),
    padding: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: RFPercentage(2.3),
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: hp(1),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
  },
  label: {
    fontSize: RFPercentage(1.8),
    width: wp(45),
  },
  value: {
    fontSize: RFPercentage(1.6),
    textAlign: 'right',
    flexShrink: 1,
  },
  button: {
    alignSelf: 'center',
    marginTop: hp(2.5),
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
  },
});
