import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import CountryPickerBottomSheet from '@components/BottomSheets/CountryPickerBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import ColorPickerModal from '@components/CustomModal/ColorPickerModal';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import CInputWithCountryCode from '@components/TextInput/CInputWithCountryCode';
import TxtInput from '@components/TextInput/Txtinput';
import {ApiResponse, fetchApis, fetchFormDataApi} from '@utils/Helpers';
import {getCurrentLocation, useReverseGeocoding} from '@utils/LocationHelpers';
import useBackHandler from '@utils/useBackHandler';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import moment from 'moment';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import {pick, types} from '@react-native-documents/picker';
import {viewDocument} from '@react-native-documents/viewer';
import {setColors} from '@redux/Slices/theme';
import {GetCity, GetCountries, GetState} from 'react-country-state-city';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@translations/i18n';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import logger from '@utils/logger';
import {pxToPercentage} from '@utils/responsive';

const useLocationData = addressObject => {
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
        logger.error('Error loading countries', error, {
          context: 'CompanyInvitation.useLocationData',
        });
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!addressObject.country?.value) return;

    const loadStates = async () => {
      try {
        const states = await GetState(Number(addressObject.country.value));
        setDropDownArrays(prev => ({...prev, states}));
      } catch (error) {
        logger.error('Error loading states', error, {
          context: 'CompanyInvitation.useLocationData',
        });
      }
    };
    loadStates();
  }, [addressObject.country?.value]);

  // Load cities when state changes
  useEffect(() => {
    if (!addressObject.country?.value || !addressObject.state?.value) return;

    const loadCities = async () => {
      try {
        const cities = await GetCity(
          Number(addressObject.country.value),
          Number(addressObject.state.value),
        );
        setDropDownArrays(prev => ({...prev, cities}));
      } catch (error) {
        logger.error('Error loading cities', error, {
          context: 'CompanyInvitation.useLocationData',
        });
      }
    };
    loadCities();
  }, [addressObject.country?.value, addressObject.state?.value]);

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

