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
import {useCallback, useEffect, useRef, useState} from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AddAttendanceSettings = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language} = useSelector(store => store.auth);
  const workers = useSelector(store => store.states.workers);
  const {showAlert} = useAlert();
  const [address, setAddress] = useState('');
  const {workerId} = route.params || {};

  const [shouldDisplayListView, setShouldDisplayListView] = useState(false);

  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    address: '',
  });
  const [TimeFrom, setTimeFrom] = useState('');
  const [TimeTo, setTimeTo] = useState('');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [TimePickerType, setTimePickerType] = useState(null);
  const [graceTimeValue, setGraceTimeValue] = useState(0);
  const [breakTimeValue, setBreakTimeValue] = useState(0);
  const [RadiusValue, setRadiusValue] = useState(100);

  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const mapRef = useRef(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(
    workerId
      ? {label: workers.find(w => w.id === workerId)?.name, value: workerId}
      : null,
  );

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!selectedWorker) {
        showAlert('Please select a worker.', 'error');
        return;
      }

      if (selectedDays.length === 0) {
        showAlert('Please select at least one working day.', 'error');
        return;
      }

      if (!TimeFrom || !TimeTo) {
        showAlert('Please set shift timings.', 'error');
        return;
      }

      if (!selectedLocation.latitude || !selectedLocation.longitude) {
        showAlert('Please select a location on the map.', 'error');
        return;
      }

      setIsLoading(true);

      const payload = {
        worker_id: selectedWorker.value,
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
        `${baseUrl}/company-admins/workers/${selectedWorker.value}/attendance-settings`,
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
        context: 'AddAttendanceSettings',
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

      // The useEffect will handle reverse geocoding to get address
    } catch (err) {
      logger.warn('Failed to get current location:', err, {
        context: 'Add Attendance Settings',
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
      const {addressComponent, address} = await getAddressFromCoordinates(
        latitude,
        longitude,
      );

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
        context: 'AddAttendanceSettings',
      });
    }
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, []);
  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Add Attendance Settings')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        headerView={{paddingHorizontal: wp(2)}}
      />

      <ScrollView style={styles.container}>
        <View style={styles.sectionContainer}>
          <Text style={styles.Sectiontitle}>{t('Select Employee')}</Text>
          <CustomDropDown
            data={workers}
            selectedValue={selectedWorker}
            onValueChange={value => {
              setSelectedWorker(value);
            }}
            placeholder={t('Select Employee')}
            search={true}
            disable={workerId ? true : false}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.Sectiontitle}>{t('Select Working Days')}</Text>
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
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.Sectiontitle}>{t('Select Shift Timings')}</Text>
          <View style={styles.TimeRow}>
            <TouchableOpacity
              style={styles.TimeInput}
              onPress={() => {
                setTimePickerType('start');
                setIsTimePickerVisible(true);
              }}>
              <Text
                style={[
                  styles.TimeText,
                  TimeFrom && {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.primaryTextColor,
                  },
                ]}>
                {TimeFrom || t('Time From')}
              </Text>
              <MaterialCommunityIcons
                name="clock-edit-outline"
                size={RFPercentage(2.5)}
                color={
                  TimeTo
                    ? Colors.darkTheme.primaryColor
                    : isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor
                }
              />
            </TouchableOpacity>

            <Text style={styles.dashText}>–</Text>

            <TouchableOpacity
              style={styles.TimeInput}
              onPress={() => {
                setTimePickerType('end');
                setIsTimePickerVisible(true);
              }}>
              <Text
                style={[
                  styles.TimeText,
                  TimeTo && {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.primaryTextColor,
                  },
                ]}>
                {TimeTo || t('Time To')}
              </Text>
              <MaterialCommunityIcons
                name="clock-edit-outline"
                size={RFPercentage(2.5)}
                color={
                  TimeTo
                    ? Colors.darkTheme.primaryColor
                    : isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor
                }
              />
            </TouchableOpacity>
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
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.Sectiontitle}>{t('Break Time (Minutes)')}</Text>
          <NumericStepper
            value={breakTimeValue}
            setValue={setBreakTimeValue}
            min={0}
            max={1000}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.Sectiontitle}>{t('Radius (Meters)')}</Text>
          <NumericStepper
            value={RadiusValue}
            setValue={setRadiusValue}
            min={0}
            max={1000}
          />
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
              query={{key: GOOGLE_MAP_API_KEY, language: 'en'}}
              listViewDisplayed={shouldDisplayListView}
              textInputProps={{
                onFocus: () => setShouldDisplayListView(true),
                onBlur: () => setShouldDisplayListView(false),
              }}
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
    </View>
  );
};

export default AddAttendanceSettings;

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
