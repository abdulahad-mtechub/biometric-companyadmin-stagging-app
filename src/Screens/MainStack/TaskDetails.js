import {viewDocument} from '@react-native-documents/viewer';
import {t} from 'i18next';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import ProductivityRatingBottomSheet from '@components/BottomSheets/ProductivityRatingBottomSheet';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {
  ApiResponse,
  capitalize,
  fetchApis,
  fetchFormDataApi,
  requestStoragePermission,
  truncateText,
} from '@utils/Helpers';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

import RNFetchBlob from 'react-native-blob-util';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import TaskStatusChangeModal from '@components/Modals/TaskStatusChangeModal';
import logger from '@utils/logger';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';

const BulletList = ({bullets}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={{marginTop: hp(0.5)}}>
      {bullets.map((point, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: hp(0.8),
          }}>
          <Text style={[styles.value, {marginRight: wp(2)}]}>●</Text>
          <Text style={[styles.value, {flex: 1}]}>{point}</Text>
        </View>
      ))}
    </View>
  );
};

const SectionHeader = ({title}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.heading}>{t(title)}</Text>
    </View>
  );
};

const DetailsCard = ({data, heading}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={styles.cardContainer}>
      <SectionHeader title={heading} />

      {data.map((item, index) => (
        <View key={index} style={{marginVertical: hp(0.5)}}>
          {item.label ? <Text style={styles.key}>{t(item.label)}</Text> : null}
          {item.bullets ? (
            <BulletList bullets={item.bullets} />
          ) : (
            <Text
              style={[styles.value, item.multiline && {lineHeight: hp(2.8)}]}>
              {item.value}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const EventItem = React.memo(({comment}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.userName}>{comment.worker_name}</Text>
        <Text style={styles.timeText}>
          {moment(comment?.created_at).format('DD MMM - h:mm A')}
        </Text>
      </View>
      <View
        style={[
          styles.commentHeader,
          {justifyContent: 'flex-start', alignItems: 'center', marginBottom: 0},
        ]}>
        <Text style={styles.userRole}>{t('Status Changed: ')}</Text>

        <View style={[styles.actionBadge, {backgroundColor: '#BCBFC2'}]}>
          <Text style={styles.actionText}>
            {capitalize(comment?.event_type)}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.commentHeader,
          {justifyContent: 'flex-start', flexDirection: 'column'},
        ]}>
        <Text style={styles.userName}>{t('Comment: ')}</Text>
        <Text style={styles.userRole}>{comment?.notes}</Text>
      </View>
    </View>
  );
});
const TaskDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode, Colors);
  const progress = '33';
  const [message, setMessage] = useState('');
  const {t} = useTranslation();
  const {item} = route.params;
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const {showAlert} = useAlert();
  const [details, setDetails] = useState({});
  const [selectedImage, setSelectedImage] = useState([]);
  const CameraBottomSheetRef = useRef(null);
  const btmSheetRef = useRef(null);
  const productivityRatingRef = useRef(null);
  const [selectedDocument, setSelectedDocument] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [isDocumentPreviewVisible, setisDocumentPreviewVisible] =
    useState(false);
  const [isModalVisible, setModalVisible] = useState(false);


  console.log(details)
  const Row = ({label, value, image}) => (
    <View style={styles.row}>
      <Text style={styles.key}>{t(label)}</Text>

      <View style={{flexDirection: 'row'}}>
        <Text
          style={[
            styles.value,
            {
              color: isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor,
              fontFamily: Fonts.PoppinsMedium,
            },
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );

  const fetchTaskDetails = async (sentMessage = false) => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks/${item.id}`,
        'GET',
        sentMessage ? null : setLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (ok && !data?.error) {
        setDetails(data.data);
      } else {
        ApiResponse(showAlert, data, language);
      }
    } catch (error) {
      logger.error('Error fetching task details:', error, {
        context: 'TaskDetails',
      });
      showAlert('Something went wrong while task details', 'error');
    }
  };
  const getStatus = status => {
    switch (status) {
      case 'not_done':
        return 'Not Done';
      default:
        return capitalize(status);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  const uploadDocumentToServer = useCallback(async document => {
    if (!document) return null;

    const formData = new FormData();
    formData.append('pdf', {
      uri: document.uri,
      type: 'application/pdf',
      name: document.name || `upload-${Date.now()}.pdf`,
    });

    try {
      const {ok, data} = await fetchFormDataApi(
        `${baseUrl}/upload/pdf`,
        'POST',
        null,
        formData,
        null,
        {'Content-Type': 'multipart/form-data'},
      );

      if (!ok) {
        throw new Error(data?.message || 'Upload failed');
      }

      return data?.data?.url;
    } catch (error) {
      logger.error('Document upload failed:', error, {context: 'TaskDetails'});
      throw error;
    }
  }, []);

  const imageUploadURL = `${baseUrl}/upload/image`;

  const uploadImageToServer = useCallback(
    async path => {
      setMsgLoading(true);
      const formDataa = new FormData();
      formDataa.append('image', {
        uri: path,
        type: 'image/jpeg',
        name: `upload-${Date.now()}.jpg`,
      });

      try {
        const {ok, data} = await fetchFormDataApi(
          imageUploadURL,
          'POST',
          null,
          formDataa,
          null,
          {'Content-Type': 'multipart/form-data'},
        );

        const imageUrl = ok ? data?.data?.url : path;

        return imageUrl;
      } catch (error) {
        logger.error('Image upload failed:', error, {context: 'TaskDetails'});
        return false;
      }
    },
    [selectedImage],
  );

  const handlePdfDownload = async fileUrl => {
    if (!fileUrl) {
      showAlert('No PDF file available', 'error');
      return;
    }

    try {
      setDownloadLoading(true);

      const hasPermission = await requestStoragePermission();
      logger.log('hasPermission :', hasPermission, {context: 'TaskDetails'});
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
          logger.error('Download error:', error, {context: 'TaskDetails'});
          showAlert('Failed to download PDF file', 'error');
        });
    } catch (error) {
      setDownloadLoading(false);
      logger.error('Download error:', error, {context: 'TaskDetails'});
      showAlert('Failed to download PDF file', 'error');
    }
  };

  const sendComment = async () => {
    try {
      setMsgLoading(true);

      let urls = [];

      if (selectedImage.length > 0) {
        const imageUrls = await uploadMultipleImages();
        urls = [...urls, ...imageUrls];
      }

      if (selectedDocument.length > 0) {
        const documentUrls = await uploadMultipleDocuments();
        urls = [...urls, ...documentUrls];
      }

      const payload = {body: message, attachments: urls ? urls : []};

      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks/${item?.id}/comments`,
        'POST',
        null,
        payload,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      if (ok && !data?.error) {
        logger.log(data.data, {context: 'TaskDetails'});
        fetchTaskDetails(true);
        setMessage('');
        setSelectedImage([]);
        setSelectedDocument([]);
      } else {
        logger.log(data, {context: 'TaskDetails'});
      }
    } catch (error) {
      logger.error('Error sending Comment:', error, {context: 'TaskDetails'});
      // showAlert('Something went wrong', 'error');
    } finally {
      setMsgLoading(false);
    }
  };

  const handleImagePick = useCallback(selectedItem => {
    // Handle both images and documents from CameraBottomSheet
    if (
      selectedItem.mime === 'application/pdf' ||
      selectedItem.path?.includes('.pdf')
    ) {
      // It's a document - store as object with uri and name
      setSelectedDocument(prev => [
        ...prev,
        {uri: selectedItem.path, name: selectedItem.name},
      ]);
    } else {
      // It's an image - store as object for consistency
      setSelectedImage(prev => [
        ...prev,
        {path: selectedItem.path, mime: selectedItem.mime},
      ]);
    }
  }, []);

  const viewSelectedDocument = useCallback(uri => {
    viewDocument({
      uri: uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, {context: 'TaskDetails'});
      showAlert(t('Failed to open document'), 'error');
    });
  }, []);

  const uploadMultipleImages = useCallback(async () => {
    if (!selectedImage?.length) return [];

    try {
      const uploadedUrls = await Promise.all(
        selectedImage.map(img => {
          // Handle both old format (string) and new format (object)
          const path = typeof img === 'string' ? img : img.path;
          return uploadImageToServer(path);
        }),
      );

      // Filter out any failed uploads (false values)
      const validUrls = uploadedUrls.filter(url => url);

      return validUrls;
    } catch (error) {
      logger.error('Multiple image upload failed:', error, {
        context: 'TaskDetails',
      });
      return [];
    }
  }, [selectedImage, uploadImageToServer]);

  const uploadMultipleDocuments = useCallback(async () => {
    if (!selectedDocument?.length) return [];

    try {
      const uploadedUrls = await Promise.all(
        selectedDocument.map(doc => uploadDocumentToServer(doc)),
      );

      // remove null/failed uploads
      return uploadedUrls.filter(url => url);
    } catch (error) {
      logger.error('Multiple document upload failed:', error, {
        context: 'TaskDetails',
      });
      return [];
    }
  }, [selectedDocument, uploadDocumentToServer]);

  const handleDelete = async () => {
    btmSheetRef.current?.close();

    const {ok, data} = await fetchApis(
      `${baseUrl}/task-management/admin/tasks/${item?.id}`,
      'DELETE',
      setDeleteLoading,
      null,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
    );
    ApiResponse(showAlert, data, language);

    if (ok && !data?.error) {
      navigation.goBack();
    } else {
      // showAlert('Something went wrong', 'error');
    }
  };

  const getFileName = fileUrl => {
    if (!fileUrl) return 'File';
    return fileUrl.split('/').pop() || 'File';
  };

  const handleRating = () => {
    btmSheetRef.current?.close();
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        productivityRatingRef.current?.open();
      }, 300);
    } else {
      productivityRatingRef.current?.open();
    }
  };

  const handleProductivityRatingSubmit = async (rating, notes) => {
    try {
      const payload = {rating};
      if (notes) {
        payload.notes = notes;
      }

      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks/${item?.id}/productivity`,
        'POST',
        null,
        payload,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);

      if (ok && !data?.error) {
        fetchTaskDetails(true);
      } else {
        throw new Error(data?.message || 'Failed to submit rating');
      }
    } catch (error) {
      logger.error('Productivity rating error:', error, {
        context: 'TaskDetails',
      });
      throw error;
    }
  };

  return loading ? (
    <Loader size={wp(20)} style={{flex: 1, justifyContent: 'center'}} />
  ) : (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? hp(5) : 0}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <StackHeader
          title={details.task?.title}
          headerTxtStyle={{
            textAlign: 'left',
            fontSize: RFPercentage(2),
            fontFamily: Fonts.PoppinsSemiBold,
          }}
          onBackPress={() => navigation.goBack()}
          headerStyle={styles.headerStyle}
          rightIcon={
            deleteLoading ? (
              <Loader />
            ) : (
              <TouchableOpacity onPress={() => btmSheetRef.current?.open()}>
                <Svgs.menuDots height={wp(7)} width={wp(7)} />
              </TouchableOpacity>
            )
          }
        />
        <View style={{paddingHorizontal: wp(4)}}>
          <View style={styles.sectionContainer}>
            <WorkerStatus
              name={'Status'}
              status={getStatus(details?.task?.status)}
              nameTextStyle={styles.statusText}
              showIcon={true}
              onPress={() =>
                details?.task?.status === 'completed' ||
                details?.task?.status === 'cancelled'
                  ? null
                  : setModalVisible(true)
              }
            />
          </View>
          <DetailsCard
            data={[
              {
                label: '',
                value: details.task?.description || '',
              },
            ]}
            heading={details.task?.title}
          />
          <View style={styles.sectionContainer}>
            <SectionHeader title="Task Details" />
            <Row
              label="Assigned On"
              value={moment(details.task?.assigned_on).format('DD, MMM YYYY')}
            />
            <Row
              label="Started"
              value={moment(details.task?.start_at).format('DD, MMM YYYY')}
            />
            <Row
              label="Deadline"
              value={moment(details.task?.end_at).format('DD, MMM YYYY')}
            />
            <Row label="Assigned By" value={details.task?.assigned_by_name} />
            {
              details.task?.productivity_rating && <Row label="Rating" value={capitalize(details.task?.productivity_rating)} />
            }
           
           {details.task?.productivity_rating && <Row label="Rating Notes" value={capitalize(details.task?.productivity_notes)} />}
            

            <View style={styles.row}>
              <Text style={styles.key}>{t('Progress')}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${details?.task?.progress_pct}%`},
                    ]}
                  />
                </View>
                <Text style={[styles.value, styles.progressText]}>
                  {details?.task?.progress_pct}%
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.key}>{t('Assigned To')}</Text>
              <View style={styles.tagsContainer}>
                {details?.assignments?.map((item, index) => (
                  <View style={styles.tag} key={index}>
                    <Text style={styles.tagText}>{item.worker_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {details?.task?.attachments?.length > 0 &&
            details?.task?.attachments?.map((item, index) => {
              // Check if the attachment is an image or PDF
              const isImage = item.match(/\.(jpeg|jpg|png|gif|webp)$/i);
              const isPdf = item.match(/\.pdf$/i);

              return (
                <TouchableOpacity
                  style={styles.fileItem}
                  onPress={() => (isPdf ? handlePdfDownload(item) : null)}
                  disabled={downloadLoading}>
                  {isImage ? (
                    // Display as image
                    <Image
                      source={{uri: item}}
                      style={styles.attachmentImage}
                    />
                  ) : (
                    // Display as PDF
                    <View style={styles.pdfIconContainer}>
                      <Icon
                        name="picture-as-pdf"
                        size={wp(10)}
                        color="#FF0000"
                      />
                      <Text style={styles.fileTypeText}>PDF</Text>
                      {downloadLoading && (
                        <View style={styles.downloadOverlay}>
                          <Icon
                            name="file-download"
                            size={wp(6)}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {getFileName(item)}
                    </Text>
                    {isPdf && (
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
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

          {details?.events?.length > 0 && (
            <View style={[styles.sectionContainer, {paddingHorizontal: wp(4)}]}>
              <SectionHeader title="Events" />
              {details?.events.map((item, index) => (
                <EventItem comment={item} key={index} />
              ))}
            </View>
          )}
          {details?.comments?.length > 0 && (
            <View style={[styles.sectionContainer, {paddingHorizontal: wp(4)}]}>
              <SectionHeader title="Comments" />
              {details?.comments.map((comment, index) => (
                <View style={styles.commentItem} key={index}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{comment.author_name}</Text>
                    <Text style={styles.timeText}>
                      {moment(comment?.created_at).format('DD MMM - h:mm A')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.commentHeader,
                      {
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        marginBottom: 0,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.userName,
                        {
                          fontFamily: Fonts.PoppinsMedium,
                          fontSize: RFPercentage(1.5),
                        },
                      ]}>
                      {t('Comment: ')}
                    </Text>
                    <Text style={styles.userRole}>{comment?.body}</Text>
                  </View>
                  <View
                    style={[
                      styles.messageContainer,
                      {
                        borderTopWidth: 0,
                        paddingHorizontal: wp(0),
                        paddingBottom: hp(0.5),
                        paddingTop: 0,
                        flexWrap: 'wrap',
                      },
                    ]}>
                    {comment?.attachments?.length > 0 &&
                      comment.attachments.map((file, index) => {
                        const isImage = file.match(
                          /\.(jpeg|jpg|png|gif|webp)$/i,
                        ); // check extension

                        return (
                          <View key={index}>
                            {isImage ? (
                              <Image
                                source={{uri: file}}
                                style={styles.image}
                              />
                            ) : (
                              <TouchableOpacity
                                style={[
                                  styles.fileInfo,
                                  {
                                    flexDirection: 'row',
                                    backgroundColor: isDarkMode
                                      ? `${Colors.darkTheme.backgroundColor}`
                                      : Colors.lightTheme.backgroundColor,
                                    borderRadius: wp(2),
                                    borderWidth: 1,
                                    borderColor: isDarkMode
                                      ? Colors.darkTheme.BorderGrayColor
                                      : Colors.lightTheme.BorderGrayColor,
                                    padding: wp(2),
                                  },
                                ]}
                                onPress={() => {
                                  setDocumentPreview(file);
                                  setisDocumentPreviewVisible(true);
                                }}>
                                <View style={styles.pdfIconContainer}>
                                  <Icon
                                    name="picture-as-pdf"
                                    size={wp(10)}
                                    color="#FF0000"
                                  />
                                </View>
                                <Text style={styles.fileName} numberOfLines={2}>
                                  {getFileName(file)}
                                </Text>
                              </TouchableOpacity>
                              // </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.messageContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => CameraBottomSheetRef.current?.open()}>
          <Svgs.Blueplus height={wp(8)} width={wp(8)} />
        </TouchableOpacity>
        <TxtInput
          placeholder={t('Write comment...')}
          onChangeText={setMessage}
          value={message}
          containerStyle={styles.input}
        />
        <TouchableOpacity
          style={styles.sendButton}
          disabled={msgLoading || !message}
          onPress={() => {
            sendComment();
          }}>
          {msgLoading ? (
            <Loader />
          ) : (
            <Svgs.sendSvg height={wp(12)} width={wp(12)} />
          )}
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.messageContainer,
          {
            borderTopWidth: 0,
            paddingHorizontal: wp(8),
            paddingBottom: hp(0.5),
            paddingTop: 0,
            flexWrap: 'wrap',
          },
        ]}>
        {selectedImage.length > 0 &&
          selectedImage.map((item, index) => {
            // Handle both old format (string) and new format (object)
            const imagePath = typeof item === 'string' ? item : item.path;
            return (
              <View>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() =>
                    setSelectedImage(
                      selectedImage.filter((_, i) => i !== index),
                    )
                  }>
                  <Svgs.Cross height={hp(1)} width={hp(1)} />
                </TouchableOpacity>
                <Image
                  source={{uri: imagePath}}
                  style={styles.image}
                  key={index}
                />
              </View>
            );
          })}
        {selectedDocument.length > 0 &&
          selectedDocument.map((item, index) => (
            <TouchableOpacity
              onPress={() => viewSelectedDocument(item.uri)}
              style={{marginTop: hp(1)}}>
              <View style={styles.pdfContainer}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() =>
                    setSelectedDocument(
                      selectedDocument.filter((_, i) => i !== index),
                    )
                  }>
                  <Svgs.Cross height={hp(1)} width={hp(1)} />
                </TouchableOpacity>
                <Svgs.documentred height={hp(4)} width={hp(4)} />
                <Text>{truncateText(item.name, 10)}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <CameraBottomSheet
        refRBSheet={CameraBottomSheetRef}
        onPick={handleImagePick}
        showDocument={true}
      />

      <DocumentViewModal
        visible={isDocumentPreviewVisible}
        documentUrl={documentPreview}
        onClose={() => setisDocumentPreviewVisible(false)}
      />

   <ReusableBottomSheet
  height={hp('35%')}
  refRBSheet={btmSheetRef}
  sheetTitle={'Select An Option'}
  options={[
    ...(details?.task?.status === 'completed'
      ? [
          {
            icon: <Svgs.rating height={hp(4)} />,
            title: 'Add Rating',
            onPress: () => {
              handleRating();
            },
          },
        ]
      : []),

    {
      icon: <Svgs.edit height={hp(4)} />,
      title: 'Edit',
      description: 'Edit Task',
      onPress: () => {
        btmSheetRef.current?.close();
        navigation.navigate(SCREENS.EDITTASK, {
          item,
          assignments:
            details?.assignments?.length > 0 ? details.assignments : [],
        });
      },
    },

    {
      icon: <Svgs.deleteBlueOutline height={hp(4)} />,
      title: 'Delete',
      description: 'Delete Task',
      onPress: () => {
        handleDelete();
      },
    },
  ]}
/>

      <TaskStatusChangeModal
        isVisible={isModalVisible}
        taskId={item?.id}
        token={token}
        onClose={() => {
          setModalVisible(false);
          fetchTaskDetails(true);
        }}
        onSubmit={fetchTaskDetails}
      />

      <ProductivityRatingBottomSheet
        ref={productivityRatingRef}
        onSubmit={handleProductivityRatingSubmit}
      />
    </KeyboardAvoidingView>
  );
};

export default TaskDetails;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp(3),
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.backgroundColor}`
        : Colors.lightTheme.backgroundColor,
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
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
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
    sectionContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.9),
    },
    cardContainer: {
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.secondryColor}`
        : `${Colors.lightTheme.backgroundColor}`,
      paddingHorizontal: wp(4),
      borderRadius: wp(2),
      paddingVertical: hp(1.5),
    },
    key: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.QuaternaryText,
      fontFamily: Fonts.PoppinsRegular,
    },
    value: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heading: {
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    progressBackground: {
      height: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: 4,
      width: '45%',
      overflow: 'hidden',
      alignSelf: 'center',
    },
    progressFill: {
      height: hp(1),
      backgroundColor: '#9F8FEF',
    },
    progressText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      marginLeft: wp(2),
    },
    pdfContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3),
      marginRight: wp(3),
    },
    pdfText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.NunitoBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(0.5),
    },
    btn: {
      paddingVertical: hp(1.2),
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.primaryColor}30`
        : `${Colors.lightTheme.primaryColor}30`,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderWidth: 1,
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      marginLeft: wp(3),
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(1),
      marginLeft: wp(1.5),
    },
    listContainer: {
      paddingHorizontal: wp(1),
    },
    image: {
      width: wp(20),
      height: hp(10),
      borderRadius: wp(2),
      marginRight: wp(2),
      marginTop: hp(1),
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',

      // gap: wp(1.5),
    },
    tag: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : '#579DFF',
      borderRadius: wp(1),
      paddingHorizontal: wp(1.5),
      paddingVertical: hp(1),
      marginLeft: wp(0.8),
      marginBottom: hp(0.5),
    },
    tagText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.6),
      color: Colors.darkTheme.primaryTextColor,
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : '#E0E0E0',
    },
    addButton: {
      marginRight: wp(3),
    },
    input: {
      backgroundColor: isDarkMode ? Colors.darkTheme.input : '#F8F9FA',
      width: wp(70),
    },
    sendButton: {
      padding: wp(1),
    },

    commentItem: {
      marginBottom: hp(2),
      paddingBottom: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : '#E0E0E0',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,

      paddingVertical: hp(1),
      borderRadius: wp(2),
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    commentAvatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      marginRight: wp(3),
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    userRole: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    commentTime: {
      alignItems: 'flex-end',
    },
    timeText: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    actionContainer: {},
    actionBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.4),
      borderRadius: wp(2),
      marginBottom: hp(0.5),
    },
    actionText: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.PoppinsMedium,
    },
    actionDetail: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    commentText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      lineHeight: hp(2.5),
      marginTop: hp(0.5),
    },
    statusChangeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrowText: {
      fontSize: RFPercentage(2),
      marginHorizontal: wp(2),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },

    modalContainer: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },

    ModalinputContainer: {
      backgroundColor: Colors.darkTheme.secondryColor,
      borderRadius: wp(6),
      position: 'absolute',
      left: wp(4),
      right: wp(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
    },
    fullScreenImage: {
      width: '100%',
      height: '80%',
      resizeMode: 'contain',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingVertical: hp(2),
    },
    iconWrapper: {
      padding: wp(2.5),
      borderRadius: wp(100),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,

      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIcon: {
      position: 'absolute',
      top: hp(0),
      right: wp(0),
      zIndex: 1000,
      backgroundColor: Colors.lightTheme.BorderGrayColor,
      padding: wp(1),
      borderRadius: wp(100),
    },
    fileTypeText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(0.5),
    },
    attachmentImage: {
      width: wp(15),
      height: hp(8),
      borderRadius: wp(2),
      marginRight: wp(3),
    },
  });