const CompanyInvitation = ({navigation, route}) => {
  const [legalName, setlegalName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [BusinessEmail, setBusinessEmail] = useState('');
  const [BusinessActivity, setBusinessActivity] = useState('');
  const [BusinessAddress, setBusinessAddress] = useState('');
  const [TradeName, setTradeName] = useState('');
  const [AccountExecutive, setAccountExecutive] = useState({});
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [colorType, setColorType] = useState('primary');
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const {language, location, role} = useSelector(store => store.auth);
  const progress = ((step - 1) / (totalSteps - 1)) * 100;
  const {t} = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const cameraSheetRef = useRef();
  const [image, setImage] = useState(null);
  const indexx = route.params?.indexx;
  const {showAlert} = useAlert();
  const [index, setIndex] = useState(indexx || 0);
  const {token} = useSelector(store => store.createAccSlice);
  const [accExec, setAccExec] = useState([]);
  const [phone_number, setCompanyPhoneNumber] = useState('');
  const [country_code, setCompanyCountryCode] = useState('');
  const [BusinessRegNo, setBusinessRegNo] = useState('');
  const [BusinessSector, setBusinessSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [lastName, setlastName] = useState('');
  const [DOB, setDOB] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [errors, setErrors] = useState({});
  const {getAddressFromLatLng} = useReverseGeocoding();
  const SelecterBottomSheetRef = useRef(null);
  const [selectImageType, setSelectImageType] = useState('');
  const [addressObject, setAddressObject] = useState({
    country: null,
    state: '',
    province: '',
    city: '',
    // postalCode: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const locationDropdownData = useLocationData(addressObject);
  const [administratorType, setAdministratorType] = useState({});
  const [BusinessDoc, setBusinessDoc] = useState('');
  const [NationalId, setNationalId] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
    const accExecDropDownData = accExec?.map(item => ({
    label: item.full_name,
    value: item.id,
    email: item.email,
  }));

  const getAccExecById = (id) => {
  if (!id || !Array.isArray(accExecDropDownData)) return null;

  const found = accExecDropDownData.find(item => item.value === parseInt(id));

  setAccountExecutive(found || null);
  console.log('Found account executive for referral code:', found)
  return found;
};


;

  
  useEffect(() => {
    const fetchReferral = async () => {
      const code = await getReferralCode();
      setReferralCode(code.replace(/\D/g, ''));
      getAccExecById(code.replace(/\D/g, '')); 
    };
    fetchReferral();
  }, [accExec]);
  const getReferralCode = async () => {
    try {
      const code = await AsyncStorage.getItem('REFERRAL_CODE');
       getAccExecById(code); 

      return code; // returns null if not set
    } catch (error) {
      logger.error('Failed to fetch referral code', error, {
        context: 'CompanyInvitation.getReferralCode',
      });
      return null;
    }
  };
  
  const dispatch = useDispatch();

  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const locObj = await getAddressFromLatLng(latitude, longitude);

      console.log('Current location address object', locObj, {
        context: 'CompanyInvitation.getCurrentPosition',
      });
      setAddressObject(prev => ({
        ...prev,
        country: {label: locObj.country},
        state: {label: locObj.state},
        province: {label: locObj.state},
        ...((locObj.city || locObj.state) && {
         city: {label: locObj.city || locObj.state},
      }),
        // postalCode: locObj.components.postcode,
        address: locObj.address,
        latitude: latitude?.toString() || '',
        longitude: longitude?.toString() || '',
      }));
    } catch (err) {
      logger.warn('Failed to get current location', err, {
        context: 'CompanyInvitation.getCurrentPosition',
      });
    }
  }, []);

  const countryPickerBtmSeetRef = useRef();
  const [selectedCountry, setSelectedCountry] = useState();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (index === 4) {
          return true;
        }

        goBack();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [index, goBack]);

  useEffect(() => {
    if (!isManualAddress) {
      getCurrentPosition();
    }
  }, []);
  const getAccExecURL = `${baseUrl}/super-admin/public/account-executives?no_pagination=true`;
  const updateProfileUrl = `${baseUrl}/company-admins/setup-complete-profile`;

  // const zonesDropDownData = useMemo(() => {
  //   if (!assignedZones || assignedZones.length === 0) return [];

  //   return assignedZones.map(zone => {
  //     if (typeof zone === 'string') {
  //       return {label: zone, value: zone};
  //     } else {
  //       // Fallback for any other structure
  //       const label = zone.toString?.() || JSON.stringify(zone);
  //       return {label, value: label};
  //     }
  //   });
  // }, [assignedZones]);

  // const getAssignedZonesByRefreralCode = async () => {
  //   if (!referralCode) {
  //     setAssignedZones([]);
  //     return;
  //   }

  //   try {
  //     setLoadingZones(true);
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //     };

  //     const {ok, data} = await fetchApis(
  //       `${baseUrl}/account-executive/by-referral-code/${referralCode}`,
  //       'GET',
  //       null,
  //       headers,
  //       null,
  //       null,
  //     );

  //     if (ok && data?.data?.account_executive?.territory?.zone) {
  //       const zones = data.data.account_executive.territory.zone;

  //       logger.log('Extracted zones', zones, {
  //         context: 'CompanyInvitation.getAssignedZonesByRefreralCode',
  //       });
  //       setAssignedZones(zones);

  //       if (data.data.account_executive) {
  //         const accExecInfo = data.data.account_executive;
  //         // You can set this to state if needed elsewhere
  //         logger.log(
  //           'Account executive info',
  //           {id: accExecInfo.id},
  //           {context: 'CompanyInvitation.getAssignedZonesByRefreralCode'},
  //         );
  //         setAccountExecutive({value: accExecInfo.id});
  //       }
  //     } else {
  //       logger.log('No zones found in response', {
  //         context: 'CompanyInvitation.getAssignedZonesByRefreralCode',
  //       });
  //       setAssignedZones([]);
  //     }
  //   } catch (error) {
  //     logger.error('Error fetching zones', error, {
  //       context: 'CompanyInvitation.getAssignedZonesByRefreralCode',
  //     });
  //     setAssignedZones([]);
  //   } finally {
  //     setLoadingZones(false);
  //   }
  // };

  // const getAssignedZones = async accExecId => {
  //   try {
  //     const resignedZoneUrl = `${baseUrl}/account-executive/${accExecId}/assigned-zone`;
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //     };

  //     const {ok, data} = await fetchApis(
  //       resignedZoneUrl,
  //       'GET',
  //       null,
  //       headers,
  //       null,
  //       null,
  //     );

  //     if (ok && data?.data) {
  //       // Handle different possible zone structures
  //       let zones = [];

  //       if (Array.isArray(data.data)) {
  //         zones = data.data;
  //       } else if (data.data.territory_zone) {
  //         zones = data.data.territory_zone;
  //       } else if (data.data.zones) {
  //         zones = data.data.zones;
  //       } else if (typeof data.data === 'string') {
  //         // If it's a string, try to parse it as JSON array
  //         try {
  //           zones = JSON.parse(data.data);
  //         } catch (e) {
  //           zones = [data.data];
  //         }
  //       }

  //       logger.log('Assigned zones', zones, {
  //         context: 'CompanyInvitation.getAssignedZones',
  //       });
  //       setAssignedZones(zones);
  //     } else {
  //       setAssignedZones([]);
  //     }
  //   } catch (error) {
  //     setAssignedZones([]);
  //   }
  // };

  // useEffect(() => {
  //   if (referralCode) {
  //     getAssignedZonesByRefreralCode();
  //   } else {
  //     setAssignedZones([]);
  //   }
  // }, [referralCode]);

  const getAccExec = async () => {
    try {
      const {ok, data} = await fetchApis(
        getAccExecURL,
        'GET',
        null,
        null,
        null,
        null,
      );
      if (ok) {
        setAccExec(data?.data?.account_executives);
      } else {
        showAlert(
          'Something went wrong while getting account executives',
          'error',
        );
      }
    } catch (error) {
      logger.error('Error getting account executives', error, {
        context: 'CompanyInvitation.getAccExec',
      });
    }
  };
  useEffect(() => {
    getAccExec();
  }, []);

  const validateStep1 = () => {
    let newErrors = {};

    // if (
    //   !image ||
    // ) {
    //   newErrors.image = 'Please select a logo';
    // }

    if (!legalName || legalName.trim().length === 0) {
      if (administratorType.value === 'legal_entity') {
        newErrors.legalName = 'Please enter company name';
      } else {
        newErrors.legalName = 'Please enter business name';
      }
    } else if (!/^[a-zA-Z\s]+$/.test(legalName.trim())) {
      newErrors.legalName = 'Name should contain only alphabets and spaces';
    }

    if (!BusinessEmail || BusinessEmail.length === 0) {
      newErrors.BusinessEmail = 'Please enter email address';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(BusinessEmail)) {
        newErrors.BusinessEmail = 'Please enter a valid email';
      }
    }

    if (!phone_number || phone_number.length === 0) {
      newErrors.phone_number = 'Please enter phone number';
    } else if (!/^\+?\d{10,15}$/.test(phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!BusinessActivity || BusinessActivity.length === 0) {
      newErrors.BusinessActivity = 'Please write in your business activity';
    }
    if (
      (!BusinessAddress || BusinessAddress.length === 0) &&
      administratorType.value === 'legal_entity'
    ) {
      newErrors.BusinessAddress = 'Please add your business address';
    }

    // if (!BusinessType) {
    //   newErrors.BusinessType = 'Please select business type';
    // }

    if (!BusinessSector || !BusinessSector?.value) {
      newErrors.BusinessSector = 'Please select business sector';
    }
    // if (!BusinessDoc.path) {
    // }
    // if (!primaryColor) {
    // }
    // if (!secondaryColor) {
    // }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const validateStep2 = () => {
    const newErrors = {};
    const {
      country,
      city,
      // postalCode,
      address,
      latitude,
      longitude,
      state,
    } = addressObject || {};

    if (isManualAddress) {
      if (!country?.label?.trim()) {
        newErrors.country = 'Please select country';
      }
      if (!city?.label?.trim()) {
        newErrors.city = 'Please select city';
      }
      if (!state?.label?.trim()) {
        newErrors.state = 'Please select state';
      }
      if (!address?.trim()) {
        newErrors.address = 'Please enter address';
      }

      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    } else {
      if (
        !country?.label?.trim() ||
        !city?.label?.trim() ||
        !address?.trim() ||
        !latitude ||
        !longitude
      ) {
        showAlert('Please select a different location', 'error');
        return false;
      }

      // ✅ all good
      return true;
    }
  };

  const validateStep3 = () => {
    let newErrors = {};

    if (AccountExecutive?.value) {
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // ✅ valid if no errors
    return true;
  };

  const renderAddressFields = () => {
    const dropdownFields = [
      {
        data: locationDropdownData.countries,
        selectedValue: addressObject.country,
        field: 'country',
        placeholder: 'Country',
        dependency: null,
        error: errors.country,
      },
      {
        data: locationDropdownData.states,
        selectedValue: addressObject.state,
        field: 'state',
        placeholder: 'State',
        dependency: addressObject.country?.value,
        error: errors.state,
      },
      {
        data: locationDropdownData.cities,
        selectedValue: addressObject.city,
        field: 'city',
        placeholder: 'City',
        dependency: addressObject.state?.value,
        error: errors.city,
      },
    ];

    return (
      <ScrollView style={{flex: 1}}>
        {dropdownFields.map((field, index) => {
          if (field.dependency !== null && !field.dependency) return null;

          return (
            <CustomDropDown
              key={field.field}
              data={field.data}
              selectedValue={field.selectedValue}
              onValueChange={value => {
                setAddressObject(prev => ({
                  ...prev,
                  [field.field]: value,
                }));
              }}
              placeholder={field.placeholder}
              width={'100%'}
              dropdownContainerStyle={{height: hp(6.5)}}
              placeholderStyle={styles.label}
              error={field.error}
              search={true}
            />
          );
        })}

        <Text style={styles.label}>
          {t('Address')}
          <Text style={{color: 'red'}}> *</Text>
        </Text>
        <TxtInput
          value={addressObject.address}
          containerStyle={styles.inputField}
          placeholder="Add street, office address"
          onChangeText={text =>
            setAddressObject(prev => ({
              ...prev,
              address: text,
            }))
          }
          multiline={true}
          error={errors.address}
        />
      </ScrollView>
    );
  };




  const AccountExecutiveComponent = () => {
    return (
      <View style={[styles.inputsContainer, {marginBottom: hp(10)}]}>
        <View style={styles.contentContainer}>
          <View style={[styles.headerContainer, {marginBottom: hp(5)}]}>
            <Text style={styles.heading}>{t('Account Executive')}</Text>
            {referralCode && (
              <Text
                style={[
                  styles.subheading,
                  {color: 'green', fontWeight: '600'},
                ]}>
                {t('Refered by Account Executive')}
              </Text>
            )}
          </View>

          {/* <Text style={styles.label}>{t('Referral Code')}</Text>
          <TxtInput
            value={referralCode}
            onChangeText={value => setReferralCode(value)}
            editable={true}
            inputStyle={{
              fontSize: RFPercentage(1.8),
              color: 'green',
              fontWeight: '600',
            }}
            style={{
              marginBottom: hp(1.5),
            }}
            placeholder={t('Enter referral code')}
          /> */}
          <Text style={styles.label}>{t('Account Executive')}</Text>
          <CustomDropDown
            data={accExecDropDownData}
            selectedValue={AccountExecutive}
            onValueChange={value => {
              setAccountExecutive(value);
            }}
            placeholder={t('Select Account Executive')}
            width={'100%'}
            disable={referralCode ? true : false}
          />

          {/* {loadingZones ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={
                  isDarkMode
                    ? Colors.darkTheme.primaryColor
                    : Colors.lightTheme.primaryColor
                }
              />
            </View>
          ) : assignedZones.length > 0 ? (
            <>
              <Text style={styles.label}>{t('Assigned Zone')}</Text>
              <CustomDropDown
                data={zonesDropDownData}
                selectedValue={selectedZones}
                onValueChange={selectedItems => {
                  let itemsArray = [];

                  setErrors(prev => ({
                    ...prev,
                    assignedZones: null,
                  }));
                  if (Array.isArray(selectedItems)) {
                    itemsArray = selectedItems;
                  } else if (selectedItems) {
                    const exists = selectedZones.some(
                      zone => zone.value === selectedItems.value,
                    );

                    if (!exists) {
                      itemsArray = [...selectedZones, selectedItems];
                    } else {
                      itemsArray = selectedZones.filter(
                        zone => zone.value !== selectedItems.value,
                      );
                    }
                  }

                  setSelectedZones(itemsArray);
                }}
                placeholder={t('Select Zones')}
                width={'100%'}
                multiple={true}
                error={errors.assignedZones}
              />

              {selectedZones.length > 0 && (
                <View style={styles.selectedZonesContainer}>
                  <Text style={styles.selectedZonesLabel}>
                    {t('Selected Zones')}:
                  </Text>
                  <View style={styles.selectedZonesList}>
                    {selectedZones.map((zone, index) => (
                      <View key={index} style={styles.selectedZoneChip}>
                        <Text style={styles.selectedZoneText}>
                          {zone.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : referralCode ? (
            <View style={styles.noZonesContainer}>
              <Text style={styles.noZonesText}>
                {t('No assigned zones found for this referral code.')}
              </Text>
            </View>
          ) : null} */}
        </View>
      </View>
    );
  };

  const handleLeafLetMapPress = useCallback(async coordinates => {
    const latitude = coordinates.lat;
    const longitude = coordinates.lng;

    const locObj = await getAddressFromLatLng(latitude, longitude);
    setAddressObject(prev => ({
        ...prev,
        country: {label: locObj.country},
        state: {label: locObj.state},
        province: {label: locObj.state},
        ...((locObj.city || locObj.state) && {
         city: {label: locObj.city || locObj.state},
      }),
        // postalCode: locObj.components.postcode,
        address: locObj.address,
        latitude: latitude?.toString() || '',
        longitude: longitude?.toString() || '',
      }));
  }, []);

  const AddAddressComponent = () => {
    return (
      <View style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{t('Company Address')}</Text>
          <Text style={styles.subheading}>
            {t('Add company register address/location details')}
          </Text>
        </View>
        <View
          style={[
            styles.addressContainer,
            {marginHorizontal: wp(6), marginBottom: 0, marginTop: hp(2)},
          ]}>
          <Text style={styles.label}>{t('Manual Address')}</Text>
          <TouchableOpacity
            onPress={() => {
              if (!isManualAddress) {
                setAddressObject(prev => ({
                  ...prev,
                  country: {label: ''},
                  state: {label: ''},
                  province: '',
                  city: {label: ''},
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
          <LeafLetMapComponent
            initialZoom={5}
            initialLat={
              addressObject?.latitude ? addressObject?.latitude : 40.7128
            }
            initialLng={
              addressObject?.longitude ? addressObject?.longitude : -74.006
            }
            markers={[]}
            onMapPress={handleLeafLetMapPress}
            style={{flex: 1}}
            initialMarkerTitle={'Current Location'}
            searchPlaceholder={t('Find a place...')}
            showSearch={true}
            currentLocation={true}
            currentLocationOnpress={getCurrentPosition}
          />
        )}
      </View>
    );
  };

  const goBack = () => {
    if (index === 4) {
      setIndex(3);
      setStep(3);
    } else if (index === 3) {
      setIndex(2);
      setStep(2);
    } else if (index === 2) {
      setIndex(1);
      setStep(1);
    } else if (index === 1) {
      setIndex(0);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!profileImage) {
      newErrors.profileImage = 'Please select profile image';
    }
    if (!firstName || firstName.trim().length === 0) {
      newErrors.firstName = 'Please enter first name';
    }

    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'Please enter last name';
    }
    if (!DOB) {
      newErrors.dob = 'Please select date of birth';
    } else {
      // Calculate age from DOB
      const selectedDate = moment(DOB);
      const today = moment();
      const age = today.diff(selectedDate, 'years');

      // Check if age is at least 18
      if (age < 18) {
        newErrors.dob = 'Age must be at least 18 years old';
      }
    }
    if (!administratorType.value) {
      newErrors.administratorType = 'Please select legal business';
    }
    // if (!NationalId) {
    // }
    if (!phoneNumber || phoneNumber.length === 0) {
      newErrors.phoneNumber = 'Please enter phone number';
    } else if (!/^\+?\d{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // ✅ no errors → valid
  };

  const uploadFileToServer = useCallback(
    async (file, type = 'image') => {
      if (!file) return null;

      setLoading(true);
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
        logger.error(`${type} upload failed`, error, {
          context: 'CompanyInvitation.uploadFileToServer',
        });
        return null;
      }
    },
    [baseUrl],
  );

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

      setImage(image1);
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        logger.error('Error selecting image', err, {
          context: 'CompanyInvitation.choosePhotoFromLibrary',
        });
        showAlert(t('Error selecting image. Please try again.'));
      }
    }
  };

  const handleContinue = async () => {
    if (index === 0) {
      setIndex(1);
      // } else if (index === 1 && true) {
    } else if (index === 1 && validateForm()) {
      setIndex(2);
      setStep(2);
      // } else if (index === 2 && true) {
    } else if (index === 2 && validateStep1()) {
      setIndex(3);
      setStep(3);
    } else if (index === 3 && validateStep2()) {
      setIndex(4);
      setStep(4);
    } else if (index === 4) {
      const uploadedUrl = await uploadFileToServer(image, 'image');

      const uploadedProfileUrl = await uploadFileToServer(
        profileImage,
        'image',
      );
      const uploadedBusinessDocUrl = await uploadFileToServer(
        BusinessDoc,
        BusinessDoc.type,
      );
      const uploadNationalIdDocUrl = await uploadFileToServer(
        NationalId,
        NationalId.type,
      );

      const payloadd = {
        profile_picture: uploadedProfileUrl,
        legal_name: legalName,
        trade_name: TradeName,
        business_sector: BusinessSector?.label,
        company_registration_number: BusinessRegNo,
        business_email: BusinessEmail,
        business_phone_number: phone_number.length > 6 ? phone_number : '',
        // business_type: BusinessType.value,
        logo: uploadedUrl,
        country: addressObject.country?.label?.trim(),
        community: '',
        province: addressObject.state?.label?.trim(),
        city: addressObject.city?.label?.trim(),
        street_address: addressObject.address,
        account_executive_id: AccountExecutive?.value || null,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber.length > 6 ? phoneNumber : '',
        secondary_color: primaryColor,
        primary_color: secondaryColor,
        dob: DOB,
        middle_name: MiddleName,
        administrator_type: administratorType.value,
        admin_document_url: uploadNationalIdDocUrl,
        company_document_url: uploadedBusinessDocUrl,
        business_address: BusinessAddress,
        territory_zone: [],
        business_activity: BusinessActivity,
        ...(addressObject.latitude && addressObject.longitude
          ? {
              latitude: addressObject.latitude,
              longitude: addressObject.longitude,
            }
          : {}),
      };

      try {
        const {ok, data} = await fetchApis(
          updateProfileUrl,
          'POST',
          setLoading,
          payloadd,
          showAlert,
          {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          null,
        );

        logger.log('Profile update payload', payloadd, {
          context: 'CompanyInvitation.handleContinue',
        });

        // ❌ If the request failed (network/server error)
        if (!ok) {
          ApiResponse(showAlert, data, language);
          return;
        }

        // ❌ If backend says error: true
        if (data?.error) {
          ApiResponse(showAlert, data, language);
          return;
        }

        // ⭐ SUCCESS CASE
        // Use API response message (translated)
        ApiResponse(showAlert, data, language);

        if (primaryColor) {
          dispatch(setColors(primaryColor));
        }
        await AsyncStorage.removeItem('REFERRAL_CODE');


        navigation.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.EMAILVERIFIED,
              params: {
                navigateFrom: SCREENS.COMPANYINVITATION,
              },
            },
          ],
        });
      } catch (error) {
        logger.error('Error in profile update', error, {
          context: 'CompanyInvitation.handleContinue',
        });
        showAlert(t('Something went wrong. Please try again.'), 'error');
      }
    }
  };

  const styles = dynamicStyles(isDarkMode, Colors);

  const isSpanish = language.value === 'es';

  const handleImagePick = useCallback(
    img => {
      if (selectImageType === 'profile') {
        setProfileImage(img);
        cameraSheetRef.current?.close();
      } else if (selectImageType === 'nationalID') {
        setNationalId({
          path: img.path,
          type: 'image',
        });
        cameraSheetRef.current?.close();
        SelecterBottomSheetRef.current?.close();
      } else if (selectImageType === 'BusinessDoc') {
        setBusinessDoc({
          path: img.path,
          type: 'image',
        });
        cameraSheetRef.current?.close();
        SelecterBottomSheetRef.current?.close();
      }
    },
    [selectImageType],
  );

  const CreateInvitaionComponent = () => {
    return (
      <View style={[styles.inputsContainer, {marginBottom: hp(13)}]}>
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
            <Text
              style={[
                styles.heading,
                isSpanish && {fontSize: RFPercentage(2.8)},
              ]}>
              {t('Company Invitation & Registration')}
            </Text>
            <Text style={styles.subheading}>
              <Text style={{fontFamily: Fonts.NunitoBold}}>
                {t('Company Details:')}{' '}
              </Text>
              {t('Tell us your company client legal details')}
            </Text>
          </View>

          <View style={{flex: 1, alignItems: 'center', marginTop: hp(7)}}>
            <Image
              source={Images.CompanyInvitation}
              style={{height: hp(40), width: hp(40), resizeMode: 'contain'}}
            />
          </View>
        </View>
      </View>
    );
  };

  const pickDocument = useCallback(
    async type => {
      try {
        const [result] = await pick({
          mode: 'import',
          type: [types.pdf],
        });

        if (result) {
          if (selectImageType === 'BusinessDoc') {
            setBusinessDoc({
              path: result.uri,
              name: result.name,
              type: 'document',
            });
          } else {
            setNationalId({
              path: result.uri,
              name: result.name,
              type: 'document',
            });
          }
        }
      } catch (error) {
        if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
          logger.error('Document picker error', error, {
            context: 'CompanyInvitation.pickDocument',
          });
          showAlert(t('Failed to select document'), 'error');
        }
      }
    },
    [showAlert, t, selectImageType],
  );

  const viewSelectedDocument = useCallback(uri => {
    viewDocument({
      uri: uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error', error, {
        context: 'CompanyInvitation.viewSelectedDocument',
      });
      showAlert(t('Failed to open document'), 'error');
    });
  }, []);

  const CompanyDetailsComponent = () => {
    return (
      <ScrollView style={styles.inputsContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text
              style={[
                styles.heading,
                isSpanish && {fontSize: RFPercentage(2.8)},
              ]}>
              {t('Company Details')}
            </Text>
            <Text
              style={[
                styles.subheading,
                isSpanish && {fontSize: RFPercentage(1.9)},
              ]}>
              {t('Add companies legal details')}
            </Text>
          </View>

          <View style={{marginTop: hp(2)}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: hp(2),
              }}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <Text style={[styles.label, {width: wp(10)}]}>{t('Logo')}</Text>

                  {image?.path && (
                    <TouchableOpacity onPress={() => setImage(null)}>
                      <Text
                        style={[
                          styles.label,
                          {
                            width: wp(20),
                            color: Colors.darkTheme.primaryColor,
                            fontSize: RFPercentage(pxToPercentage(14)),
                          },
                        ]}>
                        ({t('Remove')})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text
                  style={[
                    styles.label,
                    {
                      color: isDarkMode
                        ? Colors.darkTheme.secondryTextColor
                        : Colors.lightTheme.secondryTextColor,
                      fontFamily: Fonts.PoppinsRegular,
                      marginBottom: 0,
                    },
                  ]}>
                  {t('Upload image in PNG/JPG Format')}
                </Text>
              </View>
            </View>

            {image?.path ? (
              <View style={{position: 'relative'}}>
                {image?.path && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1000,
                    }}
                    onPress={() => choosePhotoFromLibrary()}>
                    <Svgs.editCircled />
                  </TouchableOpacity>
                )}
                <Image
                  source={{uri: image?.path}}
                  style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
                />
              </View>
            ) : (
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  onPress={() => choosePhotoFromLibrary()}
                  style={{
                    padding: wp(4),
                    backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                    borderRadius: wp(10),
                  }}>
                  <Svgs.whitePlus />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{flex: 1, marginTop: hp(2)}}>
            <Text style={styles.label}>
              {administratorType.value === 'legal_entity'
                ? t('Company Legal Name')
                : t('Business Name')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <TxtInput
              value={legalName}
              containerStyle={styles.inputField}
              style={{marginBottom: hp(2)}}
              placeholder="Your Company Name"
              onChangeText={setlegalName}
              error={errors.legalName}
            />
            {administratorType.value === 'legal_entity' && (
              <View>
                <Text style={styles.label}>{t('Company Business Name')}</Text>
                <TxtInput
                  value={TradeName}
                  containerStyle={styles.inputField}
                  style={{marginBottom: hp(2)}}
                  placeholder="Add trade name"
                  onChangeText={setTradeName}
                  error={errors.TradeName}
                />
              </View>
            )}

            <Text style={styles.label}>
              {t('Business Activity')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <TxtInput
              value={BusinessActivity}
              containerStyle={styles.inputField}
              placeholder="Describe your business activity"
              onChangeText={setBusinessActivity}
              error={errors.BusinessActivity}
              style={{marginBottom: hp(2)}}
              inputStyle={{height: hp(8), textAlignVertical: 'top'}}
            />

            <Text style={styles.label}>
              {t('Business Email')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <TxtInput
              value={BusinessEmail}
              containerStyle={styles.inputField}
              placeholder="admin@company.com"
              onChangeText={setBusinessEmail}
              error={errors.BusinessEmail}
              style={{marginBottom: hp(2)}}
            />
            <Text style={styles.label}>
              {t('Phone Number')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <CInputWithCountryCode
              phoneNo={phone_number}
              setPhoneNo={setCompanyPhoneNumber}
              setCountryCode={setCompanyCountryCode}
              countryCode={country_code}
              placeholder="(555) 123-4567"
              width="100%"
              placeholderTextColor={
                isDarkMode
                  ? Colors.darkTheme.QuaternaryText
                  : Colors.lightTheme.QuaternaryText
              }
              error={errors.phone_number}
            />

            {administratorType.value === 'legal_entity' && (
              <View>
                <Text style={[styles.label, {marginTop: hp(1)}]}>
                  {t('Company Registration Number')}
                </Text>
                <TxtInput
                  value={BusinessRegNo}
                  containerStyle={styles.inputField}
                  placeholder="Company Registration Number"
                  onChangeText={setBusinessRegNo}
                  keyboardType={'numeric'}
                  error={errors.BusinessRegNo}
                />
              </View>
            )}

            {/* <Text style={[styles.label, {marginTop: hp(2)}]}>
              {t('Business Type')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text> */}

            {/* <CustomDropDown
              data={[
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
              ]}
              selectedValue={BusinessType}
              onValueChange={setBusinessType}
              placeholder={t('Business Type')}
              width={'100%'}
              error={errors.BusinessType}
            /> */}
            <Text style={[styles.label, {marginTop: hp(1)}]}>
              {t('Business Sector/Industry')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <CustomDropDown
              data={[
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
              ]}
              selectedValue={BusinessSector}
              onValueChange={setBusinessSector}
              placeholder="Select Business Sector"
              width={'100%'}
              astrik={false}
              error={errors.BusinessSector}
              search={false}
            />

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={[styles.label, {width: wp(60)}]}>
                {t('Primary Color')}
              </Text>
              {primaryColor && (
                <TouchableOpacity onPress={() => setPrimaryColor('')}>
                  <Text
                    style={[
                      styles.label,
                      {
                        width: wp(20),
                        color: Colors.darkTheme.primaryColor,
                        fontSize: RFPercentage(pxToPercentage(14)),
                      },
                    ]}>
                    ({t('Remove')})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.colorPickerInput,
                primaryColor && {backgroundColor: primaryColor},
                !errors.primaryColor && {marginBottom: hp(2)},
              ]}
              onPress={() => {
                setShowModal(true);
                setColorType('primary');
              }}></TouchableOpacity>
            {errors.primaryColor && (
              <Text
                style={{
                  color: 'red',
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(1.5),
                }}>
                {errors.primaryColor}
              </Text>
            )}

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={[styles.label, {width: wp(60)}]}>
                {t('Secondary Color')}
              </Text>
              {secondaryColor && (
                <TouchableOpacity onPress={() => setSecondaryColor('')}>
                  <Text
                    style={[
                      styles.label,
                      {width: wp(20), color: Colors.darkTheme.primaryColor},
                    ]}>
                    ({t('Remove')})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.colorPickerInput,
                secondaryColor && {backgroundColor: secondaryColor},
                !errors.primaryColor && {marginBottom: hp(2)},
              ]}
              onPress={() => {
                setShowModal(true);
                setColorType('secondary');
              }}></TouchableOpacity>

            {errors.secondaryColor && (
              <Text
                style={{
                  color: 'red',
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(1.5),
                }}>
                {errors.secondaryColor}
              </Text>
            )}

            {administratorType.value === 'legal_entity' && (
              <View>
                <Text style={styles.label}>
                  {t('Business Address')}
                  <Text style={{color: Colors.error}}> *</Text>
                </Text>
                <TxtInput
                  value={BusinessAddress}
                  containerStyle={styles.inputField}
                  placeholder="Business Address"
                  onChangeText={setBusinessAddress}
                  error={errors.BusinessAddress}
                  style={{marginBottom: hp(2)}}
                  inputStyle={{height: hp(8), textAlignVertical: 'top'}}
                />
              </View>
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: hp(2),
              }}>
              <View>
                <Text style={styles.label}>{t('Business ID')}</Text>

                <Text
                  style={[
                    styles.label,
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
              </View>

              {BusinessDoc?.path && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectImageType('BusinessDoc');
                    SelecterBottomSheetRef.current?.open();
                  }}>
                  <Svgs.editCircled />
                </TouchableOpacity>
              )}
            </View>

            {BusinessDoc?.path ? (
              BusinessDoc?.type === 'image' ? (
                <Image
                  source={{uri: BusinessDoc?.path || formData.imageURL}}
                  style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
                />
              ) : BusinessDoc?.type === 'document' ? (
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => viewSelectedDocument(BusinessDoc?.path)}>
                  <Svgs.pdf />
                  <Text
                    style={[
                      styles.label,
                      {width: '50%', textAlign: 'center', marginTop: hp(1)},
                    ]}>
                    {BusinessDoc?.name}
                  </Text>
                </TouchableOpacity>
              ) : (
                ''
              )
            ) : (
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectImageType('BusinessDoc');
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
          </View>
        </View>
      </ScrollView>
    );
  };

  const openCameraSheet = type => {
    setSelectImageType(type);
    cameraSheetRef.current?.open();
  };
  const AdminDetailsComponent = () => {
    return (
      <ScrollView style={[styles.inputsContainer, {paddingHorizontal: wp(9)}]}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{t('Create Profile')}</Text>
          <Text style={styles.subheading}>
            {t('Add your personal details')}
          </Text>
        </View>

        <View style={{flex: 1, marginTop: hp(3)}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(2),
            }}>
            <View>
              <Text style={styles.label}>
                {t('Profile Image')}
                <Text style={{color: Colors.error}}> *</Text>
              </Text>

              <Text
                style={[
                  styles.label,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor,
                    fontFamily: Fonts.PoppinsRegular,
                    marginBottom: 0,
                  },
                ]}>
                {t('Upload image in PNG/JPG Format')}
              </Text>
            </View>

            {profileImage?.path && (
              <TouchableOpacity onPress={() => openCameraSheet('profile')}>
                <Svgs.editCircled />
              </TouchableOpacity>
            )}
          </View>

          {errors.profileImage && (
            <Text
              style={{
                color: 'red',
                fontFamily: Fonts.PoppinsRegular,
                fontSize: RFPercentage(1.5),
                marginTop: hp(0.5),
              }}>
              {t(errors.profileImage)}
            </Text>
          )}
          {profileImage?.path ? (
            <Image
              source={{uri: profileImage?.path}}
              style={{
                borderRadius: 100,
                height: hp(20),
                width: wp(43),
                alignSelf: 'center',
              }}
            />
          ) : (
            <View
              style={[
                styles.uploadContainer,
                {
                  borderRadius: '100%',
                  height: hp(20),
                  width: wp(43),
                  alignSelf: 'center',
                },
              ]}>
              <TouchableOpacity
                onPress={() => openCameraSheet('profile')}
                style={{
                  padding: wp(1),
                  backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.label}>
            {t('First Name')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <TxtInput
            value={firstName}
            containerStyle={styles.inputField}
            placeholder="First Name"
            onChangeText={setFirstName}
            placeholderTextColor={
              isDarkMode
                ? Colors.darkTheme.QuaternaryText
                : Colors.lightTheme.QuaternaryText
            }
            error={errors.firstName}
            style={{marginBottom: hp(2)}}
            returnKeyType="next"
          />
          <Text style={styles.label}>{t('Middle Name')}</Text>
          <TxtInput
            value={MiddleName}
            containerStyle={styles.inputField}
            placeholder="Middle Name"
            onChangeText={setMiddleName}
            placeholderTextColor={
              isDarkMode
                ? Colors.darkTheme.QuaternaryText
                : Colors.lightTheme.QuaternaryText
            }
            style={{marginBottom: hp(2)}}
            returnKeyType="next"
          />
          <Text style={styles.label}>
            {t('Last Name')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <TxtInput
            value={lastName}
            containerStyle={styles.inputField}
            placeholder="Last Name"
            onChangeText={setlastName}
            placeholderTextColor={
              isDarkMode
                ? Colors.darkTheme.QuaternaryText
                : Colors.lightTheme.QuaternaryText
            }
            error={errors.lastName}
            style={{marginBottom: hp(2)}}
            returnKeyType="next"
          />

          <Text style={styles.label}>
            {t('Phone Number')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <CInputWithCountryCode
            phoneNo={phoneNumber}
            setPhoneNo={setPhoneNumber}
            setCountryCode={setCountryCode}
            countryCode={countryCode}
            placeholder="(555) 123-4567"
            width="100%"
            placeholderTextColor={
              isDarkMode
                ? Colors.darkTheme.QuaternaryText
                : Colors.lightTheme.QuaternaryText
            }
            error={errors.phoneNumber}
            returnKeyType="done"
          />
          <Text style={styles.label}>
            {t('Date of Birth (DOB)')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.inputField,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: wp('4%'),
                borderColor: isDarkMode
                  ? Colors.darkTheme.BorderGrayColor
                  : Colors.lightTheme.BorderGrayColor,
                borderWidth: wp('0.3%'),
                borderRadius: wp(3),
                backgroundColor: isDarkMode
                  ? Colors.darkTheme.input
                  : 'transparent',
                paddingVertical: hp(1.5),
              },
            ]}
            onPress={() => setDatePickerVisibility(true)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.inputText,
                {
                  color: DOB
                    ? isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.primaryTextColor
                    : isDarkMode
                    ? Colors.darkTheme.QuaternaryText
                    : Colors.lightTheme.QuaternaryText,
                  fontSize: RFPercentage(pxToPercentage(14)),
                  fontFamily: Fonts.PoppinsRegular,
                },
              ]}>
              {DOB || 'Select your birth date'}
            </Text>
            <Svgs.calenderL />
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

          <Text style={[styles.label, {marginTop: hp(1)}]}>
            {t('Legal Business')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <CustomDropDown
            data={[
              {label: 'Individual', value: 'individual'},
              {label: 'Legal Entity', value: 'legal_entity'},
            ]}
            selectedValue={administratorType}
            onValueChange={setAdministratorType}
            placeholder="Select legal business"
            width={'100%'}
            astrik={false}
            error={errors.administratorType}
            search={false}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(2),
            }}>
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
                    marginBottom: 0,
                  },
                ]}>
                {t('Upload Document in PDF Format')}
              </Text>
            </View>

            {NationalId?.path && (
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('nationalID');
                  SelecterBottomSheetRef.current?.open();
                }}>
                <Svgs.editCircled />
              </TouchableOpacity>
            )}
          </View>

          {NationalId?.path ? (
            NationalId.type === 'image' ? (
              <Image
                source={{uri: NationalId?.path || formData.imageURL}}
                style={{height: hp(30), width: '100%', borderRadius: wp(2)}}
              />
            ) : NationalId.type === 'document' ? (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => viewSelectedDocument(NationalId.path)}>
                <Svgs.pdf />
                <Text
                  style={[
                    styles.label,
                    {width: '50%', textAlign: 'center', marginTop: hp(1)},
                  ]}>
                  {NationalId.name}
                </Text>
              </TouchableOpacity>
            ) : (
              ''
            )
          ) : (
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                onPress={() => {
                  setSelectImageType('nationalID');
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
        </View>
      </ScrollView>
    );
  };

  const onSelectColor = hex => {
    if (colorType === 'primary') {
      setPrimaryColor(hex);
    } else if (colorType === 'secondary') {
      setSecondaryColor(hex);
    }
    setShowModal(false);
  };

  const renderView = () => {
    switch (index) {
      case 1:
        return AdminDetailsComponent();
      case 2:
        return CompanyDetailsComponent();
      case 3:
        return AddAddressComponent();
      case 4:
        return AccountExecutiveComponent();

      default:
        return CreateInvitaionComponent();
    }
  };

  useBackHandler(() => {
    goBack();
  });
  return (
    <View style={styles.mainContainer}>
      <View
        showsVerticalScrollIndicator={false}
        style={[styles.mainContainer]}
        contentContainerStyle={[{flexGrow: 1}]}>
        {index !== 0 && (
          <View style={styles.backArrowContainer}>
            <MaterialCommunityIcons
              name={'chevron-left'}
              size={RFPercentage(4)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.iconColor
              }
              onPress={goBack}
            />
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, {width: `${progress}%`}]} />
              </View>
              <Text style={styles.stepText}>{`${step}/${totalSteps}`}</Text>
            </View>
          </View>
        )}

        {renderView()}
      </View>

      <View
        style={[
          styles.btnContainer,
          index === 0 && {
            borderTopWidth: 0,
            paddingTop: hp(0),
          },
        ]}>
        <CustomButton
          text={t('Next')}
          onPress={handleContinue}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
          isLoading={loading}
          loaderColor={'#fff'}
          LoaderSize={25}
        />
      </View>

      <CameraBottomSheet refRBSheet={cameraSheetRef} onPick={handleImagePick} />

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
              if (Platform.OS === 'ios') {
                // iOS specific logic
                setTimeout(() => {
                  cameraSheetRef.current?.open();
                }, 300);
              } else {
                cameraSheetRef.current?.open();
              }
            },
          },
        ]}
      />

      <CountryPickerBottomSheet
        refRBSheet={countryPickerBtmSeetRef}
        showSearch={true}
        heading={'Select Country'}
        selectLocation={selectedCountry}
        setSelected={setSelectedCountry}
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
          setDatePickerVisibility(false);

          setDOB(formatted);
        }}
      />
    </View>
  );
};

