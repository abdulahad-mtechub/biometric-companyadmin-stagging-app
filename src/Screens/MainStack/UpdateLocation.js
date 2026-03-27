import React, {useCallback, useEffect, useState} from 'react';
import {GetCity, GetCountries, GetState} from 'react-country-state-city';
import {useTranslation} from 'react-i18next';
import {
  Alert,
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
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import StackHeader from '@components/Header/StackHeader';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {updateLocation} from '@redux/Slices/updateLocationSlice';
import {pxToPercentage} from '@utils/responsive';
import {Svgs} from '@assets/Svgs/Svgs';
import logger from '@utils/logger';
import {
  getAddressFromCoordinates,
  getCurrentLocation,
  useReverseGeocoding,
} from '@utils/LocationHelpers';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UpdateLocation = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {state, country, city, postalCode, address, latitude, longitude} =
    useSelector(store => store.updateLocation);
  const styles = dynamicStyles(isDarkMode, Colors);
  const [shouldDisplayListView, setShouldDisplayListView] = useState(false);
  const {t} = useTranslation();

  const [mapRegion, setMapRegion] = useState({
    latitude: latitude || 33.6520751,
    longitude: longitude || 73.0816881,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [selectedLocation, setSelectedLocation] = useState({
    latitude: latitude || 33.6520751,
    longitude: longitude || 73.0816881,
  });

  const dispatch = useDispatch();

  // Get current position handler
  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const {addressComponent, address} = await getAddressFromCoordinates(
        latitude,
        longitude,
      );
      const locationHierarchy =
        extractLocationHierarchyFromGoogle(addressComponent);

      setSelectedLocation({latitude, longitude});
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      updateAddressDetail('address', address);
      updateAddressDetail('city', {label: locationHierarchy.city || ''});
      updateAddressDetail('state', {label: locationHierarchy.state || ''});
      updateAddressDetail('postalCode', locationHierarchy.postalCode || '');
      updateAddressDetail('latitude', latitude);
      updateAddressDetail('longitude', longitude);
      updateAddressDetail('country', {label: locationHierarchy.country || ''});
    } catch (err) {
      logger.warn('Failed to get current location', err, {
        context: 'UpdateLocation.getCurrentPosition',
      });
    }
  }, []);

  // Handle Google Places autocomplete selection
  const handlePlaceSelect = useCallback(async (data, details) => {
    if (!details?.geometry?.location) return;

    const {lat, lng} = details.geometry.location;
    const address = details.formatted_address;
    const locationHierarchy = extractLocationHierarchyFromGoogle(
      details.address_components,
    );

    setSelectedLocation({latitude: lat, longitude: lng});
    setMapRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    });

    updateAddressDetail('address', address || '');
    updateAddressDetail('city', {label: locationHierarchy.city || ''});
    updateAddressDetail('state', {label: locationHierarchy.state || ''});
    updateAddressDetail('postalCode', locationHierarchy.postalCode || '');
    updateAddressDetail('latitude', lat);
    updateAddressDetail('longitude', lng);
    updateAddressDetail('country', {label: locationHierarchy.country || ''});
  }, []);

  // Handle map press to select location
  const handleMapPressGoogle = useCallback(async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;

    try {
      const {addressComponent, address} = await getAddressFromCoordinates(
        latitude,
        longitude,
      );
      const locationHierarchy =
        extractLocationHierarchyFromGoogle(addressComponent);

      setSelectedLocation({latitude, longitude});
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      updateAddressDetail('address', address);
      updateAddressDetail('city', {label: locationHierarchy.city || ''});
      updateAddressDetail('state', {label: locationHierarchy.state || ''});
      updateAddressDetail('postalCode', locationHierarchy.postalCode || '');
      updateAddressDetail('latitude', latitude);
      updateAddressDetail('longitude', longitude);
      updateAddressDetail('country', {label: locationHierarchy.country || ''});
    } catch (err) {
      logger.warn('Failed to get address from coordinates:', err, {
        context: 'UpdateLocation',
      });
    }
  }, []);

  // Helper function to extract location hierarchy from Google address components
  const extractLocationHierarchyFromGoogle = (components = []) => {
    const getComponent = (types, key) => {
      const component = components.find(c =>
        types.every(t => c.types.includes(t)),
      );
      return component?.[key] || '';
    };

    return {
      country: getComponent(['country'], 'long_name') || '',
      state:
        getComponent(['administrative_area_level_1'], 'long_name') ||
        getComponent(['administrative_area_level_2'], 'long_name') ||
        '',
      city:
        getComponent(['locality'], 'long_name') ||
        getComponent(['administrative_area_level_2'], 'long_name') ||
        '',
      postalCode: getComponent(['postal_code'], 'long_name') || '',
      street: getComponent(['route'], 'long_name') || '',
      houseNumber: getComponent(['street_number'], 'long_name') || '',
    };
  };

  const [dataArrays, setDataArrays] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [addressDetails, setAddressDetails] = useState({
    address: address || '',
    city: {label: city || ''},
    state: {label: state || ''},
    postalCode: postalCode || '',
    latitude: latitude || '',
    longitude: longitude || '',
    country: {label: country || ''},
    isManualAddress: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const _countries = await GetCountries();
        setDataArrays(prev => ({...prev, countries: _countries}));
      } catch (error) {
        logger.warn('Failed to fetch countries:', error, {
          context: 'UpdateLocation',
        });
      }
    })();
  }, []);

  console.log(addressDetails)
  useEffect(() => {
    if (!addressDetails?.country?.value) return;
    (async () => {
      try {
        const result = await GetState(Number(addressDetails.country.value));
        setDataArrays(prev => ({...prev, states: result}));
      } catch (error) {
        logger.warn('Failed to fetch states:', error, {
          context: 'UpdateLocation',
        });
      }
    })();
  }, [addressDetails?.country?.value]);

  useEffect(() => {
    // if (!addressDetails?.country?.value || !addressDetails?.state?.value)
    //   return;
    // (async () => {
    //   try {
    //     const result = await GetCity(
    //       Number(addressDetails.country.value),
    //       Number(addressDetails.state.value),
    //     );
    //     setDataArrays(prev => ({...prev, cities: result}));
    //   } catch (error) {
    //     logger.warn('Failed to fetch cities:', error, {
    //       context: 'UpdateLocation',
    //     });
    //   }
    // })();
  }, [addressDetails?.country?.value, addressDetails?.state?.value]);

  const countriesDropDownData =
    dataArrays.countries?.map(item => ({
      label: item.name,
      value: item.id,
    })) || [];

  const statesDropDownData =
    dataArrays.states?.map(item => ({
      label: item.name,
      value: item.id,
    })) || [];

  const citiesDropDownData =
    dataArrays.cities?.map(item => ({
      label: item.name,
      value: item.id,
    })) || [];

  const updateAddressDetail = useCallback((field, value) => {
    setAddressDetails(prev => ({...prev, [field]: value}));
  }, []);

  const handleSave = () => {
    const latitude = parseFloat(addressDetails.latitude);
    const longitude = parseFloat(addressDetails.longitude);

    // if (isNaN(latitude) || isNaN(longitude)) {
    //   return;
    // }

    if (!addressDetails.address) {
      Alert.alert('Error', 'Please provide an address');
      return;
    }

    logger.log('Saving address details:', addressDetails, {
      context: 'UpdateLocation',
    });

    // Prepare all location data for dispatch
    const locationData = {
      address: addressDetails.address,
      city: addressDetails.city?.label || '',
      state: addressDetails.state?.label || '',
      country: addressDetails.country?.label || '',
      postalCode: addressDetails.postalCode || '',
      latitude: latitude,
      longitude: longitude,
      // Include any additional fields from OSM response
      street: addressDetails.street || '',
      suburb: addressDetails.suburb || '',
      municipality: addressDetails.municipality || '',
    };

    dispatch(updateLocation(locationData));

    // Navigate back and pass the data if needed
    // navigation.navigate('EditProfile', {
    //   locationData: locationData,
    // });

    navigation.goBack();
  };

  const toggleAddressMode = () => {
    setAddressDetails(prev => ({
      ...prev,
      isManualAddress: !prev.isManualAddress,
    }));
  };

  const renderMap = () => (
    <View style={{flex: 1}}>
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
        region={mapRegion}
        onPress={handleMapPressGoogle}
        onPoiClick={handleMapPressGoogle}>
        {selectedLocation?.latitude && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={address || 'Selected Location'}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 100,
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

  return (
    <View style={styles.container}>
      <StackHeader
        title={'Update Location'}
        headerTxtStyle={styles.headerTxtStyle}
        headerStyle={styles.headerStyle}
        onBackPress={() => navigation.goBack()}
      />

      <View
        style={[
          {
            marginHorizontal: wp(6),
            marginBottom: 0,
            marginTop: hp(2),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}>
        <Text style={styles.label}>{t('Manual Address')}</Text>
        <TouchableOpacity
          onPress={() => {
            if (!addressDetails.isManualAddress) {
              setAddressDetails(prev => ({
                ...prev,
                address: '',
                city: {label: ''},
                state: {label: ''},
                postalCode: '',
                latitude: '',
                longitude: '',
                country: {label: ''},
                isManualAddress: true,
              }));
            } else {
              setAddressDetails(prev => ({
                ...prev,
                isManualAddress: false,
              }));
            }
          }}>
          {addressDetails.isManualAddress ? (
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

      {addressDetails.isManualAddress ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.ScrollViewContainer}>
          <View style={styles.section}>
            <CustomDropDown
              data={countriesDropDownData}
              selectedValue={addressDetails.country}
              onValueChange={country => updateAddressDetail('country', country)}
              placeholder="Country"
              width={'100%'}
              dropdownContainerStyle={{height: hp(6.5)}}
              placeholderStyle={styles.label}
            />
            {addressDetails.country?.value && (
              <CustomDropDown
                data={statesDropDownData}
                selectedValue={addressDetails.state}
                onValueChange={text => updateAddressDetail('state', text)}
                placeholder="State"
                width={'100%'}
                dropdownContainerStyle={{height: hp(6.5)}}
                placeholderStyle={styles.label}
              />
            )}
            {addressDetails?.state?.value && citiesDropDownData.length > 0 && (
              <CustomDropDown
                data={citiesDropDownData}
                selectedValue={addressDetails.city}
                onValueChange={text => updateAddressDetail('city', text)}
                placeholder="City"
                width={'100%'}
                dropdownContainerStyle={{height: hp(6.5)}}
                placeholderStyle={styles.label}
              />
            )}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                {t('Address')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TxtInput
                value={addressDetails.address}
                containerStyle={styles.inputField}
                placeholder="Add street, office address"
                onChangeText={text => updateAddressDetail('address', text)}
                multiline={true}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>{t('Postal Code')} </Text>
              <TxtInput
                value={addressDetails.postalCode}
                containerStyle={styles.inputField}
                placeholder="Add your postal code"
                onChangeText={text => updateAddressDetail('postalCode', text)}
                multiline={true}
              />
            </View>
            {/* <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Latitude</Text>
                <TxtInput
                  value={addressDetails.latitude?.toString()}
                  containerStyle={styles.inputField}
                  placeholder="Latitude"
                  onChangeText={text => updateAddressDetail('latitude', text)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Longitude</Text>
                <TxtInput
                  value={addressDetails.longitude?.toString()}
                  containerStyle={styles.inputField}
                  placeholder="Longitude"
                  onChangeText={text => updateAddressDetail('longitude', text)}
                  keyboardType="numeric"
                />
              </View>
            </View> */}
          </View>
        </ScrollView>
      ) : (
        renderMap()
      )}

      <View style={styles.btnContainer}>
        <CustomButton
          text={'Save'}
          onPress={handleSave}
          textStyle={styles.continueButtonText}
          containerStyle={styles.continueButton}
        />
      </View>
    </View>
  );
};

export default UpdateLocation;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    headerStyle: {
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    toggleButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1),
      marginHorizontal: wp(5),
      marginTop: hp(2),
      borderRadius: wp(3),
      alignItems: 'center',
    },
    toggleButtonText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
    },
    ScrollViewContainer: {flex: 1},
    section: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
      marginTop: hp(2),
      borderRadius: wp(3),
      padding: wp(4),
    },
    inputWrapper: {
      marginBottom: hp(2),
    },
    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
    inputField: {
      borderRadius: wp(3),
    },
    requiredAsterisk: {
      color: Colors.error,
    },
    coordinatesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    coordinateInput: {
      width: '48%',
    },
    btnContainer: {
      marginTop: hp(3),
      paddingTop: hp(2),
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
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
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    leafletMap: {
      borderRadius: wp(3),
      marginHorizontal: wp(5),
      marginTop: hp(2),
      overflow: 'hidden',
    },
    map: {
      flex: 1,
      width: '100%',
      height: hp(70),
    },
  });
