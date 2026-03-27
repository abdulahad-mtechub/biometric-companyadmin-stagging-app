import moment from 'moment';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StatusChangeModal from '@components/CustomModal/StatusChangeModal';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {
  ApiResponse,
  capitalize,
  fetchApis,
  requestStoragePermission,
} from '@utils/Helpers';

// Add these imports for file download
import RNFS from 'react-native-fs';

import RNFetchBlob from 'react-native-blob-util';

// Add these icon imports
import Icon from 'react-native-vector-icons/MaterialIcons';
import logger from '@utils/logger';

const RequestDetails = ({route, navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {company, token, User, language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  const type = route.params?.requestType;
  const [item, setItem] = useState(route.params?.item);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const formatType = type => {
    return capitalize(
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    );
  };

  // Function to check if file is PDF
  const isPdfFile = fileUrl => {
    if (!fileUrl) return false;
    return (
      fileUrl.toLowerCase().endsWith('.pdf') ||
      fileUrl.toLowerCase().includes('.pdf') ||
      fileUrl.toLowerCase().includes('application/pdf')
    );
  };

  // Function to check if file is an image
  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };

  // Function to get file name from URL
  const getFileName = fileUrl => {
    if (!fileUrl) return 'File';
    return fileUrl.split('/').pop() || 'File';
  };

  // Function to handle PDF download
  const handlePdfDownload = async fileUrl => {
    if (!fileUrl) {
      showAlert('No PDF file available', 'error');
      return;
    }

    try {
      setDownloadLoading(true);

      const hasPermission = await requestStoragePermission();
      logger.log('hasPermission :', hasPermission, { context:'RequestDetails' });
      if (!hasPermission) {
        setDownloadLoading(false);
        return;
      }

      const fileName = getFileName('fileUrl');
      const fileExtension = fileName.includes('.pdf') ? '' : '.pdf';
      const finalFileName = fileName.includes('.pdf')
        ? fileName
        : `${fileName}${fileExtension}`;

      // Define download path
      const downloadDir =
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath;

      const filePath = `${downloadDir}/${finalFileName}`;

      // Download file using RNFetchBlob
      const downloadTask = RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading PDF file',
        },
        path: filePath,
      }).fetch('GET', fileUrl, {
        Authorization: `Bearer ${token}`,
      });

      downloadTask
        .then(res => {
          setDownloadLoading(false);

          if (Platform.OS === 'ios') {
            // For iOS, show success message
            RNFetchBlob.ios.previewDocument(res.path());
            showAlert(
              `PDF downloaded successfully to Documents folder`,
              'success',
            );
          } else {
            // For Android
            showAlert(
              `PDF downloaded successfully to Downloads folder`,
              'success',
            );
          }

        })
        .catch(error => {
          setDownloadLoading(false);
          logger.error('Download error:', error, { context:'RequestDetails' });
          showAlert('Failed to download PDF file', 'error');
        });
    } catch (error) {
      setDownloadLoading(false);
      logger.error('Download error:', error, { context:'RequestDetails' });
      showAlert('Failed to download PDF file', 'error');
    }
  };

  // Function to handle image press - show in modal
  const handleImagePress = fileUrl => {
    if (!fileUrl) {
      showAlert('No image available', 'error');
      return;
    }
    setImageModalVisible(true);
  };

  const styles = dynamicStyles(isDarkMode, theme, Colors);
  const RequestDetail = [
    {label: 'Requester Name', value: item?.requester_name},
    {label: 'Requester Email', value: item?.requester_email},
    {label: 'Type', value: formatType(item?.type)},
    {label: 'Details', value: capitalize(item?.details)},
    ...(item?.decided_by_name && item?.admin_comment
      ? [
          {label: 'Decision Maker', value: item?.decided_by_name},
          {label: 'Decision', value: capitalize(item?.admin_comment)},
        ]
      : []),
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);

  // API logic moved here from StatusChangeModal
  const handleStatusChange = async (selectedStatus, comment) => {
    const payload = {
      action: selectedStatus.value,
      comment: comment.trim(),
    };

    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/requests/v1/companies/${company?.id}/requests/${item?.id}/decision`,
        'POST',
        setLoading,
        payload,
        null,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);

      if (ok && !data.error) {
        // showAlert(data.message, 'success');
        setIsModalVisible(false);

        setItem(prevItem => ({
          ...prevItem,
          status: data.data.status,
          admin_comment: comment.trim(),
          decided_by_name: User?.name, // You might want to get this from user state
        }));

        return {success: true};
      } else {
        // showAlert(data.message, 'error');
        // return {success: false, error: data.message};
        return;
      }
    } catch (err) {
      logger.error('Local submit error:', err, { context:'RequestDetails' });
      showAlert('An error occurred while updating status', 'error');
      return {success: false, error: err.message};
    }
  };

  logger.log(item, { context:'RequestDetails' });

  return (
    <View style={styles.container}>
      <ScrollView style={{flex: 1}}>
        <StackHeader
          title={formatType(item?.type)}
          headerTxtStyle={styles.headerTxtStyle}
          onBackPress={() => navigation.goBack()}
          headerStyle={styles.headerStyle}
        />
        <View style={styles.statusContainer}>
          <WorkerStatus
            name={'Status'}
            status={
              capitalize(item.status) === 'Info_requested'
                ? 'Request Info'
                : capitalize(item.status)
            }
            nameTextStyle={styles.statusText}
          />
          <View style={styles.rowSb}>
            <Text style={[styles.statusText]}>{t('Requested')}</Text>
            <Text
              style={[
                styles.statusText,
                {fontFamily: Fonts.PoppinsRegular, fontSize: RFPercentage(1.6)},
              ]}>
              {moment(item?.createdAt).format('DD MMM, YYYY')}
            </Text>
          </View>
          {item?.subject && (
            <View style={[styles.rowSb, {flexWrap: 'wrap'}]}>
              <Text style={[styles.statusText]}>{t('Subject')}</Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    fontFamily: Fonts.PoppinsRegular,
                    fontSize: RFPercentage(1.6),
                    textAlign: 'right',
                    width: '60%',
                  },
                ]}>
                {item?.subject}
              </Text>
            </View>
          )}
        </View>

        <RequestDetailsCard details={RequestDetail} showFrom={false} />

        
        {item?.file_url && (
          <View style={styles.fileContainer}>
            <Text style={styles.fileSectionTitle}>{t('Attached File')}</Text>

            {isPdfFile(item.file_url) ? (
              // PDF File - Downloadable
              <TouchableOpacity
                style={styles.fileItem}
                onPress={() => handlePdfDownload(item.file_url)}
                disabled={downloadLoading}>
                <View style={styles.pdfIconContainer}>
                  <Icon name="picture-as-pdf" size={wp(10)} color="#FF0000" />
                  <Text style={styles.fileTypeText}>PDF</Text>
                  {downloadLoading && (
                    <View style={styles.downloadOverlay}>
                      <Icon name="file-download" size={wp(6)} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {item?.file_name || getFileName(item.file_url)}
                  </Text>
                  <Text style={styles.fileUrl} numberOfLines={1}>
                    {item.file_url}
                  </Text>
                  <View style={styles.downloadInfo}>
                    <Icon
                      name="file-download"
                      size={RFPercentage(1.8)}
                      color={
                        isDarkMode
                          ? Colors.darkTheme.primaryBtn.BtnColor
                          : Colors.lightTheme.primaryBtn.BtnColor
                      }
                    />
                    <Text style={styles.downloadText}>
                      {downloadLoading
                        ? t('Downloading...')
                        : t('Tap to download')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : isImageFile(item.file_url) ? (
              // Image File - Display in app
              <TouchableOpacity
                style={styles.fileItem}
                onPress={() => handleImagePress(item.file_url)}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: item.file_url}}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  
                </View>

                
              </TouchableOpacity>
            ) : (
              // Other file types
              <View style={styles.fileItem}>
                <View style={styles.unknownFileContainer}>
                  <Icon
                    name="insert-drive-file"
                    size={wp(8)}
                    color={theme.primaryTextColor}
                  />
                  <Text style={styles.unknownFileText}>{t('File')}</Text>
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {item?.file_name || getFileName(item.file_url)}
                  </Text>
                  <Text style={styles.fileUrl} numberOfLines={1}>
                    {item.file_url}
                  </Text>
                  <Text style={styles.unknownFileType}>
                    {t('Unknown file type')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}>
              <Icon name="close" size={wp(6)} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('Image Preview')}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.imageModalContent}>
            <Image
              source={{uri: item?.file_url}}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>

      {item.status === 'REJECTED' ||
      item.status === 'APPROVED' ||
      item.status === "INFO_REQUESTED" ? null : (
        <View style={styles.btnContainer}>
          <CustomButton
            text={'Update Status'}
            onPress={() => {
              setIsModalVisible(true);
            }}
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
            isLoading={loading}
            disabled={loading}
          />
        </View>
      )}

      <StatusChangeModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onStatusChange={handleStatusChange}
        status={item.status}
      />
    </View>
  );
};

export default RequestDetails;

const dynamicStyles = (isDarkMode, theme, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginTop: wp(2),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: theme.primaryTextColor,
      fontSize: RFPercentage(1.9),
    },
    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
    },
    // File Display Styles
    fileContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      marginTop: hp(2),
      padding: wp(4),
      borderRadius: wp(3),
    },
    fileSectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: theme.primaryTextColor,
      marginBottom: hp(2),
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp(3),
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.backgroundColor}50`
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    pdfIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(4),
      position: 'relative',
    },
    downloadOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: wp(2),
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileTypeText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: theme.primaryTextColor,
      marginTop: hp(0.5),
    },
    imageContainer: {
      position: 'relative',
      marginRight: wp(4),
    },
    imagePreview: {
      width: wp(80),
      height: hp(30),
      resizeMode: 'contain',
      borderRadius: wp(1),
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: wp(1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewImageText: {
      color: '#FFFFFF',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.2),
      marginTop: hp(0.5),
    },
    unknownFileContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(4),
    },
    unknownFileText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: theme.primaryTextColor,
      marginTop: hp(0.5),
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: theme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    fileUrl: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(0.5),
    },
    downloadInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    downloadText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.3),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      marginLeft: wp(1),
    },
    tapToOpen: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.3),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      fontStyle: 'italic',
    },
    unknownFileType: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.3),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontStyle: 'italic',
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: hp(6),
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
    },
    closeButton: {
      padding: wp(2),
    },
    modalTitle: {
      color: '#FFFFFF',
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
    },
    placeholder: {
      width: wp(6),
    },
    imageModalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(4),
    },
    fullSizeImage: {
      width: '100%',
      height: '80%',
    },
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      marginHorizontal: wp(4),
      marginBottom: hp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      flex: 1,
    },
    valueContainer: {
      flex: 1.2,
      alignItems: 'flex-end',
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
    },
    title: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'center',
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingBottom: hp(2),
      paddingTop: wp(4),
      paddingHorizontal: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    SkipButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#f1f2f4',
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    SkipButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryBtn.TextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
  });
