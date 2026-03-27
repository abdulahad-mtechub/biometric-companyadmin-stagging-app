import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Linking,
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
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';

// Components
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import CountryPickerBottomSheet from '@components/BottomSheets/CountryPickerBottomSheet';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import CInputWithCountryCode from '@components/TextInput/CInputWithCountryCode';
import TxtInput from '@components/TextInput/Txtinput';

// Constants & Utils
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {
  ApiResponse,
  fetchApis,
  fetchFormDataApi,
  isConnected,
} from '@utils/Helpers';
import {useProfile} from '@utils/Hooks/Hooks';
import {pxToPercentage} from '@utils/responsive';
import ColorPickerModal from '@components/CustomModal/ColorPickerModal';
import {setColors} from '@redux/Slices/theme';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import moment from 'moment';
import {pick, types} from '@react-native-documents/picker';
import {viewDocument} from '@react-native-documents/viewer';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  getPendingActions,
  removePendingAction,
  savePendingAction,
  saveUpdatePendingAction,
} from '@utils/sqlite';
import PendingRequestCard from '@components/Cards/PendingRequestCard';
import Loader from '@components/Loaders/loader';
import logger from '@utils/logger';
import {clearLocation} from '@redux/Slices/updateLocationSlice';

// Constants
const BUSINESS_SECTORS = [
  {label: 'Field Services', value: 'field_services'},
  {label: 'Construction', value: 'construction'},
  {label: 'Delivery & Logistics', value: 'delivery_logistics'},
  {label: 'Retail', value: 'retail'},
  {
    label: 'Healthcare & Home Care',
    value: 'healthcare_home_care',
  },
  {label: 'Security Services', value: 'security_services'},
  {label: 'IT Services & Support', value: 'it_services_support'},
  {
    label: 'Corporate / Office Work',
    value: 'corporate_office_work',
  },
  {label: 'Hospitality', value: 'hospitality'},
  {label: 'Education & Training', value: 'education_training'},
  {
    label: 'Government & Public Services',
    value: 'government_public_services',
  },
  {label: 'Other', value: 'other'},
];

// Static regions like in web version
const ALL_REGIONS = [
  'Africa',
  'Americas',
  'Antartic',
  'Asia',
  'Europe',
  'Oceania',
];

const useFormState = (auth, initialData = {}) => {
  const {
    state,
    country,
    city,
    postalCode,
    address,
    latitude,
    longitude,
    region,
  } = useSelector(store => store.updateLocation);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    profileImage: '',
    profileImageRaw: '', // Server path for profile image
    dob: '',
    administratorType: {},
    adminDoc: null,
    adminDocUrl: '',
  });

  // Company Information
  const [companyInfo, setCompanyInfo] = useState({
    legalName: '',
    businessSector: {},
    tradeName: '',
    businessRegNo: '',
    businessPhone: '',
    businessCountryCode: '',
    businessEmail: '',
    logo: '',
    logoRaw: '', // Server path for logo
    businessType: {},
    primaryColor: '',
    secondryColor: '',
    businessActivity: '',
    legalDoc: null,
    legalDocUrl: '',
    businessAddress: '',
  });

  // Company Address
  const [companyAddress, setCompanyAddress] = useState({
    region: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    address: '',
  });
  // Target zones - updated to match web structure
  const [targetZones, setTargetZones] = useState({
    regions: [], // Selected regions (continents)
    countriesSel: [], // Selected countries
    citiesSel: [], // Selected cities
    target_market: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const updatePersonalInfo = useCallback((field, value) => {
    setPersonalInfo(prev => ({...prev, [field]: value}));
  }, []);

  const updateCompanyInfo = useCallback((field, value) => {
    setCompanyInfo(prev => ({...prev, [field]: value}));
  }, []);

  const updateCompanyAddress = useCallback((field, value) => {
    setCompanyAddress(prev => ({...prev, [field]: value}));
  }, []);

  const updateTargetZones = useCallback((field, value) => {
    setTargetZones(prev => ({...prev, [field]: value}));
  }, []);

  // Initialize form data from profile
  const initializeFormData = async (profileDetails, locationAddress) => {
    try {
      setInitLoading(true);

      const user = auth?.User || {};
      const company = auth?.company || {};
      const address = company?.address || {};

      if (profileDetails || user || company) {
        const profile = {
          ...profileDetails?.user,
          ...profileDetails?.company,
          ...profileDetails?.location,
          ...profileDetails?.coordinates,
          ...profileDetails?.territory_zone,
          ...profileDetails?.status,
          // ...user,
          // ...company,
        };
console.log(profile)
        setPersonalInfo({
          firstName: profile.first_name || user.first_name || '',
          middleName: profile.middle_name || user.middle_name || '',
          lastName: profile.last_name || user.last_name || '',
          email: profile.email || user.email || '',
          phoneNumber: profile.phone_number || '', // Ensure phone_number is initialized
          countryCode: '+1',
          profileImageRaw: profile.profile_picture || user.profile_image || '',
          dob: profile.dob || user.dob || '',
          administratorType: profile.administrator_type
            ? {
                label: profile.administrator_type,
                value: profile.administrator_type,
              }
            : {value: '', label: ''},

          adminDocUrl: profile.admin_document_url,
        });

        setCompanyInfo({
          legalName: profile.legal_name || company.legal_name || '',
          businessSector: profile.business_sector
            ? {label: profile.business_sector, value: profile.business_sector}
            : {value: '', label: ''},
          businessType: profile.business_type
            ? {label: profile.business_type, value: profile.business_type}
            : {value: '', label: ''},
          tradeName: profile.trade_name || company.trade_name || '',
          businessRegNo:
            profile.company_registration_number ||
            company.company_registration_number ||
            '',
          businessPhone: profile.business_phone,
          businessCountryCode: '',
          businessEmail: profile.business_email || company.business_email || '',
          logoRaw: profile.logo || company.logo_url || '',
          primaryColor: profile.primary_color || company.primary_color || '',
          secondryColor:
            profile.secondary_color || company.secondary_color || '',
          businessActivity: profile.business_activity,
          businessAddress: profile.business_address,
          legalDocUrl: profile.company_document_url,
        });

        setCompanyAddress({
          region: region || profile.region_code || address.region_code || '',
          country: country || profile.country || address.country || '',
          state: state || profile.province || address.province || '',
          city: city || profile.city || address.city || '',
          postalCode:
            postalCode || profile.postal_code || address.postal_code || '',
          address: profile.street_address || '',
        });

        setTargetZones({
          regions: profile.territory_zone || [],
          countriesSel: profile.territory_countries || [],
          citiesSel: profile.territory_cities || [],
          target_market: profile.target_market || '',
        });
      }
    } catch (error) {
      logger.error('Error initializing form data:', error, {
        context: 'EditProfile',
      });
    } finally {
      setInitLoading(false);
    }
  };

  return {
    personalInfo,
    companyInfo,
    companyAddress,
    targetZones,
    savingProfile,
    initLoading,
    updatePersonalInfo,
    updateCompanyInfo,
    updateCompanyAddress,
    updateTargetZones,
    initializeFormData,
    setTargetZones,
    setSavingProfile,
  };
};

// Custom hook for UI state management
const useUIState = () => {
  const [expandedSections, setExpandedSections] = useState({
    adminDetails: true,
    companyDetails: true,
    companyAddress: true,
    targetZone: true,
  });

  const [selectImageType, setSelectImageType] = useState('');

  const toggleSection = useCallback(section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return {
    expandedSections,
    selectImageType,
    setSelectImageType,
    toggleSection,
  };
};

const ProfileImageSection = React.memo(
  ({
    imageUri,
    onPress,
    onDelete,
    editButtonText,
    isDarkMode,
    styles,
    t,
    showDelete = true,
  }) => (
    <View style={styles.profileImageSection}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.profileImage} />
        ) : (
          <Image source={Images.placeholderImg} style={styles.profileImage} />
        )}
      </View>

      <View style={styles.editSection}>
        <TouchableOpacity style={styles.editButton} onPress={onPress}>
          <Text style={styles.editButtonText(isDarkMode)}>
            {editButtonText}
          </Text>
        </TouchableOpacity>
        <Text style={styles.sizeInfo(isDarkMode)}>
          {t('Upload image in PNG/JPG Format')}
        </Text>
      </View>
    </View>
  ),
);