export default CompanyInvitation;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(1),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: wp(9),
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
      width: wp(7),
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
      width: '80%',
      overflow: 'hidden',
      marginRight: hp(2),
    },
    progressFill: {
      height: 6,
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
    },
    selectedZone: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      backgroundColor: '#579DFF',
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      marginRight: wp(2),
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
    },
    subheading: {
      fontSize: RFPercentage(2.1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      width: wp(79),
    },
    inputsContainer: {
      paddingBottom: hp(5),
      flex: 1,
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
    inputField: {
      borderRadius: wp(3),
    },

    btnContainer: {
      paddingVertical: hp(2),

      // borderTopColor: isDarkMode
      //   ? Colors.darkTheme.BorderGrayColor
      //   : Colors.lightTheme.BorderGrayColor,
      // borderTopWidth: 1,
      // justifyContent: "flex-end",
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(5),
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
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
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start', // ❌ not stretch → keep natural height
      gap: wp(2.5),
    },

    mapBtn: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      alignSelf: 'center',
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
    orContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp(2),
      marginBottom: hp(4),
    },
    orLine: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      height: hp(0.2),
      width: wp(20),
      alignSelf: 'center',
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      marginTop: hp(0.5),
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
      paddingVertical: hp(0.5),
      height: hp(6),
    },
    selectedZonesContainer: {
      marginTop: hp(2),
      marginBottom: hp(2),
    },
    selectedZonesLabel: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      marginBottom: hp(1),
    },
    selectedZonesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
    },
    selectedZoneChip: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.8),
      borderRadius: wp(2),
    },
    selectedZoneText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
    },
    noZonesContainer: {
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    noZonesText: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      fontStyle: 'italic',
    },
    accExecInfoContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
    },
    accExecName: {
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(0.5),
    },
    accExecDetail: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginBottom: hp(0.3),
    },
  });
