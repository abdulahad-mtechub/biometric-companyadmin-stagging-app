
import {useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, TouchableOpacity, View, Platform, PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import {Fonts} from '@constants/Fonts';
import {useAlert} from '@providers/AlertContext';
import logger from '@utils/logger';
import { pick, types } from '@react-native-documents/picker';

const CameraBottomSheet = ({
  refRBSheet,
  onPick,
  navigate,
  showDocument = false,
}) => {
  const navigation = useNavigation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const {showAlert} = useAlert();

  // Image picker options
  const imagePickerOptions = {
    storageOptions: {skipBackup: true, path: 'images'},
    maxWidth: 500,
    maxHeight: 500,
    quality: 1,
    includeBase64: true,
    cameraType: "front"
  };

  // Permission handlers
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('Camera Permission'),
            message: t('App needs access to your camera to capture photos'),
            buttonNeutral: t('Ask Me Later'),
            buttonNegative: t('Cancel'),
            buttonPositive: t('OK'),
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        logger.warn('Camera permission error:', err, { context:'CameraBottomSheet' });
        return false;
      }
    }
    return true; // iOS permissions handled via Info.plist
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const minSdk = 33; // Android 13 (API level 33)
        if (Platform.Version >= minSdk) {
          // Android 13+ - use granular media permissions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: t('Gallery Permission'),
              message: t('App needs access to your gallery to select photos'),
              buttonNeutral: t('Ask Me Later'),
              buttonNegative: t('Cancel'),
              buttonPositive: t('OK'),
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // Android 12 and below - use READ_EXTERNAL_STORAGE
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: t('Gallery Permission'),
              message: t('App needs access to your gallery to select photos'),
              buttonNeutral: t('Ask Me Later'),
              buttonNegative: t('Cancel'),
              buttonPositive: t('OK'),
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        logger.warn('Storage permission error:', err, { context:'CameraBottomSheet' });
        return false;
      }
    }
    return true; // iOS permissions handled via Info.plist
  };

  // Shared response handler
  const handleImageResponse = useCallback((res, source) => {
    // if (Platform.OS === 'ios') {
    //   logger.log(`iOS: ${source} response received`, { context:'CameraBottomSheet' });
    //   logger.log(`iOS: ${source} response structure:`, JSON.stringify(res), { context:'CameraBottomSheet' });
    // }

    if (res?.didCancel) {
      Platform.OS === 'ios' && logger.log(`iOS: User cancelled ${source}`, { context:'CameraBottomSheet' });
    } else if (res?.error) {
      logger.error('ImagePicker Error:', res.error, { context:'CameraBottomSheet' });
      Platform.OS === 'ios' && logger.log(`iOS: ${source} error:`, JSON.stringify(res.error), { context:'CameraBottomSheet' });
    } else if (res?.customButton) {
      logger.log('User tapped custom button:', res.customButton, { context:'CameraBottomSheet' });
    } else if (res?.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      const base64Image = `data:${asset.type};base64,${asset.base64}`;
      const imageData = {
        path: asset.uri,
        mime: asset.type,
        base64: base64Image,
      };

      if (navigate) {
        navigation.navigate('ImageUpload', {image: imageData});
      }
      onPick && onPick(imageData);

      // iOS: Close bottom sheet ONLY after successful image selection
      if (Platform.OS === 'ios') {
        refRBSheet.current?.close();
      }
    } else {
      logger.warn('No assets in response:', res, { context:'CameraBottomSheet' });
      Platform.OS === 'ios' && logger.log(`iOS: ${source} - assets missing or empty`, { context:'CameraBottomSheet' });
    }
  }, [navigate, onPick, refRBSheet]);

  const takePhotoFromCamera = async () => {
    // Request camera permission first
    const cameraGranted = await requestCameraPermission();
    if (!cameraGranted) {
      return;
    }


    try {
      const res = await launchCamera(imagePickerOptions);
      handleImageResponse(res, 'camera');
    } catch (err) {
      logger.error('Camera exception:', err, err?.message, { context:'CameraBottomSheet' });
    }
  };

  const choosePhotoFromLibrary = async () => {
    // Request storage permission first
    const storageGranted = await requestStoragePermission();
    if (!storageGranted) {
      return;
    }

    try {
      const res = await launchImageLibrary(imagePickerOptions);
      handleImageResponse(res, 'image library');
    } catch (err) {
      logger.error('Image library exception:', err, err?.message, { context:'CameraBottomSheet' });
    }
  };

  const rbsheetCustomStyles = {
    wrapper: {backgroundColor: 'rgba(52, 52, 52, 0.5)'},
    draggableIcon: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    container: {
      borderTopLeftRadius: wp(8),
      borderTopRightRadius: wp(8),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      // flex:1
    },
  };

  /* ✅ Document (PDF Only) */
  const pickDocument = useCallback(async () => {
    try {
      const [res] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      if (!res) return;

      const fileSize = res.size || 0;
      if (fileSize > 10 * 1024 * 1024) {
        return showAlert(t('File size should not exceed 10MB'));
      }

      const file = {
        path: res.uri,
        name: res.name ?? 'Document.pdf',
        mime: res.type ?? 'application/pdf',
      };

      onPick?.(file);
        if (Platform.OS === 'ios') {
        refRBSheet.current?.close();
      }
    } catch (error) {
      if (String(error).includes('cancel')) return;
      showAlert(t('Error selecting file. Please try again.'));
    }
  }, [onPick, t, showAlert]);


  return (
    <RBSheet
      ref={refRBSheet}
      closeOnDragDown
      closeOnPressMask
      customStyles={rbsheetCustomStyles}
      height={Platform.OS === 'ios' ? showDocument ? hp(40) : hp(25): showDocument ? hp(40) : hp(30)}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainText}>{t('Select An Option')}</Text>
        <TouchableOpacity onPress={() => refRBSheet.current.close()}>
          <Ionicons
            name="close"
            size={22}
            color={
              isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor
            }
          />
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {/* Camera */}
        <TouchableOpacity
          style={styles.modalTextView}
          onPress={() => {
            takePhotoFromCamera();
            // iOS: Don't auto-close - wait for image selection
            // Android: Auto-close immediately for better UX
            Platform.OS === 'android' && refRBSheet.current?.close();
            
          }}>
          <Svgs.Camera height={hp(5)} width={wp(10)} />
          <View style={{marginLeft: wp(3)}}>
            <Text style={styles.optionText}>{t('Camera')}</Text>
            <Text style={styles.descriptionText}>
              {t('Select Camera to capture images.')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Gallery */}
        <TouchableOpacity
          style={styles.modalTextView}
          onPress={() => {
            choosePhotoFromLibrary();
            // iOS: Don't auto-close - wait for image selection
            // Android: Auto-close immediately for better UX
            Platform.OS === 'android' && refRBSheet.current?.close();
          }}>
          <Svgs.Gallery height={hp(5)} width={wp(10)} />
          <View style={{marginLeft: wp(3)}}>
            <Text style={styles.optionText}>{t('Gallery')}</Text>
            <Text style={styles.descriptionText}>
              {t('Select Gallery to choose images.')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ✅ Document (Conditional Rendering) */}
        {showDocument && (
          <TouchableOpacity
            style={styles.modalTextView}
            onPress={() => {
              pickDocument();
               Platform.OS === 'android' && refRBSheet.current?.close();
            }}>
            <Svgs.uploadDocument height={hp(5)} width={wp(10)} />
            <View style={{marginLeft: wp(3)}}>
              <Text style={styles.optionText}>{t('Document')}</Text>
              <Text style={styles.descriptionText}>
                {t('Upload Document.')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(8),
    marginTop: hp(2),
    alignItems: 'center',
  },
  mainText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: RFPercentage(2.3),
  },
  optionsContainer: {marginHorizontal: wp(8)},
  modalTextView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    marginVertical: hp(1),
  },
  optionText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: RFPercentage(2),
  },
  descriptionText: {
    fontFamily: Fonts.NunitoRegular,
    fontSize: RFPercentage(1.7),
  },
});

export default CameraBottomSheet;
