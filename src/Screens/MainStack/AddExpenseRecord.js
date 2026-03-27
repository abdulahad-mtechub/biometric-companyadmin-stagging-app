import React, {useState, useRef, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Svgs} from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import {pxToPercentage} from '@utils/responsive';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import TxtInput from '@components/TextInput/Txtinput';
import {fetchApis, fetchFormDataApi, ApiResponse} from '@utils/Helpers';
import {viewDocument} from '@react-native-documents/viewer';
import logger from '@utils/logger';
import moment from 'moment';

const AddExpenseRecord = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  const styles = dynamicStyles(isDarkMode, theme, Colors);
  const {showAlert} = useAlert();
  const {item: expense} = route.params || {};
  const {token, language} = useSelector(store => store.auth);

  // State variables
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [attachment, setAttachment] = useState(null); // { path, name, type }
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({paymentMethod: '', paymentDate: ''});
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Refs
  const cameraSheetRef = useRef(null);

  // Image preview handler
  const viewSelectedDocument = useCallback(
    uri => {
      logger.log('Attempting to view document:', {
        uri,
        context: 'AddExpenseRecord',
      });
      viewDocument({
        uri: uri,
        mimeType: 'application/pdf',
      }).catch(error => {
        logger.error('Document viewer error:', error, {
          context: 'AddExpenseRecord',
        });
        showAlert(t('Failed to open document. Please try again.'), 'error');
      });
    },
    [t, showAlert],
  );

  // Handle image pick from CameraBottomSheet
  const handleImagePick = useCallback(img => {
    if (img.mime === 'application/pdf' || img.mime === 'pdf') {
      // Document selected
      setAttachment({
        path: img.path,
        name: img.name || 'Document.pdf',
        type: 'document',
      });
    } else {
      // Image selected
      setAttachment({
        path: img.path,
        name: img.name || 'Image',
        type: 'image',
      });
    }
    cameraSheetRef.current?.close();
  }, []);

  // Upload file to server
