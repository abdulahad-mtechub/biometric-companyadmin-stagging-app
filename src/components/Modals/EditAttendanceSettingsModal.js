import {Svgs} from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import StackHeader from '@components/Header/StackHeader';
import NumericStepper from '@components/Stepper/NumericStepper';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {
  useReverseGeocoding,
  getCurrentLocation,
  getAddressFromCoordinates,
} from '@utils/LocationHelpers';
import logger from '@utils/logger';
import {pxToPercentage} from '@utils/responsive';
import moment from 'moment';
import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EditAttendanceSettingsModal = ({
  visible,
  onClose,
  item,
  workerId,
  onPress,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const [errors, setErrors] = useState({
    days: '',
    timeFrom: '',
    timeTo: '',
    grace: '',
    break: '',
    radius: '',
    address: '',
    location: '',
  });
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Defaults when item is not provided
  const defaultLat = item?.workLocation?.latitude ?? 40.7128; // fallback (Karachi)
  const defaultLng = item?.workLocation?.longitude ?? -74.006;

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: defaultLat,
    longitude: defaultLng,
    address: item?.workLocation?.locationName ?? '',
  });
  const [shouldDisplayListView, setShouldDisplayListView] = useState(false);

  const [address, setAddress] = useState(
    item?.workLocation?.locationName ?? '',
  );

  const [TimeFrom, setTimeFrom] = useState(() => {
    // item.schedule.startTime might be "06:34:00"
    if (item?.schedule?.startTime) {
      return moment(item.schedule.startTime, 'HH:mm:ss').format('HH:mm');
    }
    return '';
  });

  const [TimeTo, setTimeTo] = useState(() => {
    if (item?.schedule?.endTime) {
      return moment(item.schedule.endTime, 'HH:mm:ss').format('HH:mm');
    }
    return '';
  });

  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [TimePickerType, setTimePickerType] = useState(null);
  const [graceTimeValue, setGraceTimeValue] = useState(
    item?.schedule?.graceMinutes ?? 0,
  );
  const [breakTimeValue, setBreakTimeValue] = useState(
    item?.schedule?.breakPolicy?.unpaid ?? 0,
  );
  const [RadiusValue, setRadiusValue] = useState(
    item?.workLocation?.radiusMeters ?? 0,
  );

  // Region state for Google Maps
  const [region, setRegion] = useState({
    latitude: defaultLat,
    longitude: defaultLng,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [selectedDays, setSelectedDays] = useState(
    item?.schedule?.workingDays ?? [],
  );

  useEffect(() => {
    if (item) {
      setAddress(item?.workLocation?.locationName ?? '');
      setSelectedLocation({
        latitude: item?.workLocation?.latitude ?? defaultLat,
        longitude: item?.workLocation?.longitude ?? defaultLng,
        address: item?.workLocation?.locationName ?? '',
      });
      setRegion({
        latitude: item?.workLocation?.latitude ?? defaultLat,
        longitude: item?.workLocation?.longitude ?? defaultLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
      setTimeFromFromItem(item);
      setTimeToFromItem(item);
      setGraceTimeValue(item?.schedule?.graceMinutes ?? 0);
      setBreakTimeValue(item?.schedule?.breakPolicy?.unpaid ?? 0);
      setRadiusValue(item?.workLocation?.radiusMeters ?? 0);
      setSelectedDays(item?.schedule?.workingDays ?? []);
    } else {
      // Add mode - reset to defaults
      setAddress('');
      setSelectedLocation({
        latitude: defaultLat,
        longitude: defaultLng,
        address: '',
      });
      setRegion({
        latitude: defaultLat,
        longitude: defaultLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
      setTimeFrom('');
      setTimeTo('');
      setGraceTimeValue(0);
      setBreakTimeValue(0);
      setRadiusValue(0);
      setSelectedDays([]);
    }
  }, [item, visible]);

  function setTimeFromFromItem(itemObj) {
    if (itemObj?.schedule?.startTime) {
      setTimeFrom(
        moment(itemObj.schedule.startTime, 'HH:mm:ss').format('HH:mm'),
      );
    } else {
      setTimeFrom('');
    }
  }
  function setTimeToFromItem(itemObj) {
    if (itemObj?.schedule?.endTime) {
      setTimeTo(moment(itemObj.schedule.endTime, 'HH:mm:ss').format('HH:mm'));
    } else {
      setTimeTo('');
    }
  }

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  // // Reverse geocoding when location changes
  // useEffect(() => {
  //   if (selectedLocation.latitude && selectedLocation.longitude) {
  //     getAddressFromLatLng(selectedLocation.latitude, selectedLocation.longitude)
  //       .then(result => {
  //         if (result?.address) {
  //           setAddress(result.address);
  //         }
  //       })
  //       .catch(err => {
  //         logger.warn('Failed to get address:', err, {context: 'EditAttendanceSettingsModal'});
  //       });
  //   }
  // }, [selectedLocation.latitude, selectedLocation.longitude, getAddressFromLatLng]);

  const validateFields = () => {
    let tempErrors = {
      days: '',
      timeFrom: '',
      timeTo: '',
      grace: '',
      break: '',
      radius: '',
      address: '',
      location: '',
    };

    // Working days
    if (selectedDays.length === 0) {
      tempErrors.days = 'Please select at least one working day.';
    }

    // Start time
    if (!TimeFrom) {
      tempErrors.timeFrom = 'Start time is required.';
    }

    // End time
    if (!TimeTo) {
      tempErrors.timeTo = 'End time is required.';
    }

    // Validate end > start
    if (TimeFrom && TimeTo) {
      const start = moment(TimeFrom, 'HH:mm');
      const end = moment(TimeTo, 'HH:mm');

      if (!end.isAfter(start)) {
        tempErrors.timeTo = 'End time must be after start time.';
      }
    }

    // Grace time
    if (graceTimeValue === '' || graceTimeValue == 0) {
      tempErrors.grace = 'Grace time is required.';
    }

    // Break time
    if (breakTimeValue === '' || breakTimeValue == 0) {
      tempErrors.break = 'Break time is required.';
    }

    // Radius
    if (RadiusValue === '' || RadiusValue == 0) {
      tempErrors.radius = 'Radius must be greater than 0.';
    }

    // Address
    if (!address || address.trim().length === 0) {
      tempErrors.address = 'Address is required.';
    }

    // // Lat / Lng
    // }

    setErrors(tempErrors);

    // Return true only if no errors
    return Object.values(tempErrors).every(err => err === '');
  };

  const handleSave = async () => {
    // validation: ensure workerId exists
    const isValid = validateFields();
    if (!isValid) {
      return;
    }
    try {
      setIsLoading(true);

      const payload = {
        schedule: {
          days: selectedDays,
          start: TimeFrom,
          end: TimeTo,
          breakPolicy: {unpaid: breakTimeValue},
          graceMinutes: graceTimeValue,
        },
        location: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
          radiusMeters: RadiusValue,
          locationName: address,
        },
      };
      const url = `${baseUrl}/company-admins/workers/${workerId}/attendance-settings`;

      const {ok, data} = await fetchApis(
        url,
        'POST',
        setIsLoading,
        payload,
        showAlert,
        {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      );

      ApiResponse(showAlert, data, language);
      if (ok && !data?.error) {
        // close modal on success
        onClose?.();
        onPress?.();
      } else {
        if (data?.message) {
          showAlert(data.message, 'error');
        }
      }
    } catch (error) {
      logger.error('handleSave error:', error, {
        context: 'EditAttendanceSettingsModal',
      });
      showAlert('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const {address} = await getAddressFromCoordinates(latitude, longitude);
      setAddress(address);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
        setSelectedLocation({
        latitude,
        longitude,
        address: '',
      });
    } catch (err) {
      logger.warn('Failed to get current location:', err, {
        context: 'EditAttendanceSettingsModal',
      });
    }
  }, []);

  // Handle Google Places autocomplete selection
  const handlePlaceSelect = useCallback(async (_, details) => {
    if (!details?.geometry?.location) return;

    const {lat, lng} = details.geometry.location;
    const address = details.formatted_address;

    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      address: address || '',
    });

    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });

    setAddress(address || '');
  }, []);

  // Handle map press to select location
  const handleMapPress = useCallback(async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;

    try {
      const {address} = await getAddressFromCoordinates(latitude, longitude);

      setSelectedLocation({
        latitude,
        longitude,
        address: address || '',
      });

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      setAddress(address || '');
    } catch (err) {
      logger.warn('Failed to get address from coordinates:', err, {
        context: 'EditAttendanceSettingsModal',
      });
    }
  }, []);

  useEffect(() => {
    if (item?.schedule === null) {
      getCurrentPosition();
    }
  }, [item]);

  return (
    <Modal
      visible={!!visible}
      animationType="none"
      onRequestClose={() => onClose?.()}
      presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <StackHeader
            title={t(
              item ? 'Edit Attendance Settings' : 'Add Attendance Settings',
            )}
            headerTxtStyle={styles.headerTxtStyle}
            onBackPress={() => onClose?.()}
            headerStyle={styles.headerStyle}
            headerView={{paddingHorizontal: wp(2)}}
          />

          <ScrollView style={styles.container}>
            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>
                {t('Select Working Days')}
              </Text>
              <View style={styles.rowView}>
                {WEEK_DAYS.map((day, index) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={index.toString()}
                      style={[
                        styles.weekDaysContainer,
                        isSelected && styles.selectedDayContainer, // add selected style
                      ]}
                      onPress={() => toggleDay(day)}>
                      <Text
                        style={[
                          styles.weekDaysText,
                          isSelected && styles.selectedDayText, // add selected text style
                        ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.days ? (
                <Text
                  style={{
                    color: 'red',
                    marginTop: 5,
                    fontFamily: Fonts.PoppinsRegular,
                    fontSize: RFPercentage(1.5),
                  }}>
                  {t(errors.days)}
                </Text>
              ) : null}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>
                {t('Select Shift Timings')}
              </Text>
              <View style={styles.TimeRow}>
                <View style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.TimeInput}
                    onPress={() => {
                      setTimePickerType('start');
                      setIsTimePickerVisible(true);
                    }}>
                    <Text
                      style={[
                        styles.TimeText,
                        TimeFrom && {color: Colors.lightTheme.primaryTextColor},
                      ]}>
                      {TimeFrom || t('Time From')}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-edit-outline"
                      size={RFPercentage(2.5)}
                      color={Colors.darkTheme.primaryColor}
                    />
                  </TouchableOpacity>
                  {errors.timeFrom ? (
                    <Text
                      style={{
                        color: 'red',
                        marginTop: 5,
                        fontFamily: Fonts.PoppinsRegular,
                        fontSize: RFPercentage(1.5),
                      }}>
                      {t(errors.timeFrom)}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.dashText}>–</Text>

                <View style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.TimeInput}
                    onPress={() => {
                      setTimePickerType('end');
                      setIsTimePickerVisible(true);
                    }}>
                    <Text
                      style={[
                        styles.TimeText,
                        TimeTo && {color: Colors.lightTheme.primaryTextColor},
                      ]}>
                      {TimeTo || t('Time To')}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-edit-outline"
                      size={RFPercentage(2.5)}
                      color={Colors.darkTheme.primaryColor}
                    />
                  </TouchableOpacity>
                  {errors.timeTo ? (
                    <Text
                      style={{
                        color: 'red',
                        marginTop: 5,
                        fontFamily: Fonts.PoppinsRegular,
                        fontSize: RFPercentage(1.5),
                      }}>
                      {t(errors.timeTo)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>
                {t('Grace Time (Minutes)')}
              </Text>
              <NumericStepper
                value={graceTimeValue}
                setValue={setGraceTimeValue}
                min={0}
                max={1000}
              />
              {errors.grace ? (
                <Text
                  style={{
                    color: 'red',
                    marginTop: 5,
                    fontFamily: Fonts.PoppinsRegular,
                    fontSize: RFPercentage(1.5),
                  }}>
                  {t(errors.grace)}
                </Text>
              ) : null}
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>
                {t('Break Time (Minutes)')}
              </Text>
              <NumericStepper
                value={breakTimeValue}
                setValue={setBreakTimeValue}
                min={0}
                max={1000}
              />
              {errors.break ? (
                <Text
                  style={{
                    color: 'red',
                    marginTop: 5,
                    fontFamily: Fonts.PoppinsRegular,
                    fontSize: RFPercentage(1.5),
                  }}>
                  {t(errors.break)}
                </Text>
              ) : null}
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>{t('Radius (Meters)')}</Text>
              <NumericStepper
                value={RadiusValue}
                setValue={setRadiusValue}
                min={0}
                max={1000}
              />
              {errors.radius ? (
                <Text
                  style={{
                    color: 'red',
                    marginTop: 5,
                    fontFamily: Fonts.PoppinsRegular,
                    fontSize: RFPercentage(1.5),
                  }}>
                  {t(errors.radius)}
                </Text>
              ) : null}
            </View>

            <View style={{flex: 1}}>
              <Text style={[styles.Sectiontitle, {marginLeft: wp(2)}]}>
                {t('Map View')}
              </Text>

              <View style={{flex: 1, minHeight: hp(40)}}>
                <GooglePlacesAutocomplete
                  placeholder={t('Search Location')}
                  minLength={2}
                  fetchDetails={true}
                  onPress={handlePlaceSelect}
                  listViewDisplayed={shouldDisplayListView}
                  textInputProps={{
                    onFocus: () => setShouldDisplayListView(true),
                    onBlur: () => setShouldDisplayListView(false),
                  }}
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
                      width: '95%',
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
                  provider={PROVIDER_DEFAULT}
                  style={styles.map}
                  region={region}
                  onPress={handleMapPress}
                  onPoiClick={handleMapPress}>
                  {selectedLocation?.latitude && (
                    <Marker
                      coordinate={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                      }}
                      title={selectedLocation.address || 'Selected Location'}
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
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.Sectiontitle}>{t('Address')}</Text>
              <TxtInput
                value={address}
                setValue={value => setAddress(value)}
                leftSvg={<Svgs.MapIcon />}
                multiline={true}
                editable={false}
                error={errors.address}
              />
            </View>
          </ScrollView>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onClose={() => setIsTimePickerVisible(false)}
            onConfirm={time => {
              const formatted = moment(time).format('HH:mm');
              if (TimePickerType === 'start') {
                setTimeFrom(formatted);
              } else if (TimePickerType === 'end') {
                setTimeTo(formatted);
              }
              setIsTimePickerVisible(false);
            }}
          />

          <View style={[styles.btnContainer]}>
            <CustomButton
              text={'Save'}
              onPress={handleSave}
              textStyle={styles.continueButtonText}
              containerStyle={[styles.continueButton]}
              loading={isLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default EditAttendanceSettingsModal;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    Sectiontitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
    mapImage: {
      width: '100%',
      overflow: 'hidden',
    },
    map: {
      flex: 1,
      width: '100%',
      height: hp(40),
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    sectionContainer: {
      paddingHorizontal: wp(2),
      marginVertical: hp(1),
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    weekDaysContainer: {
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: '100%',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      marginRight: wp(2),
      width: wp(12),
      height: wp(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedDayContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    weekDaysText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
    },
    selectedDayText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
    },
    TimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
    },
    TimeInput: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: hp(5.5),
      paddingHorizontal: wp(4),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    TimeText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    dashText: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: wp(4),
      paddingHorizontal: wp(3),
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
      elevation: 2,
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
