import {CommonActions} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {GetCity, GetCountries, GetState} from 'react-country-state-city';
import {useTranslation} from 'react-i18next';
import {
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import CountryPickerBottomSheet from '@components/BottomSheets/CountryPickerBottomSheet';
import SuccessBottomSheet from '@components/BottomSheets/SuccessBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import CInputWithCountryCode from '@components/TextInput/CInputWithCountryCode';
import TxtInput from '@components/TextInput/Txtinput';
import {
  ApiResponse,
  fetchApis,
  fetchFormDataApi,
  isConnected,
} from '@utils/Helpers';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import {pick} from '@react-native-documents/picker';
import {viewDocument} from '@react-native-documents/viewer';
import NumericStepper from '@components/Stepper/NumericStepper';
import {savePendingAction} from '@utils/sqlite';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import logger from '@utils/logger';
import {
  extractEnglishWords,
  extractLocationHierarchy,
  getAddressFromCoordinates,
  getCurrentLocation,
  useReverseGeocoding,
} from '@utils/LocationHelpers';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Constants
const TOTAL_STEPS = 3;
const SCREEN_STEPS = {
  CREATE_PROFILE: 0,
  PERSONAL_DETAILS: 1,
  ADDRESS_DETAILS: 2,
  EMPLOYMENTDETAILS: 3,
  WORKER_DETAILS: 4,
};

const EMPLOYMENT_TYPES = [
  {label: 'Part Time', value: 'Part Time'},
  {label: 'Full Time', value: 'Full Time'},
  {label: 'Contract', value: 'Contract'},
];

const SHIFT_SCHEDULES = [
  {label: 'Morning', value: 'Morning'},
  {label: 'Evening', value: 'Evening'},
  {label: 'Night', value: 'Night'},
  {label: 'Rotating', value: 'Rotating'},
];

const validateEmail = email =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

// const validatePassword = password =>
//     password.trim(),
//   );

const createInitialFormData = (
  workerData,
  locationDropdownData,
  setIsManualAddress,
  setRegion
) => {
  if (!workerData) {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      dateOfBirth: '',
      image: null,
      imageURL: '',
      Department: {label: '', value: ''},
      Position: '',
      nationalID: null,
      EmploymentType: {label: '', value: ''},
      HireDate: '',
      Shift: {label: '', value: ''},
      address: '',
      city: {label: '', value: ''},
      state: {label: '', value: ''},
      country: {label: '', value: ''},
      postalCode: '',
      countryCode: '+1',
      latitude: null,
      longitude: null,
      Zone: {label: '', value: ''},
      salary: 0,
      workingHours: 0,
    };
  }
  const countryObj = workerData?.country
    ? locationDropdownData.countries.find(
        c => c.label === workerData?.country,
      ) || {
        label: workerData?.country || '',
        value: workerData?.country || '',
      }
    : {
        label: workerData?.country || '',
        value: workerData?.country || '',
      };

  const stateObj = workerData?.province
    ? locationDropdownData.states.find(
        s => s.label === workerData?.province,
      ) || {
        label: workerData?.province || '',
        value: workerData?.province || '',
      }
    : {
        label: workerData?.province || '',
        value: workerData?.province || '',
      };

  const cityObj = workerData?.city
    ? locationDropdownData.cities.find(c => c.label === workerData?.city) || {
        label: workerData?.city || '',
        value: workerData?.city || '',
      }
    : {
        label: workerData?.city || '',
        value: workerData?.city || '',
      };

  if (workerData?.latitude && workerData?.longitude) {
    setIsManualAddress(false);
    setRegion({
      latitude: Number(workerData.latitude),
      longitude:  Number(workerData.longitude),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  } else {
    setIsManualAddress(true);
  }

  return {
    firstName: workerData?.first_name || '',
    middleName: workerData?.middle_name || '',
    lastName: workerData?.last_name || '',
    email: workerData?.email || '',
    phoneNumber: workerData?.phone || '',
    password: '',
    dateOfBirth: workerData?.dob
      ? moment(workerData.dob).format('YYYY-MM-DD')
      : '',
    image: null,
    imageURL: workerData?.profile_image || '',
    Department: {
      label: workerData?.department_name || '',
      value: workerData?.department_id || '',
    },
    Position: workerData?.position || workerData?.designation || '',
    nationalID: workerData?.document_url
      ? {
          path: workerData.document_url,
          type: workerData.document_url?.endsWith('.pdf')
            ? 'document'
            : 'image',
          name: 'national_id',
          pathType: 'url',
        }
      : null,
    EmploymentType: {
      label: workerData?.employee_type || '',
      value: workerData?.employee_type || '',
    },
    HireDate: workerData?.hire_date
      ? moment(workerData.hire_date).format('YYYY-MM-DD')
      : '',
    Shift: {
      label: workerData?.shift_schedule || '',
      value: workerData?.shift_schedule || '',
    },
    address: workerData?.street_address || '',
    city: {
      label: workerData?.city || '',
      value: workerData?.city || '',
    },
    state: {
      label: workerData?.province || '',
      value: workerData?.province || '',
    },
    country: {
      label: workerData?.country || '',
      value: workerData?.country || '',
    },
    postalCode: workerData?.postal_code || '',
    countryCode: workerData?.country_code || '+1',
    latitude: workerData?.latitude ? Number(workerData.latitude) : null,
    longitude: workerData?.longitude ? Number(workerData.longitude) : null,
    Zone: {
      label: workerData?.assign_zone || '',
      value: workerData?.assign_zone || '',
    },
    salary: parseFloat(workerData?.salary) || 0,
    workingHours: parseInt(workerData?.work_hours) || 0,
  };
};

// Custom hooks for better separation of concerns
const useFormValidation = (formData, t, showAlert) => {
  const setFieldErrors = (setErrors, errorsObj) => {
    setErrors(prev => ({...prev, ...errorsObj}));
  };

  const validatePersonalDetails = useCallback(
    setErrors => {
      const {firstName, lastName, dateOfBirth, email, phoneNumber, image} =
        formData;

      let errors = {};

      if (!firstName.trim()) errors.firstName = t('Please enter first name.');
      if (!lastName.trim()) errors.lastName = t('Please enter last name.');
      // if (!dateOfBirth.trim()) errors.dateOfBirth = t('Please select DOB.');
      if (!email.trim()) errors.email = t('Please enter email.');
      else if (!validateEmail(email))
        errors.email = t('Please enter a valid email address');
      if (!phoneNumber.trim())
        errors.phoneNumber = t('Please enter phone number.');
      else if (phoneNumber.length < 10)
        errors.phoneNumber = t('Please enter valid phone number.');

      // if (!image && !formData.imageURL && !formData.image?.path)
      //   errors.image = t('Please upload an image.');

      // If errors exist → set them and return false
      if (Object.keys(errors).length > 0) {
        setFieldErrors(setErrors, errors);
        return false;
      }

      return true;
    },
    [formData, t],
  );

  const validateEmploymentDetails = useCallback(
    setErrors => {
      const {
        Department,
        Position,
        EmploymentType,
        HireDate,
        Shift,
        salary,
        workingHours,
      } = formData;

      let errors = {};

      if (!Department.value) errors.Department = t('Please select Department.');
      if (!EmploymentType.value)
        errors.EmploymentType = t('Please select Employment Type.');
      if (!Shift.value) errors.Shift = t('Please select Shift.');
      if (!Position.trim()) errors.Position = t('Please enter Position.');
      if (!HireDate) errors.HireDate = t('Please enter Hire Date.');
      if (!salary) errors.salary = t('Please enter salary.');
      if (!workingHours) errors.workingHours = t('Please enter working hours.');

      if (Object.keys(errors).length > 0) {
        setFieldErrors(setErrors, errors);
        return false;
      }

      return true;
    },
    [formData, t],
  );

  const validateAddressDetails = useCallback(
    (setErrors, isManualAddress) => {
      const {address, city, state, country, longitude, latitude} = formData;

      let errors = {};
      if (isManualAddress) {
        if (!address.trim()) errors.address = t('Please enter address.');
        // if (!postalCode.trim())
      } else {
        if (!latitude || !longitude)
          showAlert('Please select different location', 'error');
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(setErrors, errors);
        return false;
      }

      return true;
    },
    [formData, t],
  );

  return {
    validatePersonalDetails,
    validateEmploymentDetails,
    validateAddressDetails,
  };
};

const useLocationData = formData => {
  const [dropDownArrays, setDropDownArrays] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await GetCountries();
        setDropDownArrays(prev => ({...prev, countries}));
      } catch (error) {
        logger.error('Error loading countries:', error, {
          context: 'EditWorker',
        });
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!formData?.country?.value) return;

    const loadStates = async () => {
      try {
        const states = await GetState(Number(formData?.country.value));
        setDropDownArrays(prev => ({...prev, states}));
      } catch (error) {
        logger.error('Error loading states:', error, {context: 'EditWorker'});
      }
    };
    loadStates();
  }, [formData?.country?.value]);

  // Load cities when state changes
  useEffect(() => {
    if (!formData?.country?.value || !formData?.state?.value) return;

    const loadCities = async () => {
      try {
        const cities = await GetCity(
          Number(formData?.country.value),
          Number(formData?.state.value),
        );
        setDropDownArrays(prev => ({...prev, cities}));
      } catch (error) {
        logger.error('Error loading cities:', error, {context: 'EditWorker'});
      }
    };
    loadCities();
  }, [formData?.country?.value, formData?.state?.value]);

  // Memoized dropdown data
  const dropdownData = useMemo(
    () => ({
      countries:
        dropDownArrays.countries?.map(item => ({
          label: item.name,
          value: item.id,
        })) || [],
      states:
        dropDownArrays.states?.map(item => ({
          label: item.name,
          value: item.id,
        })) || [],
      cities:
        dropDownArrays.cities?.map(item => ({
          label: item.name,
          value: item.id,
        })) || [],
    }),
    [dropDownArrays],
  );

  return dropdownData;
};

