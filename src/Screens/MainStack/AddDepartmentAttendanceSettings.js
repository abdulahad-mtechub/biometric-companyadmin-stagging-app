import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
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
  extractAddressData,
  getAddressFromCoordinates,
  getCurrentLocation,
} from '@utils/LocationHelpers';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AddDepartmentAttendanceSettings = ({navigation, route}) => {
  const {DepId, settings} = route.params; // <-- NEW PARAM FOR CREATE
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const [shouldDisplayListView, setShouldDisplayListView] = useState(false);

  // ---------------------------
  // DEFAULT STATE FOR ADD OR PRE-FILL FROM SETTINGS
  // ---------------------------

  // Initialize location from settings or default
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (settings?.location) {
      return {
        latitude: settings.location.lat || 24.8607,
        longitude: settings.location.lng || 67.0011,
        address: settings.location.locationName || '',
      };
    }
    return {
      latitude: 24.8607,
      longitude: 67.0011,
      address: '',
    };
  });

  const [address, setAddress] = useState(() => {
    return settings?.location?.locationName || '';
  });

  const [TimeFrom, setTimeFrom] = useState(() => {
    if (settings?.schedule?.start) {
      // Convert "09:00:00" to "09:00"
      return settings.schedule.start.substring(0, 5);
    }
    return '';
  });

  const [TimeTo, setTimeTo] = useState(() => {
    if (settings?.schedule?.end) {
      // Convert "17:00:00" to "17:00"
      return settings.schedule.end.substring(0, 5);
    }
    return '';
  });

  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [TimePickerType, setTimePickerType] = useState(null);

  const [graceTimeValue, setGraceTimeValue] = useState(() => {
    return settings?.schedule?.graceMinutes || 0;
  });

  const [breakTimeValue, setBreakTimeValue] = useState(() => {
    return settings?.schedule?.breakPolicy?.unpaid || 0;
  });

  const [RadiusValue, setRadiusValue] = useState(() => {
    return settings?.location?.radiusMeters || 100;
  });

  const [region, setRegion] = useState({
    latitude: settings?.location?.lat || 24.8607,
    longitude: settings?.location?.lng || 67.0011,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [selectedDays, setSelectedDays] = useState(() => {
    return settings?.schedule?.days || [];
  });

  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  // Get current position handler
  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const {address} = await getAddressFromCoordinates(latitude, longitude);
      setSelectedLocation({
        latitude,
        longitude,
        address: '',
      });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
      setAddress(address);
    } catch (err) {
      logger.warn('Failed to get current location:', err, {
        context: 'AddDepartmentAttendanceSettings',
      });
    }
  }, []);

  // Handle Google Places autocomplete selection
  const handlePlaceSelect = useCallback(async (data, details) => {
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
        context: 'AddDepartmentAttendanceSettings',
      });
    }
  }, []);

  useEffect(() => {
    if (settings?.location) return;
    getCurrentPosition();
  }, []);

  // ---------------------------
  // Save Handler (CREATE)
  // ---------------------------

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

      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/departments/${DepId}/attendance-settings`,
        'POST',
        setIsLoading,
        payload,
        showAlert,
        {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      );

      ApiResponse(showAlert, data, language);
      if (ok && !data?.error) {
        navigation.goBack();
      } else {
      }
    } catch (error) {
      logger.error('handleSave error:', error, {
        context: 'AddDepartmentAttendanceSettings',
      });
      showAlert('Unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------

  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <StackHeader
        title={
          settings?.hasSettings
            ? t('Update Attendance Settings')
            : t('Add Attendance Settings')
        }
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        headerView={{paddingHorizontal: wp(2)}}
      />

      <ScrollView
        style={styles.container}
        scrollEnabled={scrollEnabled}
        onStartShouldSetResponder={() => {
          setScrollEnabled(true);
          return true;
        }}>
        <View
          onStartShouldSetResponder={() => {
            setScrollEnabled(true);
            return true;
          }}>
          <View style={styles.sectionContainer}>
            <Text style={styles.Sectiontitle}>{t('Select Working Days')}</Text>
            <View style={styles.rowView}>
              {WEEK_DAYS.map((day, index) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.weekDaysContainer,
                      isSelected && styles.selectedDayContainer,
                    ]}
                    onPress={() => toggleDay(day)}>
                    <Text
                      style={[
                        styles.weekDaysText,
                        isSelected && styles.selectedDayText,
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
            <Text style={styles.Sectiontitle}>{t('Select Shift Timings')}</Text>
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
            <Text style={styles.Sectiontitle}>{t('Grace Time (Minutes)')}</Text>
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
            <Text style={styles.Sectiontitle}>{t('Break Time (Minutes)')}</Text>
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
        </View>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onClose={() => setIsTimePickerVisible(false)}
          onConfirm={time => {
            const formatted = moment(time).format('HH:mm');
            if (TimePickerType === 'start') setTimeFrom(formatted);
            if (TimePickerType === 'end') setTimeTo(formatted);
            setIsTimePickerVisible(false);
          }}
        />
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

        <View
          style={styles.sectionContainer}
          onStartShouldSetResponder={() => {
            setScrollEnabled(true);
            return true;
          }}>
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

      <View style={styles.btnContainer}>
        <CustomButton
          text={settings?.hasSettings ? t('Update') : t('Save')}
          onPress={handleSave}
          loading={isLoading}
          textStyle={styles.continueButtonText}
          containerStyle={styles.continueButton}
        />
      </View>
    </View>
  );
};

export default AddDepartmentAttendanceSettings;

// (STYLES REMAIN SAME AS YOU PROVIDED)

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
      height: hp(40),
      borderRadius: wp(2),
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
