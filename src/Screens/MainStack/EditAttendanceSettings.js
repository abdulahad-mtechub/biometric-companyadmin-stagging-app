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
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const to24HourTime = value => {
  if (!value) return '';

  const parsed = moment(value, ['h:mm a', 'h:mm A', 'HH:mm', 'HH:mm:ss'], true);
  if (parsed.isValid()) {
    return parsed.format('HH:mm');
  }

  return moment(value).format('HH:mm');
};

const EditAttendanceSettings = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language} = useSelector(store => store.auth);
  const {item} = route.params;
  const {showAlert} = useAlert();
  console.log(item)

  // Use reverse geocoding hook
  const {getAddressFromLatLng} = useReverseGeocoding();

  const [address, setAddress] = useState(item?.workLocation?.locationName || '');

  // Initialize region from item data or default
  const initialRegion = {
    latitude: item?.workLocation?.latitude || 37.78825,
    longitude: item?.workLocation?.longitude || -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };
  const [shouldDisplayListView, setShouldDisplayListView] = useState(false);

  const [region, setRegion] = useState(initialRegion);

  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: item?.workLocation?.latitude,
    longitude: item?.workLocation?.longitude,
    address: item?.workLocation?.locationName,
  });
  const [TimeFrom, setTimeFrom] = useState(
    moment(item.schedule?.startTime, 'HH:mm:ss').format('h:mm a'),
  );
  console.log(TimeFrom)
  const [TimeTo, setTimeTo] = useState(
    moment(item.schedule?.endTime, 'HH:mm:ss').format('h:mm a'),
  );
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [TimePickerType, setTimePickerType] = useState(null);
  const [graceTimeValue, setGraceTimeValue] = useState(
    item?.schedule?.graceMinutes,
  );
  const [breakTimeValue, setBreakTimeValue] = useState(
    item?.schedule?.breakPolicy?.unpaid,
  );
  const [RadiusValue, setRadiusValue] = useState(
    item?.workLocation?.radiusMeters,
  );

  const [selectedDays, setSelectedDays] = useState(
    item?.schedule?.workingDays || [],
  );

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const getGetAddressFromLatAndLong = useCallback(async () => {
    if (!selectedLocation.latitude || !selectedLocation.longitude) return;

    try {
    
          const {address} = await getAddressFromCoordinates(
        selectedLocation.latitude,
        selectedLocation.longitude,
      );

    
      if (address) {
        setAddress(address);
      } else {
        setAddress('');
      }
    } catch (err) {
      setAddress('');
      logger.warn('Failed to get address:', err, {context: 'EditAttendanceSettings'});
    }
  }, [selectedLocation]);

  // useEffect(() => {
  //   getGetAddressFromLatAndLong();
  // }, [selectedLocation, getGetAddressFromLatAndLong]);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const payload = {
        schedule: {
          days: selectedDays,
          start: to24HourTime(TimeFrom),
          end: to24HourTime(TimeTo),
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

      console.log(payload)
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/workers/${item.id}/attendance-settings`,
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
      logger.error('handleSave error:', error, { context:'EditAttendanceSettings' });
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
      const {address} = await getAddressFromCoordinates(
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
        context: 'EditAttendanceSettings',
      });
    }
  }, []);


  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Edit Attendance Settings')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        headerView={{paddingHorizontal: wp(2)}}
      />

      <ScrollView style={styles.container}>
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
            {t('Map')}
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
          const formatted = moment(time).format('h:mm a');
          logger.log(formatted, { context:'EditAttendanceSettings' });
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

export default EditAttendanceSettings;

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
      map: {
      flex: 1,
      width: '100%',
      height: hp(40),
    },
  });