const EditWorker = ({navigation, route}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const {departments} = useSelector(store => store.states);
  const {showAlert} = useAlert();
  const SelecterBottomSheetRef = useRef(null);
  const [selectImageType, setSelectImageType] = useState('');
  const [connected, setConnected] = useState(true);
  const [documentViewModalVisible, setdocumentViewModalVisible] =
    useState(false);


  // Get worker data from route params
  const workerData = route.params?.workerData;

  // Check if workerData is provided
  useEffect(() => {
    if (!workerData) {
      showAlert('No employee data provided', 'error');
      navigation.goBack();
    }
  }, [workerData, navigation, showAlert]);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const locationDropdownData = useLocationData(formData);
  const [isManualAddress, setIsManualAddress] = useState(true);
    const [region, setRegion] = useState({
    latitude: 33.6520751,
    longitude: 73.0816881,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const [formData, setFormData] = useState(() =>
    createInitialFormData(workerData, locationDropdownData, setIsManualAddress, setRegion),
  );
  const [currentStep, setCurrentStep] = useState(
    route.params?.indexx || SCREEN_STEPS.CREATE_PROFILE,
  );
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const isConnectedState = async () => {
      const online = await isConnected();
      setConnected(online);
      setIsManualAddress(!online);
    };

    isConnectedState();
  }, [currentStep]);


  // Refs
  const dateTypeRef = useRef('');
  const successBtmSheetRef = useRef(null);
  const countryPickerRef = useRef(null);
  const cameraSheetRef = useRef(null);

  // Custom hooks
  const {
    validatePersonalDetails,
    validateEmploymentDetails,
    validateAddressDetails,
  } = useFormValidation(formData, t, showAlert);

  const [personalDetailsErrors, setPersonalDetailsErrors] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    image: '',
  });

  const [EmploymentDetailsErrors, setEmploymentDetailsErrors] = useState({
    Department: '',
    Position: '',
    EmploymentType: '',
    HireDate: '',
    Shift: '',
    salary: '',
    workingHours: '',
  });

  const [AddressDetailsErrors, setAddressDetailsErrors] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const {addressComponent, address} = await getAddressFromCoordinates(
        latitude,
        longitude,
      );
      const locationHierarchy = extractLocationHierarchy(addressComponent);

      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      const updates = {
        address: address,
        city: {label: locationHierarchy.city},
        state: {label: locationHierarchy.state},
        postalCode: locationHierarchy.postalCode,
        latitude: latitude,
        longitude: longitude,
        country: {label: locationHierarchy.country},
      };

      Object.entries(updates).forEach(([key, value]) => {
        updateFormField(key, value);
      });
    } catch (err) {
      logger.warn('Failed to get current location:', err, {
        context: 'AddWorker',
      });
    }
  }, [
    getCurrentLocation,
    getAddressFromCoordinates,
    updateFormField,
    showAlert,
  ]);

  // Memoized values
  const progress = useMemo(
    () => ((step - 1) / (TOTAL_STEPS - 1)) * 100,
    [step],
  );
  const styles = useMemo(() => createStyles(isDarkMode, Colors), [isDarkMode]);

  // Form update function
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  // Date picker handlers
  const handleDateConfirm = useCallback(
    date => {
      const formatted = moment(date).format('YYYY-MM-DD');
      const type = dateTypeRef.current;

      if (type === 'DOB') {
        updateFormField('dateOfBirth', formatted);
        setPersonalDetailsErrors(prev => ({
          ...prev,
          dateOfBirth: '',
        }));
      } else {
        updateFormField('HireDate', formatted);
        setEmploymentDetailsErrors(prev => ({
          ...prev,
          HireDate: '',
        }));
      }

      setDatePickerVisibility(false);
    },
    [updateFormField],
  );

  const handleOpenDatePicker = useCallback(type => {
    dateTypeRef.current = type;
    setDatePickerVisibility(true);
  }, []);

  // Image handling
  const handleImagePick = useCallback(
    img => {
      if (selectImageType === 'profile') {
        updateFormField('image', img);
        updateFormField('imageURL', '');
        setPersonalDetailsErrors(prev => ({
          ...prev,
          image: '',
        }));
        cameraSheetRef.current?.close();
      } else if (selectImageType === 'nationalID') {
        updateFormField('nationalID', {path: img.path, type: 'image'});
        cameraSheetRef.current?.close();
        SelecterBottomSheetRef.current?.close();
      }
    },
    [updateFormField, selectImageType],
  );

  const uploadFileToServer = useCallback(
    async (file, type = 'image') => {
      if (!file) return null;

      // Don't upload if it's a URL (already uploaded)
      if (file.uri?.startsWith('http') || file.path?.startsWith('http')) {
        return file.uri || file.path;
      }

      setIsLoading(true);

      const formData = new FormData();
      const isDocument = type === 'document';

      formData.append(isDocument ? 'pdf' : 'image', {
        uri: file.uri || file.path,
        type: isDocument ? 'application/pdf' : file.mime || 'image/jpeg',
        name: file.name || `upload-${Date.now()}.${isDocument ? 'pdf' : 'jpg'}`,
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
        logger.error(`${type} upload failed:`, error, {context: 'EditWorker'});
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl],
  );

  // Navigation handlers
  const handleBack = useCallback(() => {
    const stepMap = {
      [SCREEN_STEPS.PERSONAL_DETAILS]: SCREEN_STEPS.CREATE_PROFILE,
      [SCREEN_STEPS.EMPLOYMENTDETAILS]: () => {
        setCurrentStep(SCREEN_STEPS.PERSONAL_DETAILS);
        setStep(1);
      },
      [SCREEN_STEPS.ADDRESS_DETAILS]: SCREEN_STEPS.EMPLOYMENTDETAILS,
      [SCREEN_STEPS.WORKER_DETAILS]: () => {
        if (connected) {
          setCurrentStep(SCREEN_STEPS.ADDRESS_DETAILS);
        } else {
          setCurrentStep(SCREEN_STEPS.EMPLOYMENTDETAILS);
        }
      },
    };

    const action = stepMap[currentStep];
    if (typeof action === 'function') {
      action();
    } else if (action !== undefined) {
      setCurrentStep(action);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handleSubmit = useCallback(async () => {
    const uploadedUrl = connected
      ? formData.image?.path && !formData.imageURL
        ? await uploadFileToServer(formData.image, 'image')
        : formData.imageURL || formData.image?.path || ''
      : formData.image?.path || formData.imageURL;

    // Upload national ID only if available (optional)
    const uploadedIDUrl = formData.nationalID
      ? connected
        ? await uploadFileToServer(
            formData.nationalID,
            formData.nationalID.type,
          )
        : formData.nationalID?.path
      : null;

    if (!uploadedUrl) return; // image is required

    // Check if Employee ID exists
    if (!workerData?.id) {
      showAlert('Employee ID not found', 'error');
      return;
    }

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      middle_name: formData.middleName,
      email: formData.email,
      phone: formData.phoneNumber,
      dob: formData.dateOfBirth,
      profile_image: uploadedUrl,

      department_id: parseInt(formData.Department.value),
      designation: formData.Position,
      position: formData.Position,
      employee_type: formData.EmploymentType.value,
      hire_date: formData.HireDate,
      assign_zone: formData.Zone?.label,
      country: formData.country?.label,
      province: formData.state?.label,
      city: formData.city?.label,
      street_address: formData.address,
      postal_code: formData.postalCode,
      shift_schedule: formData.Shift.value,
      country_code: formData.countryCode,
      work_hours: formData.workingHours,
      salary: formData.salary,
    };

    if (uploadedIDUrl) {
      payload.document_url = uploadedIDUrl;
    }
    if (formData.latitude) {
      payload.latitude = formData.latitude;
      payload.longitude = formData.longitude;
    }

    if (!connected) {
      payload.nationalIDType = formData.nationalID?.type; // unique identifier
      const result = await savePendingAction('UPDATE_WORKER', {
        url: `${baseUrl}/company-admins/workers/${workerData?.id}`,
        data: payload,
        token,
        type: 'worker',
      });

      if (result?.rowsAffected > 0 || result?.insertId) {
        showAlert(
          'You are offline. The request has been queued and will sync automatically.',
          'success',
        );
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.DASHBOARD,
                  state: {routes: [{name: SCREENS.WORKER}]},
                },
              ],
            }),
          );
        }, 3000);
      } else {
        showAlert('Could not save offline request. Please try again.', 'error');
      }
    } else {
      logger.log(payload,`${baseUrl}/company-admins/workers/${workerData?.id}`,{context: 'EditWorker'});
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/workers/${workerData?.id}`,
        'PUT', // Changed from POST to PUT for update
        setIsLoading,
        payload,
        showAlert,
        {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      );



      console.log(data);
      ApiResponse(showAlert, data, language);
      if (ok) {
        successBtmSheetRef.current?.open();
      } else {
      }
    }
  }, [formData, token, showAlert, uploadFileToServer, workerData?.id]);

  // Step navigation
  const handleContinue = useCallback(() => {
    const stepActions = {
      [SCREEN_STEPS.CREATE_PROFILE]: () =>
        setCurrentStep(SCREEN_STEPS.PERSONAL_DETAILS),
      [SCREEN_STEPS.PERSONAL_DETAILS]: () => {
        if (true) {
        // if (validatePersonalDetails(setPersonalDetailsErrors)) {
          setStep(2);
          setCurrentStep(SCREEN_STEPS.EMPLOYMENTDETAILS);
        }
      },
      [SCREEN_STEPS.EMPLOYMENTDETAILS]: () => {
        if (true) {
        // if (validateEmploymentDetails(setEmploymentDetailsErrors)) {
          setCurrentStep(SCREEN_STEPS.ADDRESS_DETAILS);
          if (connected) {
            setCurrentStep(SCREEN_STEPS.ADDRESS_DETAILS);
          } else {
            setCurrentStep(SCREEN_STEPS.WORKER_DETAILS);
          }
        }
      },
      [SCREEN_STEPS.ADDRESS_DETAILS]: () => {
        if (validateAddressDetails(setAddressDetailsErrors, isManualAddress)) {
          setCurrentStep(SCREEN_STEPS.WORKER_DETAILS);
        }
      },
      [SCREEN_STEPS.WORKER_DETAILS]: handleSubmit,
    };

    const action = stepActions[currentStep];
    if (action) action();
  }, [
    currentStep,
    connected,
    validatePersonalDetails,
    validateEmploymentDetails,
    validateAddressDetails,
    handleSubmit,
    isManualAddress,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (currentStep === 4) {
          return true; // ✅ disable back
        }
        handleBack();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [currentStep, handleBack]);

  const pickDocument = useCallback(async () => {
    try {
      const [result] = await pick({
        mode: 'import',
        type: ['application/pdf'],
      });

      if (result) {
        updateFormField('nationalID', {
          path: result.uri,
          name: result.name,
          type: 'document',
          pathType: 'local',
        });
      }
    } catch (error) {
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        logger.error('Document picker error:', error, {context: 'EditWorker'});
        showAlert(t('Failed to select document'), 'error');
      }
    }
  }, [showAlert, t]);

  const renderCreateProfile = () => (
    <View style={styles.inputsContainer}>
      <View
        style={{
          marginTop: hp(1),
          paddingHorizontal: wp(2),
          alignSelf: 'flex-start',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={40}
            color={
              isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor
            }
          />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{t('Employee Profile Update')}</Text>
          <Text style={styles.subheading}>
            <Text style={{fontFamily: Fonts.NunitoBold}}>
              {t('Edit Employee Information:')}
            </Text>
            {t('Update the details of the employee')}
          </Text>
        </View>
        <View style={{flex: 1, alignItems: 'center', marginTop: hp(7)}}>
          <Image
            source={Images.CreateCompanyProfile}
            style={{height: hp(40), width: hp(40), resizeMode: 'contain'}}
          />
        </View>
      </View>
    </View>
  );

  const renderPersonalDetailsFields = () => {
    const fields = [
      {
        label: t('First Name'),
        value: formData.firstName,
        field: 'firstName',
        placeholder: 'Enter the first name',
        required: true,
        error: personalDetailsErrors.firstName,
      },
      {
        label: t('Middle Name'),
        value: formData.middleName,
        field: 'middleName',
        placeholder: 'Enter the middle name',
        required: false,
      },
      {
        label: t('Last Name'),
        value: formData.lastName,
        field: 'lastName',
        placeholder: 'Enter the last name',
        required: true,
        error: personalDetailsErrors.lastName,
      },
      {
        label: t('Email'),
        value: formData.email,
        field: 'email',
        placeholder: 'admin@company.com',
        keyboardType: 'email-address',
        required: true,
        error: personalDetailsErrors.email,
      },
    ];

    return fields.map(field => (
      <View key={field.field} style={{marginBottom: hp(2)}}>
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={{color: Colors.error}}> *</Text>}
        </Text>
        <TxtInput
          value={field.value}
          containerStyle={styles.inputField}
          placeholder={field.placeholder}
          onChangeText={text => {
            setPersonalDetailsErrors(prev => ({...prev, [field.field]: ''}));
            updateFormField(field.field, text);
          }}
          keyboardType={field.keyboardType}
          secureTextEntry={field.secureTextEntry}
          error={field.error}
        />
      </View>
    ));
  };

  const renderPersonalDetails = () => (
    <View style={styles.inputsContainer}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.heading,
            {textAlign: 'left', fontSize: RFPercentage(2.5)},
          ]}>
          {t('Personal Information')}
        </Text>
      </View>

      <View
        style={{flex: 1, marginTop: hp(2), width: '85%', alignSelf: 'center'}}>
        {renderPersonalDetailsFields()}

        <View style={{marginBottom: hp(2)}}>
          <Text style={styles.label}>{t('Date of Birth (DOB)')}</Text>
          <TxtInput
            value={formData.dateOfBirth}
            containerStyle={styles.inputField}
            placeholder="Select your birth date"
            rightSvg={<Svgs.calenderL />}
            editable={false}
            rightIconPress={() => handleOpenDatePicker('DOB')}
            error={personalDetailsErrors.dateOfBirth}
            onPress={() => handleOpenDatePicker('DOB')}
          />
        </View>

        <Text style={styles.label}>
          {t('Phone Number')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <CInputWithCountryCode
          phoneNo={formData.phoneNumber}
          setPhoneNo={text => updateFormField('phoneNumber', text)}
          countryCode={formData.countryCode}
          placeholder="(555) 123-4567"
          width="100%"
          placeholderTextColor={
            isDarkMode
              ? Colors.darkTheme.QuaternaryText
              : Colors.lightTheme.QuaternaryText
          }
          error={personalDetailsErrors.phoneNumber}
        />

        <View style={{marginTop: hp(2)}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={styles.label}>{t('Profile Image')}</Text>

              <Text
                style={[
                  styles.label,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor,
                    fontFamily: Fonts.PoppinsRegular,
                  },
                ]}>
                {t('Upload image in PNG/JPG Format')}
              </Text>
            </View>

            {formData.image?.path || formData.imageURL ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('profile');
                  cameraSheetRef.current?.open();
                }}>
                <Svgs.editCircled />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.errorText}>{t(personalDetailsErrors.image)}</Text>

          {formData.image?.path || formData.imageURL ? (
            <Image
              source={{uri: formData.image?.path || formData.imageURL}}
              style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
            />
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('profile');
                  cameraSheetRef.current?.open();
                }}
                style={styles.uploadButton}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const viewSelectedDocument = useCallback(uri => {
    viewDocument({
      uri: uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, {context: 'EditWorker'});
      showAlert(t('Failed to open document'), 'error');
    });
  }, []);

  const renderEmploymentDetails = () => (
    <View style={styles.inputsContainer}>
      <View style={[styles.headerContainer, {marginBottom: hp(2)}]}>
        <Text
          style={[
            styles.heading,
            {textAlign: 'left', fontSize: RFPercentage(2.5)},
          ]}>
          {t('Employment Details')}
        </Text>
      </View>

      <View style={{flex: 1, width: '85%', alignSelf: 'center'}}>
        <View style={{marginBottom: hp(2)}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={styles.label}>{t('National ID')}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor,
                    fontFamily: Fonts.PoppinsRegular,
                  },
                ]}>
                {t('Upload image in PNG/JPG Format')}
              </Text>
            </View>
            {formData.nationalID?.path && (
              <TouchableOpacity
                onPress={() => SelecterBottomSheetRef.current?.open()}>
                <Svgs.editCircled />
              </TouchableOpacity>
            )}
          </View>

          {formData.nationalID?.path ? (
            formData.nationalID.type === 'image' ? (
              <Image
                source={{uri: formData.nationalID?.path}}
                style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
              />
            ) : formData.nationalID.type === 'document' ? (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() =>
                  formData.nationalID?.pathType === 'url'
                    ? setdocumentViewModalVisible(true)
                    : viewSelectedDocument(formData.nationalID.path)
                }>
                <Svgs.pdf />
                <Text
                  style={[
                    styles.label,
                    {width: '50%', textAlign: 'center', marginTop: hp(1)},
                  ]}>
                  {formData.nationalID.name}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={() => SelecterBottomSheetRef.current?.open()}
                style={styles.uploadButton}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.label}>
          {t('Department')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <CustomDropDown
          data={departments || []}
          selectedValue={formData?.Department}
          onValueChange={text => {
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              Department: '',
            }));
            updateFormField('Department', text);
          }}
          placeholder={formData?.Department?.label || 'Select Department'}
          width={'100%'}
          astrik={false}
          error={EmploymentDetailsErrors.Department}
        />

        <Text style={styles.label}>
          {t('Employment Type')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <CustomDropDown
          data={EMPLOYMENT_TYPES}
          selectedValue={formData?.EmploymentType}
          onValueChange={text => {
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              EmploymentType: '',
            }));
            updateFormField('EmploymentType', text);
          }}
          placeholder="Employment Type"
          width={'100%'}
          astrik={false}
          error={EmploymentDetailsErrors.EmploymentType}
        />

        <Text style={styles.label}>
          {t('Shift Schedule')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <CustomDropDown
          data={SHIFT_SCHEDULES}
          selectedValue={formData?.Shift}
          onValueChange={text => {
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              Shift: '',
            }));
            updateFormField('Shift', text);
          }}
          placeholder="Shift Schedule"
          width={'100%'}
          astrik={false}
          error={EmploymentDetailsErrors.Shift}
        />

        <Text style={styles.label}>
          {t('Position')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <TxtInput
          value={formData.Position}
          containerStyle={styles.inputField}
          placeholder={'Position'}
          onChangeText={text => {
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              Position: '',
            }));
            updateFormField('Position', text);
          }}
          error={EmploymentDetailsErrors.Position}
        />

        <Text style={styles.label}>
          {t('Hire Date')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>
        <TxtInput
          value={formData?.HireDate}
          containerStyle={styles.inputField}
          placeholder="MM/DD/YYYY"
          rightSvg={<Svgs.calenderL />}
          editable={false}
          rightIconPress={() => handleOpenDatePicker('HireDate')}
          error={EmploymentDetailsErrors.HireDate}
          onPress={() => handleOpenDatePicker('HireDate')}
        />

        <Text style={styles.label}>
          {t('Salary')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>

        <NumericStepper
          value={formData.salary}
          setValue={value => {
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              salary: '',
            }));
            updateFormField('salary', value);
          }}
          min={0}
          max={999999}
          containerStyle={{marginBottom: hp(1)}}
          error={EmploymentDetailsErrors.salary}
        />
        <Text style={styles.label}>
          {t('Working Hours')}
          <Text style={{color: Colors.error}}> *</Text>
        </Text>

        <NumericStepper
          value={formData.workingHours}
          setValue={value => {
            updateFormField('workingHours', value);
            setEmploymentDetailsErrors(prevState => ({
              ...prevState,
              workingHours: '',
            }));
          }}
          min={0}
          max={999999}
          containerStyle={{marginBottom: hp(1)}}
          error={EmploymentDetailsErrors.workingHours}
        />
      </View>
    </View>
  );

  const handlePlaceSelect = useCallback(async (data, details) => {
    if (!details?.geometry?.location) return;

    const {lat, lng} = details.geometry.location;
    const address = details.formatted_address;
    const locationHierarchy = extractLocationHierarchy(
      details.address_components,
    );

    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });

    const updates = {
      address: address,
      city: {label: locationHierarchy.city},
      state: {label: locationHierarchy.state},
      postalCode: locationHierarchy.postalCode,
      latitude: lat,
      longitude: lng,
      country: {label: locationHierarchy.country},
    };
    console.log({
      address: address,
      city: {label: locationHierarchy.city},
      state: {label: locationHierarchy.state},
      postalCode: locationHierarchy.postalCode,
      latitude: lat,
      longitude: lng,
      country: {label: locationHierarchy.country},
    });

    Object.entries(updates).forEach(([key, value]) => {
      updateFormField(key, value);
    });
  }, []);

  // Handle map press
  const handleMapPress = useCallback(async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;

    const {addressComponent, address} = await getAddressFromCoordinates(
      latitude,
      longitude,
    );
    const locationHierarchy = extractLocationHierarchy(addressComponent);

    setRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });

    const updates = {
      address: address,
      city: {label: locationHierarchy.city},
      state: {label: locationHierarchy.state},
      postalCode: locationHierarchy.postalCode,
      latitude: latitude,
      longitude: longitude,
      country: {label: locationHierarchy.country},
    };

    Object.entries(updates).forEach(([key, value]) => {
      updateFormField(key, value);
    });
  }, []);
  const renderMap = () => (
    <View style={{flex: 1}}>
      <GooglePlacesAutocomplete
        placeholder={t('Search Location')}
        minLength={2}
        fetchDetails={true}
        onPress={handlePlaceSelect}
        query={{key: GOOGLE_MAP_API_KEY, language: 'en'}}
        styles={{
          container: {
            position: 'absolute',
            width: '100%',
            zIndex: 1,
            alignItems: 'center',
          },
          listView: {
            width: '100%',
          },
          textInput: {
            color: isDarkMode
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor,
            borderRadius: 12,
            backgroundColor: isDarkMode
              ? Colors.darkTheme.input
              : Colors.lightTheme.backgroundColor,
            fontFamily: Fonts.PoppinsRegular,
          },
          textInputContainer: {
            marginTop: hp(1),
            width: '100%',
            alignSelf: 'center',
          },
          row: {
            width: '100%',
          },
          description: {
            color: isDarkMode
              ? Colors.darkTheme.secondryTextColor
              : Colors.lightTheme.secondryTextColor,
            fontFamily: Fonts.PoppinsRegular,
          },
        }}
        placeholderTextColor={
          isDarkMode
            ? Colors.darkTheme.secondryTextColor
            : Colors.lightTheme.secondryTextColor
        }
        debounce={200}
      />

      <MapView
        // ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onPoiClick={handleMapPress}>
        {formData?.latitude && (
          <Marker
            coordinate={{
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            title={formData.address || 'Selected Location'}
          />
        )}
      </MapView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#fff',
          borderRadius: 30,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
        onPress={getCurrentPosition}>
        <MaterialIcons
          name="my-location"
          size={RFPercentage(4)}
          color={'#006ec2'}
        />
      </TouchableOpacity>
    </View>
  );

  const renderAddressFields = () => {
    const dropdownFields = [
      {
        data: locationDropdownData.countries,
        selectedValue: formData.country,
        field: 'country',
        placeholder: 'Country',
        dependency: null,
        error: AddressDetailsErrors.country,
      },
      {
        data: locationDropdownData.states,
        selectedValue: formData.state,
        field: 'state',
        placeholder: 'State',
        dependency: formData.country?.value,
        error: AddressDetailsErrors.state,
      },
      {
        data: locationDropdownData.cities,
        selectedValue: formData.city,
        field: 'city',
        placeholder: 'City',
        dependency: formData.state?.value,
        error: AddressDetailsErrors.city,
      },
    ];

    return (
      <>
        {dropdownFields.map(field => {
          if (field.dependency !== null && !field.dependency) return null;

          return (
            <CustomDropDown
              key={field.field}
              data={field.data}
              selectedValue={field.selectedValue}
              onValueChange={value => {
                setAddressDetailsErrors(prevState => ({
                  ...prevState,
                  [field.field]: '',
                }));
                updateFormField(field.field, value);
              }}
              placeholder={field.placeholder}
              width={'100%'}
              dropdownContainerStyle={{height: hp(6.5)}}
              placeholderStyle={styles.label}
              search={true}
              error={field.error}
            />
          );
        })}

        <Text style={styles.label}>
          {t('Address')}
          <Text style={{color: 'red'}}> *</Text>
        </Text>
        <TxtInput
          value={formData.address}
          containerStyle={styles.inputField}
          placeholder="Add street, office address"
          onChangeText={text => {
            setAddressDetailsErrors(prevState => ({
              ...prevState,
              address: '',
            }));
            updateFormField('address', text);
          }}
          multiline={true}
          error={AddressDetailsErrors.address}
        />

        <Text style={styles.label}>{t('Postal Code')}</Text>
        <TxtInput
          value={formData.postalCode}
          containerStyle={styles.inputField}
          placeholder="Add your postal code"
          onChangeText={text => updateFormField('postalCode', text)}
        />
      </>
    );
  };

  const renderAddressDetails = () => (
    <View
      style={[
        styles.inputsContainer,
        {marginBottom: 0, alignItems: undefined},
      ]}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.heading,
            {textAlign: 'left', fontSize: RFPercentage(2.5)},
          ]}>
          {t('Employee Address & Location')}
        </Text>
      </View>

      <View
        style={[
          styles.addressContainer,
          {marginHorizontal: wp(6), marginBottom: 0, marginTop: hp(2)},
        ]}>
        <Text style={styles.label}>{t('Manual Address')}</Text>
        <TouchableOpacity
          disabled={!connected}
          onPress={() => {
            if (!isManualAddress) {
              setFormData(prev => ({
                ...prev,
                country: {label: ''},
                state: {label: ''},
                province: '',
                city: {label: ''},
                postalCode: '',
                address: '',
                latitude: '',
                longitude: '',
              }));
              setIsManualAddress(true);
            } else {
              setIsManualAddress(false);
              getCurrentPosition();
            }
          }}>
          {isManualAddress ? (
            <Svgs.checked
              height={hp(2.5)}
              width={hp(2.5)}
              style={{marginTop: hp(0.6)}}
            />
          ) : (
            <>
              {isDarkMode ? (
                <Svgs.UncheckBoxD
                  height={hp(2.5)}
                  width={hp(2.5)}
                  style={{marginTop: hp(0.6)}}
                />
              ) : (
                <Svgs.check
                  height={hp(2.5)}
                  width={hp(2.5)}
                  style={{marginTop: hp(0.6)}}
                />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {isManualAddress ? (
        <View style={{flex: 1, marginTop: hp(2), marginHorizontal: wp(6)}}>
          {renderAddressFields()}
        </View>
      ) : (
        renderMap()
      )}
    </View>
  );

  const renderWorkerDetailsSection = (title, data, onEdit) => (
    <>
      <View style={styles.workerDetailsHeadingContainer}>
        <Text
          style={[
            styles.heading,
            {fontSize: RFPercentage(2.5), textAlign: 'left'},
          ]}>
          {title}
        </Text>
        <TouchableOpacity onPress={onEdit}>
          <Svgs.editCircled />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, width: '90%', alignSelf: 'center'}}>
        <View style={styles.detailsContainer}>
          {data.map(
            (item, index) =>
              item.value !== 'N/A' && (
                <View key={index} style={{marginVertical: hp(0.3)}}>
                  <Text style={styles.key}>{item.key}</Text>
                  <Text style={styles.value}>{item.value}</Text>
                </View>
              ),
          )}
        </View>
      </View>
    </>
  );

  const renderWorkerDetails = () => {
    const personalDetailsData = [
      {key: t('First Name'), value: formData.firstName},
      {key: t('Last Name'), value: formData.lastName},
      {key: t('Date of Birth (DOB)'), value: formData.dateOfBirth || 'N/A'},
      {key: t('Email'), value: formData.email || 'N/A'},
      {
        key: t('Phone No'),
        value: `${formData.phoneNumber}` || 'N/A',
      },
      {
        key: t('Profile Image'),
        value: formData.image?.path?.split('/').pop() || 'N/A',
      },
    ];

    const employmentDetailsData = [
      {key: t('Department'), value: formData.Department?.label || 'N/A'},
      {key: t('Position'), value: formData.Position || 'N/A'},
      {key: t('Shift Schedule'), value: formData.Shift?.label || 'N/A'},
      {key: t('Hire Date'), value: formData.HireDate || 'N/A'},
      {key: t('Salary'), value: formData.salary?.toString() || 'N/A'},
      {
        key: t('Working Hours'),
        value: formData.workingHours?.toString() || 'N/A',
      },
    ];

    const addressDetailsData = [
      {key: t('Country'), value: formData.country?.label || 'N/A'},
      {key: t('Province'), value: formData.state?.label || 'N/A'},
      {key: t('City'), value: formData.city?.label || 'N/A'},
      {key: t('Postal Code'), value: formData.postalCode || 'N/A'},
      {key: t('Street Address'), value: formData.address || 'N/A'},
    ];

    return (
      <View style={styles.inputsContainer}>
        {renderWorkerDetailsSection(
          t('Personal Details'),
          personalDetailsData,
          () => setCurrentStep(SCREEN_STEPS.PERSONAL_DETAILS),
        )}
        {renderWorkerDetailsSection(
          t('Employment Details'),
          employmentDetailsData,
          () => {
            setStep(2);
            setCurrentStep(SCREEN_STEPS.EMPLOYMENTDETAILS);
          },
        )}
        {connected &&
          renderWorkerDetailsSection(
            t('Employee Address & Location'),
            addressDetailsData,
            () => setCurrentStep(SCREEN_STEPS.ADDRESS_DETAILS),
          )}
      </View>
    );
  };

  const renderCurrentStep = () => {
    const stepComponents = {
      [SCREEN_STEPS.CREATE_PROFILE]: renderCreateProfile,
      [SCREEN_STEPS.PERSONAL_DETAILS]: renderPersonalDetails,
      [SCREEN_STEPS.EMPLOYMENTDETAILS]: renderEmploymentDetails,
      [SCREEN_STEPS.ADDRESS_DETAILS]: renderAddressDetails,
      [SCREEN_STEPS.WORKER_DETAILS]: renderWorkerDetails,
    };

    const Component = stepComponents[currentStep] || renderCreateProfile;
    return Component();
  };

  const renderButtons = () => {
    const isCreateProfileStep = currentStep === SCREEN_STEPS.CREATE_PROFILE;
    const isPersonalDetailsStep = currentStep === SCREEN_STEPS.PERSONAL_DETAILS;
    const isWorkerDetailsStep = currentStep === SCREEN_STEPS.WORKER_DETAILS;

    if (isCreateProfileStep || isPersonalDetailsStep) {
      return (
        <CustomButton
          text="Next"
          onPress={handleContinue}
          textStyle={[
            styles.continueButtonText,
            language.value === 'es' && {fontSize: RFPercentage(1.5)},
          ]}
          containerStyle={styles.continueButton}
        />
      );
    }

    return (
      <View style={{flexDirection: 'row'}}>
        <CustomButton
          text="Back"
          onPress={handleBack}
          textStyle={[
            styles.skipButtonText,
            language.value === 'es' && {fontSize: RFPercentage(1.5)},
          ]}
          containerStyle={[styles.skipButton, {width: '35%'}]}
        />
        <CustomButton
          text={isWorkerDetailsStep ? 'Update Employee' : 'Next'}
          onPress={handleContinue}
          textStyle={[
            styles.continueButtonText,
            language.value === 'es' && {fontSize: RFPercentage(1.5)},
          ]}
          containerStyle={[
            styles.continueButton,
            {width: '50%', marginLeft: wp(7)},
          ]}
          isLoading={isLoading}
          loaderColor={'#fff'}
          LoaderSize={25}
        />
      </View>
    );
  };

  const showProgressBar =
    currentStep === SCREEN_STEPS.PERSONAL_DETAILS ||
    currentStep === SCREEN_STEPS.ADDRESS_DETAILS;
  const showBackButton = currentStep !== SCREEN_STEPS.CREATE_PROFILE;

  const renderOfflineBanner = () => {
    if (connected) return null;

    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>
          {t('You are offline. Please check your internet connection.')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => isConnected().then(setConnected)}>
          <Text style={styles.retryButtonText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <KeyboardAvoidingView
          style={{flex: 1, paddingTop: hp(2)}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {renderOfflineBanner()}
          {showBackButton && (
            <View style={styles.backArrowContainer}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={RFPercentage(4)}
                color={
                  isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.iconColor
                }
                onPress={handleBack}
              />

              {showProgressBar ? (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[styles.progressFill, {width: `${progress}%`}]}
                    />
                  </View>
                  <Text
                    style={styles.stepText}>{`${step}/${TOTAL_STEPS}`}</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.heading,
                    {
                      fontSize: RFPercentage(2.5),
                      fontFamily: Fonts.PoppinsMedium,
                    },
                  ]}>
                  {t('Personal Details')}
                </Text>
              )}
            </View>
          )}

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {renderCurrentStep()}
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>

      <View
        style={[
          styles.btnContainer,
          currentStep === SCREEN_STEPS.CREATE_PROFILE && {borderTopWidth: 0},
        ]}>
        {renderButtons()}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onClose={() => setDatePickerVisibility(false)}
        onConfirm={handleDateConfirm}
      />

      <CountryPickerBottomSheet
        refRBSheet={countryPickerRef}
        showSearch={true}
        heading="Select Country"
        selectLocation={selectedCountry}
        setSelected={setSelectedCountry}
      />

      <CameraBottomSheet refRBSheet={cameraSheetRef} onPick={handleImagePick} />

      <SuccessBottomSheet
        refRBSheet={successBtmSheetRef}
        text="Employee Updated Successfully!"
        BtnText={'Ok'}
        closeOnPressMask={true}
        onBtnPress={() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.DASHBOARD,
                  state: {
                    routes: [{name: SCREENS.WORKER}],
                  },
                },
              ],
            }),
          );
          successBtmSheetRef.current?.close();
        }}
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
              pickDocument();
            },
          },
          {
            icon: <Svgs.Gallery height={hp(4)} />,
            title: 'Upload Image',
            description: 'Upload an Image in JPG, PNG',
            onPress: () => {
              setSelectImageType('nationalID');
              SelecterBottomSheetRef.current?.close();
              cameraSheetRef.current?.open();
            },
          },
        ]}
      />

      <DocumentViewModal
        visible={documentViewModalVisible}
        documentUrl={formData.nationalID?.path}
        onClose={() => setdocumentViewModalVisible(false)}
      />
    </View>
  );
};

// Styles remain the same as original
const createStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    map: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
    },
    paginationContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      marginBottom: hp(3),
    },
    line: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      height: hp(0.2),
      alignSelf: 'center',
      width: wp(30),
      marginHorizontal: wp(1),
    },
    paginationText: {
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.BorderGrayColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      backgroundColor: 'transparent',
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(100),
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.2),
    },
    activeText: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      borderWidth: 1,
    },
    backArrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      paddingHorizontal: wp(5),
      marginBottom: hp(2),
    },
    progressContainer: {
      flex: 1,
      marginLeft: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
    progressBackground: {
      height: hp(1),
      backgroundColor: '#ddd',
      borderRadius: 4,
      width: '70%',
      overflow: 'hidden',
      marginHorizontal: hp(2),
    },
    progressFill: {
      height: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    stepText: {
      fontSize: 12,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    headerContainer: {
      alignItems: 'center',
    },
    heading: {
      fontSize: RFPercentage(3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
      width: wp(80),
    },
    subheading: {
      fontSize: RFPercentage(2.1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      width: wp(80),
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
    inputsContainer: {
      paddingBottom: hp(2),
      flex: 1,
      alignItems: 'center',
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
    },
    errorText: {
      color: '#FF3B30',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      // marginTop: hp(0.5),
      marginLeft: wp(1),
      textAlign: 'left',
    },
    inputField: {
      borderRadius: wp(3),
      // marginBottom: hp(2),
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
    uploadButton: {
      padding: wp(4),
      backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
      borderRadius: wp(10),
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
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
    skipButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#f1f2f4',
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    skipButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryBtn.TextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
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
      flex: 0.4,
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
    workerDetailsHeadingContainer: {
      marginVertical: hp(2),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      alignSelf: 'center',
    },
    detailsContainer: {
      backgroundColor: `${
        isDarkMode
          ? Colors.darkTheme.primaryColor
          : Colors.lightTheme.primaryColor
      }20`,
      paddingHorizontal: wp(2),
      borderColor: isDarkMode ? '#D1E9FB' : '#D1E9FB',
      borderWidth: 1,
      borderRadius: wp(2),
      paddingVertical: hp(1),
    },
    key: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.QuaternaryText,
      fontFamily: Fonts.PoppinsRegular,
      width: wp(80),
    },
    value: {
      fontSize: RFPercentage(1.7),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : '#363333',
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
  });

export default EditWorker;