const uploadFileToServer = useCallback(async (file) => {
  if (!file?.path) return null;

  try {
    setIsLoading(true);

    const formData = new FormData();

    const isDocument =
      file?.type === 'document' ||
      file?.mime === 'application/pdf';

    // 🔥 Detect extension properly
    let extension = 'jpg';

    if (isDocument) {
      extension = 'pdf';
    } else if (file?.mime?.includes('png')) {
      extension = 'png';
    } else if (file?.mime?.includes('jpeg')) {
      extension = 'jpg';
    } else if (file?.mime?.includes('jpg')) {
      extension = 'jpg';
    }

    const fileName = `upload-${Date.now()}.${extension}`;

    formData.append(isDocument ? 'pdf' : 'image', {
      uri: file.path,
      type: isDocument
        ? 'application/pdf'
        : file?.mime || 'image/jpeg',
      name: fileName, // ✅ always has extension
    });

    const endpoint = `${baseUrl}/upload/${isDocument ? 'pdf' : 'image'}`;

    const { ok, data } = await fetchFormDataApi(
      endpoint,
      'POST',
      null,
      formData,
      null,
      { 'Content-Type': 'multipart/form-data' }
    );

    if (!ok) {
      throw new Error(data?.message || 'Upload failed');
    }
    return data?.data?.url || null;

  } catch (error) {
    logger.error('File upload failed:', error, {
      context: 'AddExpenseRecord',
    });
    return null;
  } finally {
    setIsLoading(false);
  }
}, [baseUrl]);


  // Validate form
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {paymentMethod: '', paymentDate: ''};

    if (!paymentMethod) {
      newErrors.paymentMethod = t('Please select payment method.');
      isValid = false;
    }
    if (!paymentDate) {
      newErrors.paymentDate = t('Please select payment date.');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [paymentMethod, paymentDate, t]);

  // Handle save/submit
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Upload attachment if exists (optional)
      let uploadedUrl = null;
      if (attachment) {
        uploadedUrl = await uploadFileToServer(attachment);
      }

      // Build payload
      const payload = {
        paid_at: paymentDate,
        payment_method: paymentMethod.value || paymentMethod,
        note: paymentNotes || null,
        attachment_url: uploadedUrl || null,
      };

      // Call API
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admin/expenses/${expense?.id}/pay`,
        'POST',
        setIsLoading,
        payload,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);
      console.log(data, payload)
      if (ok) {
        setTimeout(() => {
          navigation.pop(2);
        }, 1500);
      }
    } catch (error) {
      logger.error('Error saving expense record:', error, {
        context: 'AddExpenseRecord',
      });
      showAlert(t('Failed to save expense record. Please try again.'), 'error');
    }
  }, [
    validateForm,
    attachment,
    uploadFileToServer,
    paymentDate,
    paymentMethod,
    paymentNotes,
    expense,
    showAlert,
    token,
    navigation,
    t,
  ]);

  // Open camera bottom sheet
  const openCameraSheet = useCallback(() => {
    cameraSheetRef.current?.open();
  }, []);

  return (
    <View style={[styles.continaer]}>
      {/* <View style={styles.contentContainer}> */}
      <ScrollView style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons
            name={'chevron-left'}
            onPress={() => navigation.goBack()}
            size={RFPercentage(3.5)}
            color={
              isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor
            }
          />
          <Text style={styles.screenHeading}>{t('Pay Expense')}</Text>
        </View>

        <View style={styles.ContentContainer}>
          <Text style={[styles.heading]}>{t('Expense Details')}</Text>
          <Text style={[styles.label]}>{t('Payment Method')} <Text style={{color: 'red'}}>*</Text></Text>
          <CustomDropDown
            data={[
              {label: 'Cash', value: 'cash'},
              {label: 'Bank', value: 'bank'},
              {label: 'Transfer', value: 'transfer'},
              {label: 'Other', value: 'other'},
            ]}
            selectedValue={paymentMethod}
            onValueChange={text => {
              setPaymentMethod(text);
              setErrors(prev => ({...prev, paymentMethod: ''}));
            }}
            placeholder="Payment Method"
            width={'100%'}
            error={errors.paymentMethod}
          />

          <Text style={styles.label}>
            {t('Date of Payment')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setDatePickerVisibility(true)}>
            <Text
              style={[
                styles.dateText,
                paymentDate && {
                  color: isDarkMode
                    ? Colors.darkTheme.primaryTextColor
                    : Colors.lightTheme.primaryTextColor,
                },
              ]}>
              {paymentDate || t('Select your payment date')}
            </Text>
            <View style={styles.iconRight}>{<Svgs.calenderL />}</View>
          </TouchableOpacity>
          {errors.paymentDate ? (
            <Text style={styles.errorText}>{errors.paymentDate}</Text>
          ) : null}

          <Text style={[styles.label, {marginTop: hp(1)}]}>{t('Payment Note')}</Text>
          <TxtInput
            value={paymentNotes}
            onChangeText={setPaymentNotes}
            placeholder={t('Describe your request')}
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <View style={{marginTop: hp(1)}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <Text style={[styles.label,{width: wp(50)}]}>{t('Supporting Proof')}</Text>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDarkMode
                        ? Colors.darkTheme.secondryTextColor
                        : Colors.lightTheme.secondryTextColor,
                      fontFamily: Fonts.PoppinsRegular,
                      fontSize: RFPercentage(pxToPercentage(14)),
                      width: wp(70),
                    },
                  ]}>
                  {t('Upload File in PNG/JPG/PDF Format')}
                </Text>
              </View>
              {attachment && (
                <TouchableOpacity onPress={openCameraSheet}>
                  <Svgs.editCircled />
                </TouchableOpacity>
              )}
            </View>
            {attachment ? (
              attachment.type === 'image' ? (
                <TouchableOpacity
                  onPress={() => {
                    setPreviewImage(attachment.path);
                    setShowPreview(true);
                  }}>
                  <Image
                    source={{uri: attachment.path}}
                    style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => viewSelectedDocument(attachment.path)}>
                  <Svgs.pdf />
                  <Text
                    style={[
                      styles.label,
                      {width: '50%', textAlign: 'center', marginTop: hp(1)},
                    ]}>
                    {attachment.name}
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  style={styles.uploadIcon}
                  onPress={openCameraSheet}>
                  <Svgs.whitePlus />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.btnContainer}>
        <CustomButton
          text={t('Mark as Paid')}
          onPress={handleSave}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
          isLoading={isLoading}
          loaderColor={'#fff'}
          LoaderSize={25}
        />
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onClose={() => setDatePickerVisibility(false)}
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');
          setDatePickerVisibility(false);
          setPaymentDate(formatted);
          setErrors(prev => ({...prev, paymentDate: ''}));
        }}
      />

      <CameraBottomSheet
        refRBSheet={cameraSheetRef}
        onPick={handleImagePick}
        showDocument={true}
      />

      <ImagePreviewModal
        visible={showPreview}
        imageUri={previewImage}
        onClose={() => setShowPreview(false)}
      />
    </View>
  );
};

export default AddExpenseRecord;

const dynamicStyles = (isDarkMode, theme, Colors) =>
  StyleSheet.create({
    continaer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(1),
    },
    screenHeading: {
      paddingTop: hp(0.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(10),
    },
    ContentContainer: {
      paddingBottom: hp(2),
      flex: 1,
      paddingHorizontal: wp(5),
      marginBottom: hp(5),
      marginTop: hp(2),
    },
    heading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'left',
      width: wp(80),
      fontSize: RFPercentage(pxToPercentage(18)),
      marginBottom: hp(2),
    },
    countrySelector: {
      flexDirection: 'row',
      paddingHorizontal: wp('4%'),
      paddingVertical: wp('2.5%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(3),
      marginBottom: hp(2),
      justifyContent: 'space-between',
      overflow: 'hidden',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
    },
    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
    },
    inputField: {
      borderRadius: wp(3),
      marginBottom: hp(2),
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
    },

    addressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
      gap: wp(2.5),
    },
    mapBtn: {
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      flex: 0.3,
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      borderWidth: 1,
    },
    mapBtnText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(2),
      textAlign: 'center',
    },
    dateText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    iconRight: {
      marginLeft: wp(2),
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
    },

    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
    uploadIcon: {
      padding: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : '#5E5F60',
      borderRadius: wp(10),
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: wp(2),
      padding: wp(2),
      alignItems: 'center',
      marginBottom: hp(3),
      backgroundColor: theme.primaryColor,
      borderColor: theme.BorderGrayColor,
    },
    amountInput: {
      fontSize: RFPercentage(pxToPercentage(40)),
      width: wp(35),
      textAlign: 'center',
      color: '#ffffff',
      fontFamily: Fonts.PoppinsMedium,
    },
    euroSign: {
      fontSize: RFPercentage(pxToPercentage(22)),
      marginLeft: wp(1),
      paddingBottom: hp(0.8),
      fontFamily: Fonts.PoppinsMedium,
      color: '#ffffff',
      position: 'absolute',
      right: wp(25),
      top: hp(1.5),
    },
    loanText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: '#ffffff',
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    amountButton: {
      width: wp(26),
      paddingVertical: hp(1),
      borderRadius: wp(2),
      marginBottom: hp(1.5),
      alignItems: 'center',
      borderWidth: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : 'transparent',
      borderColor: theme.BorderGrayColor,
    },
    buttonText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
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
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      //   position: "absolute",
      //   bottom: hp(2.5),
      //   left: wp(0),
      //   right: wp(0),
      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    comments: {
      height: hp(40),
      textAlignVertical: 'top',
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(12)),
      marginLeft: wp(1),
      textAlign: 'left',
      marginBottom: hp(1),
    },
  });