// Form Input Row Component
const FormInputRow = React.memo(
  ({label, required, children, isDarkMode, styles, Colors}) => (
    <>
      <Text style={styles.label(isDarkMode)}>
        {label}
        {required && <Text style={{color: Colors.error}}> *</Text>}
      </Text>
      {children}
    </>
  ),
);

// Expandable Section Component
const ExpandableSection = React.memo(
  ({
    title,
    expanded,
    onToggle,
    containerStyle,
    children,
    isDarkMode,
    styles,
    Colors,
  }) => (
    <View style={[styles.section(isDarkMode), containerStyle]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}>
        <Text style={styles.sectionTitle(isDarkMode)}>{title}</Text>
        <View style={styles.chevronContainer}>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.darkTheme.primaryTextColor}
          />
        </View>
      </TouchableOpacity>
      {expanded && children}
    </View>
  ),
);

// Zone Tags Component
const ZoneTags = React.memo(({zones, isDarkMode, styles}) => (
  <View style={{flexDirection: 'row', marginBottom: hp(2), flexWrap: 'wrap'}}>
    {zones.map((zone, index) => (
      <Text key={index} style={styles.selectedZone(isDarkMode)}>
        {zone}
      </Text>
    ))}
  </View>
));

const EditProfile = ({navigation, route}) => {
  const {t} = useTranslation();
  const locationData = useSelector(store => store.updateLocation);
  const {locationData: navLocationData} = route?.params || {};

  const [showModal, setShowModal] = useState(false);
  const [colorType, setColorType] = useState('primary');

  const {isDarkMode, Colors} = useSelector(store => store.theme); // Add a default value for isDarkMode
  const auth = useSelector(store => store?.auth); // Access the entire auth slice
  const {location, User, token, language} = auth; // Destructure with a fallback for userData
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [isConnectedState, setIsConnectedState] = useState(true);
  const [pendingActions, setPendingActions] = useState([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const dispatch = useDispatch();

  const {getProfile} = useProfile();

  const {showAlert} = useAlert();

  const safeShowAlert = (message, type) => {
    if (typeof showAlert === 'function') {
      showAlert(message, type);
    } else {
      logger.warn('showAlert is not defined or is not a function', {
        context: 'EditProfile',
      });
    }
  };

  const imageUploadURL = `${baseUrl}/upload/image`;

  // Custom hooks
  const {
    personalInfo,
    companyInfo,
    companyAddress,
    targetZones,
    savingProfile,
    initLoading,
    updatePersonalInfo,
    updateCompanyInfo,
    updateCompanyAddress,

    updateTargetZones,
    initializeFormData,
    setTargetZones,
    setSavingProfile,x
  } = useFormState(auth);

  const displayLocation = locationData?.address ? locationData : companyAddress;
  const {expandedSections, selectImageType, setSelectImageType, toggleSection} =
    useUIState();
  // Refs
  const countryPickerBtmSeetRef = useRef(null);
  const cameraBottomSheetRef = useRef(null);
  const SelecterBottomSheetRef = useRef(null);

  // Memoized styles
  const styles = useMemo(
    () => dynamicStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  useEffect(() => {
    getProfile();
    checkConnectivity();
    gettPendingActions();
  }, []);

  useEffect(() => {
    initializeFormData(User);
  }, [User]);

  const choosePhotoFromLibrary = async () => {
    const cropConfig = {
      width: 500,
      height: 500,
      cropping: true,
      includeBase64: true,
      compressImageQuality: 1,
    };
    try {
      const image = await ImageCropPicker.openPicker({
        width: cropConfig.width,
        height: cropConfig.height,
        cropping: cropConfig.cropping,
        includeBase64: cropConfig.includeBase64,
        compressImageQuality: cropConfig.compressImageQuality,
        mediaType: 'photo',
      });

      const base64Image = cropConfig.includeBase64
        ? `data:${image.mime};base64,${image.data}`
        : null;

      const image1 = {
        path: image.path,
        mime: image.mime,
        base64: base64Image,
        width: image.width,
        height: image.height,
      };

      updateCompanyInfo('logo', image1);
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        showAlert(t('Error selecting image. Please try again.'));
      }
    }
  };

  // Image upload handler (similar to web version)
  const uploadImageToServer = useCallback(
    async image => {
      if (!image) return '';

      if (image.startsWith('http')) {
        return image;
      }

      // Upload new image
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: `upload-${Date.now()}.jpg`,
      });

      try {
        const {ok, data} = await fetchFormDataApi(
          imageUploadURL,
          'POST',
          null,
          formData,
          null,
          {'Content-Type': 'multipart/form-data'},
        );

        if (ok && data?.data?.url) {
          return data.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      } catch (error) {
        logger.error('Image upload failed:', error, {context: 'EditProfile'});
        throw error;
      }
    },
    [imageUploadURL],
  );

  const syncAllPendingActions = async () => {
    const connected = await checkConnectivity(false);
    if (!connected || pendingActions.length === 0) return;
    // setSyncAllModalVisible(true);
    for (const item of pendingActions) {
      await handleSyncPendingAction(item);
    }
  };

  useEffect(() => {
    if (isConnectedState && !showOfflineMode && pendingActions.length > 0) {
      syncAllPendingActions();
    }
  }, [isConnectedState, showOfflineMode, pendingActions]);

  // Handle image selection from camera/gallery
  const handleImagePick = useCallback(
    async img => {
      try {
        if (selectImageType === 'logo') {
          // Set temporary preview
          updateCompanyInfo('logo', img);

          // Upload to server and set server path
        } else if (selectImageType === 'profile') {
          // Set temporary preview
          updatePersonalInfo('profileImage', img);

          // Upload to server and set server path
        } else if (selectImageType === 'adminDoc') {
          updatePersonalInfo('adminDoc', {
            path: img.path,
            type: 'image',
          });
          cameraBottomSheetRef.current?.close();
          SelecterBottomSheetRef.current?.close();
        } else if (selectImageType === 'legalDoc') {
          updateCompanyInfo('legalDoc', {
            path: img.path,
            type: 'image',
          });
          cameraBottomSheetRef.current?.close();
          SelecterBottomSheetRef.current?.close();
        }
      } catch (error) {
        safeShowAlert('Image upload failed', 'error');
      }
    },
    [
      selectImageType,
      updateCompanyInfo,
      updatePersonalInfo,
      uploadImageToServer,
      safeShowAlert,
    ],
  );

  // Handle image deletion
  const handleImageDelete = useCallback(
    type => {
      if (type === 'logo') {
        updateCompanyInfo('logo', '');
        updateCompanyInfo('logoRaw', '');
      } else {
        updatePersonalInfo('profileImage', '');
        updatePersonalInfo('profileImageRaw', '');
      }
    },
    [updateCompanyInfo, updatePersonalInfo],
  );

  const handleCameraBottomSheetOpen = useCallback(imageType => {
    cameraBottomSheetRef.current?.open();
    setSelectImageType(imageType);
  }, []);

  // Cascading selection handlers (like web version)
  const handleRegionsChange = useCallback(
    values => {
      const selectedValues = Array.isArray(values) ? values : [values];
      const regionLabels = selectedValues.map(item => item.label || item);

      updateTargetZones('regions', regionLabels);
      // Clear children when parent changes
      updateTargetZones('countriesSel', []);
      updateTargetZones('citiesSel', []);
    },
    [updateTargetZones],
  );

  const checkConnectivity = async (showFeedback = true) => {
    try {
      const connected = await isConnected();
      setIsConnectedState(connected);

      if (!connected && showFeedback) {
        setShowOfflineMode(true);
      } else if (connected && showOfflineMode) {
        setShowOfflineMode(false);
      }

      return connected;
    } catch (error) {
      logger.error('Connectivity check failed:', error, {
        context: 'EditProfile',
      });
      setIsConnectedState(false);
      return false;
    }
  };

  const uploadFileToServer = useCallback(
    async (file, type = 'image') => {
      if (!file) return null;
      const connected = await checkConnectivity(false);
      if (!connected) {
        return file; // Return local path for offline storage
      }

      const formData = new FormData();
      const isDocument = type === 'document';

      formData.append(isDocument ? 'pdf' : 'image', {
        uri: file,
        type: isDocument ? 'application/pdf' : 'image/jpeg',
        name: `upload-${Date.now()}.${isDocument ? 'pdf' : 'jpg'}`,
      });

      try {
        const endpoint = `${baseUrl}/upload/${isDocument ? 'pdf' : 'image'}`;

        const {ok, data} = await fetchFormDataApi(
          endpoint,
          'POST',
          null,
          formData,
          null,
          {'Content-Type': 'multipart/form-data'},
        );

        if (!ok) {
          throw new Error(data?.message || 'Upload failed');
        }

        const imageUrl = ok ? data?.data?.url : file.path;
        return imageUrl;
      } catch (error) {
        logger.error(`${type} upload failed:`, error, {context: 'EditProfile'});
        return null;
      }
    },
    [baseUrl],
  );

  const gettPendingActions = async () => {
    try {
      const pending = await getPendingActions('EDIT_PROFILE');

      // Collect id + formData in one array
      const formDataArray = pending?.map(action => {
        const formData = JSON.parse(action.data);
        return {
          id: action.id,
          data: formData,
        };
      });

      setPendingActions(formDataArray || []);
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'EditProfile',
      });
    }
  };

  const handleCancelPendingAction = async id => {
    logger.log('id', id, {context: 'EditProfile'});

    try {
      await removePendingAction(id);
      gettPendingActions();
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'EditProfile',
      });
    }
  };

  const handleSyncPendingAction = async item => {
    const connected = await checkConnectivity();
    if (!connected) {
      showAlert(
        'Sync requires internet connection. Please try again when online.',
        'error',
      );
      return;
    }

    const data = item.data.data;
    setIsPendingLoading(true);
    try {
      let finalProfileImage = personalInfo.profileImageRaw;
      let finalLogo = companyInfo.logoRaw;
      let finalAdminDoc = personalInfo.adminDocUrl;
      let finalLegalDoc = companyInfo.legalDocUrl;

      if (personalInfo?.profileImage?.path) {
        finalProfileImage = await uploadFileToServer(
          data.profile_picture,
          'image',
        );
      }

      if (companyInfo?.logo?.path) {
        finalLogo = await uploadFileToServer(data.logo, 'image');
      }
      if (personalInfo?.adminDoc?.path) {
        finalAdminDoc = await uploadFileToServer(
          data.admin_document_url,
          'document',
        );
      }
      if (companyInfo?.legalDoc?.path) {
        finalLegalDoc = await uploadFileToServer(
          data.company_document_url,
          'document',
        );
      }

      const payload = {
        // --- Personal Details ---
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number, // Ensure phone number is trimmed
        profile_picture: finalProfileImage || '',
        middle_name: data.middle_name,
        legal_name: data.legal_name,
        trade_name: data.trade_name,
        business_sector: data.business_sector || '',
        company_registration_number: data.company_registration_number,
        business_email: data.business_email,
        business_phone_number: data.business_phone_number,
        business_type: data.business_type || '',
        logo: finalLogo || '',

        // --- Location ---
        country: data.country || '',
        community: '',
        province: data.province || '',
        city: data.city || '',
        // postal_code: companyAddress.postalCode || '',
        street_address: data.street_address, // Fix serialization issue
        region_code: data.region_code || '',

        latitude: data.latitude,
        longitude: data.longitude,
        countryCode: data.countryCode || '',
        region: data.region || '',
        continent: data.continent || '',

        // --- Target Market ---
        territory_zone: data.territory_zone || [],
        territory_countries: data.territory_countries || [],
        territory_cities: data.territory_cities || [],
        target_market: data.target_market || '',
        secondary_color: data.secondary_color || '',
        primary_color: data.primary_color || '',
        dob: data.dob || '',
        administrator_type: data.administrator_type || '',
        admin_document_url: finalAdminDoc,
        company_document_url: finalLegalDoc,
        business_address: data.business_address,
        business_activity: data.business_activity,
      };

      logger.log({payload}, {context: 'EditProfile'});

      const {ok, data: response} = await fetchApis(
        `${baseUrl}/company-admins/setup-complete-profile`,
        'POST',
        setIsPendingLoading,
        payload,
        null,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, response, language);
      await removePendingAction(item.id);
      gettPendingActions();
      if (ok && !response.error) {
        dispatch(setColors(data.primary_color));

        getProfile();
        // navigation.goBack();
      } else {
      }
    } catch (error) {
      logger.error('🚨 syncPendingActions error:', error, {
        context: 'EditProfile',
      });
      showAlert('Sync failed. Please try again.', 'error');
    } finally {
      onRefresh();
      setIsPendingLoading(false);
    }
  };

  const handleSaveProfile = useCallback(async () => {
    try {
      // Validate latitude and longitude
      const latitude = companyAddress.manualAddress
        ? null
        : parseFloat(companyAddress.latitude) || 0; // Fallback to 0 if undefined
      const longitude = companyAddress.manualAddress
        ? null
        : parseFloat(companyAddress.longitude) || 0; // Fallback to 0 if undefined

      logger.log('🚀 ~ EditProfile ~ latitude:', latitude, {
        context: 'EditProfile',
      });
      if (
        !companyAddress.manualAddress &&
        (isNaN(latitude) || isNaN(longitude))
      ) {
        safeShowAlert('Latitude and longitude must be valid numbers', 'error');
        return;
      }
      setSavingProfile(true);

      // Upload images if they are new (not server URLs)
      let finalProfileImage = personalInfo.profileImageRaw;
      let finalLogo = companyInfo.logoRaw;
      let finalAdminDoc = personalInfo.adminDocUrl;
      let finalLegalDoc = companyInfo.legalDocUrl;

      if (personalInfo?.profileImage?.path) {
        finalProfileImage = await uploadFileToServer(
          personalInfo.profileImage.path,
          'image',
        );
      }

      if (companyInfo?.logo?.path) {
        finalLogo = await uploadFileToServer(companyInfo.logo.path, 'image');
      }
      if (personalInfo?.adminDoc?.path) {
        finalAdminDoc = await uploadFileToServer(
          personalInfo.adminDoc.path,
          personalInfo.adminDoc.type,
        );
      }
      if (companyInfo?.legalDoc?.path) {
        finalLegalDoc = await uploadFileToServer(
          companyInfo.legalDoc.path,
          companyInfo.legalDoc.type,
        );
      }
      const payload = {
        // --- Personal Details ---
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        phone_number: personalInfo.phoneNumber, // Ensure phone number is trimmed
        profile_picture: finalProfileImage || '',
        middle_name: personalInfo.middleName,
        legal_name: companyInfo.legalName,
        trade_name: companyInfo.tradeName,
        business_sector: companyInfo.businessSector?.value || '',
        company_registration_number: companyInfo.businessRegNo,
        business_email: companyInfo.businessEmail,
        business_phone_number: companyInfo.businessPhone,
        business_type: companyInfo.businessType?.value || '',
        logo: finalLogo || '',

        // --- Location ---
        country: displayLocation.country || '',
        community: '',
        province: displayLocation.state || '',
        city: displayLocation.city || '',
        // postal_code: companyAddress.postalCode || '',
        street_address: displayLocation.address, // Fix serialization issue

        latitude,
        longitude,
        // timezone: companyAddress.timezone || '',
        // countryCode: companyAddress.countryCode || '',
        // region: companyAddress.region || '',
        // continent: companyAddress.continent || '',

        // --- Target Market ---
        territory_zone: targetZones.regions || [],
        territory_countries: targetZones.countriesSel || [],
        territory_cities: targetZones.citiesSel || [],
        target_market: targetZones.target_market || '',
        secondary_color: companyInfo.secondryColor || '',
        primary_color: companyInfo.primaryColor || '',
        dob: personalInfo.dob || '',
        administrator_type: personalInfo.administratorType.value || '',
        admin_document_url: finalAdminDoc,
        company_document_url: finalLegalDoc,
        business_address: companyInfo.businessAddress,
        business_activity: companyInfo.businessActivity,
      };

      console.log(payload);

      const connected = await checkConnectivity(false);

      if (!connected) {
        const result = await saveUpdatePendingAction('EDIT_PROFILE', {
          url: `${baseUrl}/company-admins/setup-complete-profile`,
          data: payload,
          token,
          type: 'EDIT_PROFILE',
        });

        logger.log('Payload stringify', payload, {context: 'EditProfile'});

        if (result?.rowsAffected > 0 || result?.insertId) {
          showAlert(
            'You are offline. The request has been queued and will sync automatically.',
            'success',
          );

          gettPendingActions();
        } else {
          showAlert(
            'Could not save offline request. Please try again.',
            'error',
          );
        }
        setSavingProfile(false);
      } else {
        const {ok, data} = await fetchApis(
          `${baseUrl}/company-admins/setup-complete-profile`,
          'POST',
          null,
          payload,
          null,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );

        ApiResponse(showAlert, data, language);
        if (ok && !data.error) {
          dispatch(setColors(companyInfo.primaryColor));
          dispatch(clearLocation());

          getProfile(); // Refresh profile data
          navigation.goBack();
        } else {
        }
      }
    } catch (error) {
      logger.error('Profile update error:', error, {context: 'EditProfile'});
      safeShowAlert(error.message || 'Something went wrong', 'error');
    } finally {
      setSavingProfile(false);
    }
  }, [
    personalInfo,
    companyInfo,
    companyAddress,
    targetZones,
    uploadImageToServer,
    token, // Ensure token is included in the dependency array
    safeShowAlert,
    getProfile,
    setSavingProfile,
    dispatch,
  ]);

  const handleCountrySelect = useCallback(
    country => {
      updateCompanyAddress('country', country);
    },
    [updateCompanyAddress],
  );


  if (initLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.lightTheme.primaryColor}
        />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const onSelectColor = hex => {
    // do something with the selected color.
    if (colorType === 'primary') {
      updateCompanyInfo('primaryColor', hex);
    } else if (colorType === 'secondry') {
      updateCompanyInfo('secondryColor', hex);
    }
    setShowModal(false);
  };

  const handleOpenDocument = async document_url => {
    if (document_url) {
      try {
        const canOpen = await Linking.canOpenURL(document_url);
        if (canOpen) {
          await Linking.openURL(document_url);
        } else {
          showAlert('Cannot open this document', 'error');
        }
      } catch (error) {
        logger.log('Error opening document:', error, {context: 'EditProfile'});
        showAlert('Failed to open document', 'error');
      }
    } else {
      showAlert('Document URL not available', 'error');
    }
  };

  const pickDocument = async () => {
    try {
      const [result] = await pick({
        mode: 'import',
        type: types.pdf,
      });

      if (result) {
        if (selectImageType === 'legalDoc') {
          updateCompanyInfo('legalDoc', {
            path: result.uri,
            name: result.name,
            type: 'document',
          });
        } else if (selectImageType === 'adminDoc') {
          updatePersonalInfo('adminDoc', {
            path: result.uri,
            name: result.name,
            type: 'document',
          });
        }
      }
    } catch (error) {
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        logger.error('Document picker error:', error, {context: 'EditProfile'});
        showAlert(t('Failed to select document'), 'error');
      }
    }
  };

  const viewSelectedDocument = uri => {
    viewDocument({
      uri: uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, {context: 'EditProfile'});
      showAlert(t('Failed to open document'), 'error');
    });
  };

  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };

  const renderOfflineBanner = () => {
    if (isConnectedState) return null;

    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>
          {t('You are offline. Please check your internet connection.')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkConnectivity}>
          <Text style={styles.retryButtonText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderOfflineBanner()}
      <View style={styles.headerContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="chevron-back"
              size={wp(6)}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <Image
            source={
              User?.user?.profile_picture
                ? {uri: User?.user?.profile_picture}
                : Images.placeholderImg
            }
            style={styles.ImageStyle}
          />
          <View style={{alignItems: 'flex-start'}}>
            <Text style={styles.ScreenHeading}>
              {`${User?.user?.full_name}`}
            </Text>
            <Text style={styles.Email}>{User?.user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(SCREENS.PROFILEDETAILS)}>
          <Icon
            name="chevron-forward"
            size={wp(6)}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {pendingActions.length > 0 && (
          <View style={styles.pendingRequestMainContainer}>
            <View style={{flexDirection: 'row', gap: wp(2)}}>
              <Text style={styles.label(isDarkMode)}>
                {t('Pending Requests')}
              </Text>
              {isPendingLoading && <Loader />}
              {!isConnectedState && (
                <Text style={styles.offlineIndicator}>({t('Offline')})</Text>
              )}
            </View>
            {pendingActions.map((item, index) => (
              <PendingRequestCard
                type={item.data.type}
                data={item.data.data}
                key={index}
                onCancelPress={() => handleCancelPendingAction(item.id)}
                onSyncPress={() => handleSyncPendingAction(item)}
                disabled={!isConnectedState} // Disable sync when offline
              />
            ))}
          </View>
        )}

        <ExpandableSection
          title={t('Admin Details')}
          expanded={expandedSections.adminDetails}
          onToggle={() => toggleSection('adminDetails')}
          containerStyle={styles.adminDetailsContainer(isDarkMode)}
          isDarkMode={isDarkMode}
          Colors={Colors}
          styles={styles}>
          <ProfileImageSection
            imageUri={
              personalInfo?.profileImage?.path
                ? personalInfo?.profileImage?.path
                : personalInfo?.profileImageRaw
            }
            onPress={() => handleCameraBottomSheetOpen('profile')}
            onDelete={() => handleImageDelete('profile')}
            editButtonText={t('Edit Profile Picture')}
            isDarkMode={isDarkMode}
            t={t}
            styles={styles}
          />

          <FormInputRow
            label={t('Full Name')}
            required
            Colors={Colors}
            isDarkMode={isDarkMode}
            styles={styles}>
            <View style={styles.inputRow}>
              <TxtInput
                value={personalInfo.firstName}
                containerStyle={[styles.inputField, styles.halfWidth]}
                placeholder="First Name"
                onChangeText={value => updatePersonalInfo('firstName', value)}
                multiline={true}
              />
              <TxtInput
                value={personalInfo.middleName}
                containerStyle={[styles.inputField, styles.halfWidth]}
                placeholder={t('Middle Name')}
                onChangeText={value => updatePersonalInfo('middleName', value)}
                multiline={true}
              />
            </View>
            <TxtInput
              value={personalInfo.lastName}
              containerStyle={[styles.inputField, styles.halfWidth]}
              placeholder={t('Last Name')}
              onChangeText={value => updatePersonalInfo('lastName', value)}
              multiline={true}
            />
          </FormInputRow>

          <FormInputRow
            label={t('Phone Number')}
            required
            styles={styles}
            Colors={Colors}
            isDarkMode={isDarkMode}>
            <CInputWithCountryCode
              phoneNo={personalInfo.phoneNumber}
              setPhoneNo={value => updatePersonalInfo('phoneNumber', value)}
              setCountryCode={value => updatePersonalInfo('countryCode', value)}
              countryCode={personalInfo.countryCode}
              width="100%"
              placeholderTextColor={
                isDarkMode
                  ? Colors.darkTheme.QuaternaryText
                  : Colors.lightTheme.QuaternaryText
              }
            />
          </FormInputRow>

          <FormInputRow
            label={t('Email')}
            required
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={personalInfo.email}
              containerStyle={styles.inputField}
              placeholder="john.doe@example.com"
              onChangeText={value => updatePersonalInfo('email', value)}
              keyboardType="email-address"
              editable={false} // Email not editable like web
            />
            <Text style={styles.emailNotEdit}>
              {t('Email is not editable')}
            </Text>
          </FormInputRow>
          <FormInputRow
            label={t('Date of Birth (DOB)')}
            required
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={moment(personalInfo.dob).format('DD-MM-YYYY')}
              containerStyle={styles.inputField}
              placeholder="Select your birth date"
              editable={false}
              rightSvg={<Svgs.calenderL />}
              rightIconPress={() => setDatePickerVisibility(true)}
              onPress={() => setDatePickerVisibility(true)}
            />
          </FormInputRow>

          <FormInputRow
            label={t('Legal Business')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <CustomDropDown
              data={[
                {label: 'Individual', value: 'individual'},
                {label: 'Legal Entity', value: 'legal_entity'},
              ]}
              selectedValue={personalInfo.administratorType}
              onValueChange={value =>
                updatePersonalInfo('administratorType', value)
              }
              placeholder="Select legal business"
              width={'100%'}
              search={false}
              astrik={false}
              
            />
          </FormInputRow>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.label(isDarkMode)}>{t('National ID')}</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectImageType('adminDoc');
                SelecterBottomSheetRef.current?.open();
              }}>
              <Svgs.editCircled />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.label(isDarkMode),
              {
                color: isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor,
                fontFamily: Fonts.PoppinsRegular,
                marginBottom: 0,
              },
            ]}>
            {t('Upload Document in PDF Format')}
          </Text>

          {personalInfo.adminDoc?.path ? (
            personalInfo.adminDoc.type === 'image' ? (
              <Image
                source={{uri: personalInfo.adminDoc.path}}
                style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
              />
            ) : personalInfo.adminDoc.type === 'document' ? (
              <TouchableOpacity
                onPress={() => viewSelectedDocument(personalInfo.adminDoc.path)}
                style={styles.uploadContainer}>
                <Svgs.pdf />
                <Text
                  style={[
                    styles.label,
                    {width: '50%', textAlign: 'center', marginTop: hp(1)},
                  ]}>
                  {personalInfo.adminDoc.name}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : personalInfo.adminDocUrl ? (
            <View style={styles.uploadContainer}>
              {isImageFile(personalInfo.adminDocUrl) ? (
                <Image
                  source={{uri: personalInfo.adminDocUrl}}
                  style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => handleOpenDocument(personalInfo.adminDocUrl)}
                  style={{
                    padding: wp(4),
                    backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                    borderRadius: wp(10),
                  }}>
                  <Svgs.pdf />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('adminDoc');
                  SelecterBottomSheetRef.current?.open();
                }}
                style={{
                  padding: wp(4),
                  backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          )}
        </ExpandableSection>

        <ExpandableSection
          title={t('Company Details')}
          expanded={expandedSections.companyDetails}
          onToggle={() => toggleSection('companyDetails')}
          containerStyle={styles.companyDetailsContainer(isDarkMode)}
          isDarkMode={isDarkMode}
          Colors={Colors}
          styles={styles}>
          <ProfileImageSection
            imageUri={
              companyInfo.logo?.path
                ? companyInfo?.logo?.path
                : companyInfo.logoRaw
            }
            onPress={() => choosePhotoFromLibrary()}
            onDelete={() => handleImageDelete('logo')}
            editButtonText={t('Edit Company Logo')}
            isDarkMode={isDarkMode}
            t={t}
            styles={styles}
          />

          <FormInputRow
            label={
              personalInfo.administratorType.value === 'legal_entity'
                ? t('Company Legal Name')
                : t('Business Name')
            }
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={companyInfo.legalName}
              containerStyle={styles.inputField}
              placeholder="NovaCorp Technologies Inc."
              onChangeText={value => updateCompanyInfo('legalName', value)}
            />
          </FormInputRow>
          {personalInfo.administratorType.value === 'legal_entity' && (
            <FormInputRow
              label={t('Company Business Name')}
              isDarkMode={isDarkMode}
              Colors={Colors}
              styles={styles}>
              <TxtInput
                value={companyInfo.tradeName}
                containerStyle={styles.inputField}
                placeholder="Trade Name"
                onChangeText={value => updateCompanyInfo('tradeName', value)}
              />
            </FormInputRow>
          )}

          <FormInputRow
            label={t('Business Sector/Industry')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <CustomDropDown
              data={BUSINESS_SECTORS}
              selectedValue={companyInfo.businessSector}
              onValueChange={value =>
                updateCompanyInfo('businessSector', value)
              }
              placeholder="Select Business Sector"
              width={'100%'}
              astrik={false}
            />
          </FormInputRow>

          {/* <FormInputRow
            label={t('Business Type')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <CustomDropDown
              data={BUSINESS_TYPES}
              selectedValue={companyInfo.businessType}
              onValueChange={value => updateCompanyInfo('businessType', value)}
              placeholder="Select Business Type"
              width={'100%'}
              astrik={false}
            />
          </FormInputRow> */}

          {personalInfo.administratorType.value === 'legal_entity' && (
            <FormInputRow
              label={t('Business Registration No.')}
              isDarkMode={isDarkMode}
              Colors={Colors}
              styles={styles}>
              <TxtInput
                value={companyInfo.businessRegNo}
                containerStyle={styles.inputField}
                placeholder="B12345678"
                onChangeText={value =>
                  updateCompanyInfo('businessRegNo', value)
                }
              />
            </FormInputRow>
          )}

          <FormInputRow
            label={t('Business Phone No.')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <CInputWithCountryCode
              phoneNo={companyInfo.businessPhone}
              setPhoneNo={value => updateCompanyInfo('businessPhone', value)}
              setCountryCode={value =>
                updateCompanyInfo('businessCountryCode', value)
              }
              // countryCode={companyInfo.businessCountryCode}
              width="100%"
              placeholderTextColor={
                isDarkMode
                  ? Colors.darkTheme.QuaternaryText
                  : Colors.lightTheme.QuaternaryText
              }
            />
          </FormInputRow>

          <FormInputRow
            label={t('Business Email')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={companyInfo.businessEmail}
              containerStyle={styles.inputField}
              placeholder="Nova@info.tech"
              onChangeText={value => updateCompanyInfo('businessEmail', value)}
              keyboardType="email-address"
            />
          </FormInputRow>
          <FormInputRow
            label={t('Business Activity')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={companyInfo.businessActivity}
              containerStyle={styles.inputField}
              placeholder="Describe your business activity"
              onChangeText={value =>
                updateCompanyInfo('businessActivity', value)
              }
            />
          </FormInputRow>
          {personalInfo.administratorType.value === 'legal_entity' && (
            <FormInputRow
              label={t('Business Address')}
              isDarkMode={isDarkMode}
              Colors={Colors}
              styles={styles}>
              <TxtInput
                value={companyInfo.businessAddress}
                containerStyle={styles.inputField}
                placeholder="Enter your business address"
                onChangeText={value =>
                  updateCompanyInfo('businessAddress', value)
                }
              />
            </FormInputRow>
          )}

          <FormInputRow
            label={t('Primary Color')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TouchableOpacity
              style={[
                styles.colorPickerInput,
                {backgroundColor: companyInfo.primaryColor},
              ]}
              onPress={() => {
                setShowModal(true);
                setColorType('primary');
              }}></TouchableOpacity>
          </FormInputRow>

          <FormInputRow
            label={t('Secondary Color')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TouchableOpacity
              style={[
                styles.colorPickerInput,
                {backgroundColor: companyInfo.secondryColor},
              ]}
              onPress={() => {
                setShowModal(true);
                setColorType('secondry');
              }}></TouchableOpacity>
          </FormInputRow>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: hp(2),
            }}>
            <Text style={styles.label(isDarkMode)}>
              {t('National Business ID')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectImageType('legalDoc');
                SelecterBottomSheetRef.current?.open();
              }}>
              <Svgs.editCircled />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.label(isDarkMode),
              {
                color: isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor,
                fontFamily: Fonts.PoppinsRegular,
                marginBottom: 0,
              },
            ]}>
            {t('Upload Document in PDF Format')}
          </Text>

          {companyInfo.legalDoc?.path ? (
            companyInfo.legalDoc.type === 'image' ? (
              <Image
                source={{uri: companyInfo.legalDoc.path}}
                style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
              />
            ) : companyInfo.legalDoc.type === 'document' ? (
              <TouchableOpacity
                onPress={() => viewSelectedDocument(companyInfo.legalDoc.path)}
                style={styles.uploadContainer}>
                <Svgs.pdf />
                <Text
                  style={[
                    styles.label,
                    {width: '50%', textAlign: 'center', marginTop: hp(1)},
                  ]}>
                  {companyInfo.legalDoc.name}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : companyInfo.legalDocUrl ? (
            <View style={styles.uploadContainer}>
              {isImageFile(companyInfo.legalDocUrl) ? (
                <Image
                  source={{uri: companyInfo.legalDocUrl}}
                  style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => handleOpenDocument(companyInfo.legalDocUrl)}
                  style={{
                    padding: wp(4),
                    backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                    borderRadius: wp(10),
                  }}>
                  <Svgs.pdf />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('legalDoc');
                  SelecterBottomSheetRef.current?.open();
                }}
                style={{
                  padding: wp(4),
                  backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          )}
        </ExpandableSection>

        <ExpandableSection
          title={t('Company Address')}
          expanded={expandedSections.companyAddress}
          onToggle={() => toggleSection('companyAddress')}
          containerStyle={styles.companyAddressContainer}
          isDarkMode={isDarkMode}
          Colors={Colors}
          styles={styles}>
          <FormInputRow
            label={t('Country')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={displayLocation.country}
              containerStyle={styles.inputField}
              placeholder="Country"
              editable={false}
            />
            <Text style={styles.emailNotEdit}>
              {t('Country is not editable')}
            </Text>
          </FormInputRow>

          <FormInputRow
            label={t('State/Province')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={displayLocation.state}
              containerStyle={styles.inputField}
              placeholder="State/Province"
              editable={false}
            />
            <Text style={styles.emailNotEdit}>{t('State/Province is not editable')}</Text>
          </FormInputRow>
          <FormInputRow
            label={t('City')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={displayLocation.city}
              containerStyle={styles.inputField}
              placeholder="City"
              editable={false}
            />
            <Text style={styles.emailNotEdit}>{t('City is not editable')}</Text>
          </FormInputRow>

          <FormInputRow
            label={t('Address')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <TxtInput
              value={displayLocation.address}
              containerStyle={[styles.inputField, {marginBottom: hp(0)}]}
              placeholder="Av. de Castilla-La Mancha, 18"
              onChangeText={value => updateCompanyAddress('address', value)}
              style={{flex: 1, marginBottom: hp(1)}}
              multiline={true}
            />
          </FormInputRow>

          <CustomButton
            containerStyle={styles.mapBtn(isDarkMode)}
            text="Update Location"
            textStyle={styles.mapBtnText(isDarkMode)}
            svg={<Svgs.MapIcon />}
            onPress={() => navigation.navigate(SCREENS.UPDATELOCATION)}
          />
        </ExpandableSection>

        {/* <ExpandableSection
          title={t('Target Zone / Region')}
          expanded={expandedSections.targetZone}
          onToggle={() => toggleSection('targetZone')}
          containerStyle={styles.targetZoneContainer(isDarkMode)}
          isDarkMode={isDarkMode}
          Colors={Colors}
          styles={styles}>
          <FormInputRow
            label={t('Regions')}
            isDarkMode={isDarkMode}
            Colors={Colors}
            styles={styles}>
            <CustomDropDown
              data={regionOptions}
              selectedValue={targetZones.regions.map(region => ({
                label: region,
                value: region,
              }))}
              onValueChange={handleRegionsChange}
              placeholder={
                targetZones.regions.length === 0
                  ? t('Select Regions')
                  : targetZones.regions[0]
              }
              width={'100%'}
              multiple={true}
              astrik={false}
            />
          </FormInputRow>
          <ZoneTags
            zones={targetZones.regions}
            isDarkMode={isDarkMode}
            styles={styles}
          />
        </ExpandableSection> */}
        <View style={[styles.btnContainer(isDarkMode)]}>
          <CustomButton
            text={savingProfile ? 'Updating...' : 'Update Profile'}
            onPress={handleSaveProfile}
            textStyle={styles.continueButtonText(isDarkMode)}
            containerStyle={[
              styles.continueButton(isDarkMode),
              {
                backgroundColor: isDarkMode
                  ? Colors.darkTheme.primaryBtn.BtnColor
                  : Colors.lightTheme.primaryBtn.BtnColor,
              },
            ]}
            disabled={savingProfile}
          />
        </View>
      </ScrollView>

      <CountryPickerBottomSheet
        refRBSheet={countryPickerBtmSeetRef}
        showSearch={true}
        heading={'Select Country'}
        selectLocation={companyAddress.country}
        setSelected={handleCountrySelect}
      />

      <CameraBottomSheet
        refRBSheet={cameraBottomSheetRef}
        onPick={handleImagePick}
        showDocument={selectImageType === 'legalDoc' || selectImageType === 'adminDoc'}
      />

      <ReusableBottomSheet
        height={hp('26%')}
        refRBSheet={SelecterBottomSheetRef}
        sheetTitle={'Select An Option'}
        options={[
          {
            icon: <Svgs.uploadDocument height={hp(4)} />,
            title: 'Upload Document',
            description: 'Upload a PDF document',
            onPress: () => {
              SelecterBottomSheetRef.current?.close();
              setTimeout(() => {
                pickDocument();
              }, 300);
            },
          },
          {
            icon: <Svgs.Gallery height={hp(4)} />,
            title: 'Upload Image',
            description: 'Upload an Image in JPG, PNG',
            onPress: () => {
              SelecterBottomSheetRef.current?.close();

              setTimeout(() => {
                cameraBottomSheetRef.current?.open();
              }, 300);
            },
          },
        ]}
      />

      <ColorPickerModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={onSelectColor}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onClose={() => setDatePickerVisibility(false)}
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');

          // Calculate age
          const selectedDate = moment(date);
          const today = moment();
          const age = today.diff(selectedDate, 'years');

          // Check if age is at least 18
          if (age < 18) {
            showAlert('Age must be at least 18 years old', 'error');
            setDatePickerVisibility(false);

            return;
          }

          updatePersonalInfo('dob', formatted);
          setDatePickerVisibility(false);
        }}
      />
    </View>
  );
};

// Updated dynamic styles
const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    scrollContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    loadingText: {
      marginTop: hp(2),
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    profileImage: {
      width: wp(5),
      height: wp(5),
      borderRadius: wp(5),
      marginRight: wp(2),
    },
    saveButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: isDarkMode => ({
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
    }),
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    sectionTitle: isDarkMode => ({
      fontSize: RFPercentage(pxToPercentage(20)),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    }),
    chevronContainer: {
      backgroundColor: Colors.lightTheme.primaryColor,
      borderRadius: wp(2),
      padding: wp(0.6),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2.6),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    headerStyle: isDarkMode => ({
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    }),
    adminDetailsContainer: isDarkMode => ({
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
      marginTop: hp(2),
      borderRadius: wp(3),
      padding: wp(4),
    }),
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
    companyDetailsContainer: isDarkMode => ({
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
      marginTop: hp(2),
      borderTopRadius: wp(3),
      padding: wp(4),
    }),
    companyAddressContainer: {
      padding: wp(4),
    },
    targetZoneContainer: isDarkMode => ({
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
      borderBottomRadius: wp(3),
      padding: wp(4),
    }),
    profileImageSection: {
      alignItems: 'center',
      paddingVertical: hp(2),
      flexDirection: 'row',
      marginBottom: hp(2),
    },
    imageContainer: {
      position: 'relative',
      marginRight: wp(4),
    },
    profileImage: {
      width: wp(20),
      height: wp(20),
      borderRadius: wp(10),
    },
    deleteIcon: {
      position: 'absolute',
      bottom: -4,
      right: -4,
    },
    editSection: {
      flex: 1,
      justifyContent: 'center',
    },
    editButton: {
      borderWidth: 1,
      borderColor: Colors.darkTheme.primaryColor,
      borderRadius: wp(10),
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(3),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(0.5),
      alignSelf: 'flex-start',
    },
    editButtonText: isDarkMode => ({
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    }),
    sizeInfo: isDarkMode => ({
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    }),
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    halfWidth: {
      flex: 1,
      width: wp(37),
    },
    label: isDarkMode => ({
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
      marginTop: hp(1),
    }),
    emailNotEdit: {
      fontSize: RFPercentage(pxToPercentage(12)),
      fontFamily: Fonts.PoppinsRegular,
      color: 'red',
      marginBottom: hp(0.5),
      marginTop: -hp(0.5),
    },
    inputField: {
      marginBottom: hp(1.5),
      backgroundColor: 'transparent',
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    colorPickerInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp('4%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp('0.3%'),
      borderRadius: wp(3),
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
      paddingVertical: hp(0.5),
      height: hp(6),
    },
    mapBtn: isDarkMode => ({
      paddingVertical: hp(1.3),
      borderRadius: wp(3),
      alignItems: 'center',
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      borderWidth: 1,
      marginTop: hp(2),
    }),
    mapBtnText: isDarkMode => ({
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor || '#fff'
        : Colors.lightTheme.primaryTextColor || '#333',
    }),
    btnContainer: isDarkMode => ({
      marginTop: hp(3),
      paddingTop: hp(2),
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    }),
    continueButton: isDarkMode => ({
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(5),
    }),
    continueButtonText: isDarkMode => ({
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    }),
    selectedZone: isDarkMode => ({
      fontSize: RFPercentage(pxToPercentage(14)),
      color: '#fff',
      fontFamily: Fonts.PoppinsRegular,
      backgroundColor: '#579DFF',
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      marginRight: wp(2),
      marginTop: hp(0.5),
    }),
    countrySelector: isDarkMode => ({
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
    }),
    countryText: isDarkMode => ({
      marginBottom: 0,
      width: '90%',
      marginTop: 0,
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    }),
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingBottom: hp(2),
      paddingTop: hp(5),
      justifyContent: 'space-between',
      marginBottom: hp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    ImageStyle: {
      width: wp(15),
      height: wp(15),
      borderRadius: wp(7.5),
      marginRight: wp(3),
    },
    ScreenHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(20)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    Email: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    offlineBanner: {
      backgroundColor: '#ff6b6b',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    offlineText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      flex: 1,
    },
    retryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: 5,
    },
    retryButtonText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
    },
    offlineIndicator: {
      color: '#ff6b6b',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.2),
      fontStyle: 'italic',
    },
    pendingRequestMainContainer: {
      marginHorizontal: wp(5),
    },
  });

export default EditProfile;
