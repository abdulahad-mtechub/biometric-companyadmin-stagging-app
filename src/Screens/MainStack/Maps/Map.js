import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Geocoder from 'react-native-geocoding';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
  GEOCODING_API_KEY,
  GOOGLE_MAP_API_KEY,
} from '@constants/Constants';
import { Fonts } from '@constants/Fonts';
import { useDispatch } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import AddAddressBottomSheet from '@components/BottomSheets/AddAddressBottomSheet';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import { setLocation } from '@redux/Slices/authSlice';
import logger from '@utils/logger';
import {
  getCurrentLocation,
  useReverseGeocoding,
} from '@utils/LocationHelpers';
import { t } from 'i18next';


const Map = ({navigation}) => {
  const [region, setRegion] = useState({
    latitude: 33.6520751,
    longitude: 73.0816881,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const dispatch = useDispatch();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const {getAddressFromLatLng} = useReverseGeocoding();

  const mapRef = useRef(null);
  const btmSheetRef = useRef();
  Geocoder.init(GOOGLE_MAP_API_KEY);

  useEffect(() => {
    getCurrentPosition();
  }, []);

  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const locObj = await getAddressFromLatLng(latitude, longitude);
      // logger.log(locObj)

      setSelectedLocation({
        latitude: latitude,
        longitude: longitude,
        address: locObj?.address,
      })
      dispatch(
        setLocation({
          latitude: latitude,
          longitude: longitude,
          address: locObj?.address,

          region: locObj?.components?.continent,
          country: locObj?.components?.country,
          city: locObj?.components?._normalized_city,
          state: locObj?.components?.state,
          postalCode: locObj?.components?.postcode,
        }),
     );
      
   
    } catch (err) {
      logger.warn('Failed to get current location:', err, { context: 'Map' });
    }
  }, []);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const json = await Geocoder.from(lat, lng);
      const addressComponent =
        json?.results?.[0]?.formatted_address ?? 'Address not found';
      return addressComponent;
    } catch (error) {
      logger.error('Error fetching address:', error, { context: 'Map' });
      return 'Address not found';
    }
  };

  const extractEnglishWords = text => {
    let words = text?.match(/[A-Za-z]+/g) || [];
    return words.join(' ');
  };

  const handleMapPress = async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    const {name} = event.nativeEvent;
    const namee = extractEnglishWords(name);

    const address = await getAddressFromCoordinates(latitude, longitude);

    setSelectedLocation({
      latitude,
      longitude,
      address,
      name: namee,
    });

    openBtmSheet();
  };

  const handleLeatPress = async (lat, lng) => {
    try {
      const locObj = await getAddressFromLatLng(lat, lng);
      // logger.log(locObj)

      dispatch(
        setLocation({
          latitude: lat,
          longitude: lng,
          address: locObj?.address,

          region: locObj?.components?.continent,
          country: locObj?.components?.country,
          city: locObj?.components?._normalized_city,
          state: locObj?.components?.state,
          postalCode: locObj?.components?.postcode,
        }),
      );

      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: locObj?.address,

        region: locObj?.components?.continent,
        country: locObj?.components?.country,
        city: locObj?.components?._normalized_city,
        state: locObj?.components?.state,
        postalCode: locObj?.components?.postcode,
      })

      openBtmSheet();
    } catch (error) {}
  };

  const getGetAddressFromLatAndLong = async () => {
    const {ok, data} = await fetchApis(
      `https://api.opencagedata.com/geocode/v1/json?key=${GEOCODING_API_KEY}&q=${selectedLocation.latitude}%2C+${selectedLocation.longitude}`,
      'GET',
      null,
      null,
      null,
      null,
    );

    if (ok) {
      const addressData = extractAddressData(data);
      setAddress(addressData.address);
    }
  };
  useEffect(() => {
    getGetAddressFromLatAndLong();
  }, [selectedLocation]);

  const handlePlaceSelect = async (data, details = null) => {
    if (!details?.geometry?.location) return;
    const {lat, lng} = details.geometry.location;
    const address = details.formatted_address;
    const name = details.name;

    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion);
    }

    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      address,
      name,
    });

    openBtmSheet();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        address: selectedLocation?.address,
        shortAddress: selectedLocation?.shortAddress, // may be undefined
        name: selectedLocation?.name,
      };
      dispatch(setLocation(payload));
      navigation.goBack();

      closeBtmSheet();
    } catch (err) {
      logger.error('Local submit error:', err, { context: 'Map' });
      Alert.alert('Error', 'Something went wrong while saving your address.');
    } finally {
    }
  };

  const openBtmSheet = () => {
    btmSheetRef?.current?.open?.();
  };

  const closeBtmSheet = () => {
    btmSheetRef?.current?.close?.();
  };

  const styles = StyleSheet.create({
    map: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      textAlign: 'center',
      marginVertical: 10,
    },
    rbSheetHeading: {
      //   color: Colors.primary_text,
      fontFamily: Fonts.PlusJakartaSans_Bold,
      fontSize: RFPercentage(2),
    },
    rowViewSB1: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currentLocationButton: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      borderRadius: 50,
      padding: 8,
    },
    errorText: {
      color: 'red',
      fontSize: wp(3.5),
      marginBottom: hp(1),
      marginLeft: wp(3),
    },
  });

  return (
    <View style={{flex: 1}}>

      

      <LeafLetMapComponent
        initialLat={selectedLocation?.latitude}
        initialLng={selectedLocation?.longitude}
        initialZoom={13}
        markers={[]}
        onMapPress={coordinates => {
          handleLeatPress(coordinates.lat, coordinates.lng);
        }}
        // height={400}
        style={styles.map}
        initialMarkerTitle={'Current Location'}
        searchPlaceholder={t("Find a place...")}
        onLocationFound={result => {
          logger.log('Found:', result, { context: 'Map' });
        }}
        showSearch={true}
      />

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentPosition}>
        <Svgs.mapGps height={hp(6)} width={hp(6)} />
      </TouchableOpacity>

      <AddAddressBottomSheet
        refRBSheet={btmSheetRef}
        sheetTitle="Manual Location"
        address={selectedLocation?.address}
        setAddress={value =>
          setSelectedLocation(prev => ({...prev, address: value}))
        }
        name={selectedLocation?.name}
        setName={value => setSelectedLocation(prev => ({...prev, name: value}))}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

export default Map;
