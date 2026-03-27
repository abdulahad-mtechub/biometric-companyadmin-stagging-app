import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import {useCallback, useState} from 'react';

const removePlusCode = address => {
  const addressParts = address.split(',');

  const firstPart = addressParts[0].trim();

  const plusCodePattern = /^[A-Z0-9]+\+[A-Z0-9]+$/;

  if (plusCodePattern.test(firstPart)) {
    addressParts.shift(); // Remove the first part
  }

  return addressParts.join(',').trim();
};

//   return new Promise((resolve, reject) => {
//     try {
//       if (Geocoder.isInit == false) {
//       }

//         .then(async json => {

//           let state = '';
//           let region = '';
//               state = component.short_name;
//             }
//               region = component.short_name;
//             }
//           }


//         })
//         .catch(error => {
//           resolve('');
//         });
//     } catch (error) {
//       resolve('');
//     }
//   });
// };

import {Alert, Linking, Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {fetchApis} from './Helpers';
import logger from '@utils/logger';

export const getCurrentLocation = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      // Check current permission status
      let permissionStatus = await check(permission);

      // If permission is denied or blocked, request it
      if (permissionStatus === RESULTS.DENIED) {
        permissionStatus = await request(permission);
      }

      // Handle different permission states
      if (
        permissionStatus === RESULTS.BLOCKED ||
        permissionStatus === RESULTS.DENIED
      ) {
        // Show alert with option to open settings
        Alert.alert(
          'Location Permission Required',
          'Please enable location permission in your device settings to use this feature.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                reject(new Error('Location permission denied'));
              },
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                openSettings().catch(() => {
                  logger.warn('Cannot open settings', { context:'LocationHelpers' });
                });
                reject(new Error('Location permission denied'));
              },
            },
          ],
          {cancelable: false},
        );
        return;
      }

        Geolocation.getCurrentPosition(
        info => {
          let latitude = info.coords.latitude;
          let longitude = info.coords.longitude;
          // logger.debug(longitude, latitude, 'long lati');

          //getting address
          // Initialize the module (needs to be done only once)

          // Search by geo-location (reverse geo-code)
          let obj = {
            latitude: latitude,
            longitude: longitude,
          };

          resolve(obj);
        },
        error => {
          // Handle geolocation errors specifically
          console.log('Geolocation error:', error);
          let obj = {
            latitude: 0.0,
            longitude: 0.0,
            error: error.message,
            code: error.code,
          };

          // Show user-friendly error message
          let errorMessage = 'Unable to get location.';
          if (error.code === 1) {
            errorMessage = 'Location permission denied.';
          } else if (error.code === 2) {
            errorMessage = 'Location services unavailable. Please enable GPS or location services.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }

          Alert.alert('Location Error', errorMessage);

          resolve(obj);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      logger.log('error  :  ', error, { context:'LocationHelpers' });
      let obj = {
        latitude: 0.0,
        longitude: 0.0,
        address: '',
      };
      resolve(obj);
    }
  });
};

export const extractEnglishWords = text => {
  let words = text?.match(/[A-Za-z]+/g) || [];
  return words.join(' ');
};

export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const json = await Geocoder.from(lat, lng);
    const address =
      json?.results?.[0]?.formatted_address ?? 'Address not found';

    const addressComponent = json?.results?.[0].address_components;

    return {addressComponent, address};
  } catch (error) {
    logger.location.error('Error fetching address', error);
    return 'Address not found';
  }
};
export const getContinent = countryCode => {
  const continentMap = {
    // North America
    US: 'North America',
    CA: 'North America',
    MX: 'North America',
    GT: 'North America',
    BZ: 'North America',
    SV: 'North America',
    HN: 'North America',
    NI: 'North America',
    CR: 'North America',
    PA: 'North America',
    CU: 'North America',
    JM: 'North America',
    HT: 'North America',
    DO: 'North America',

    // South America
    BR: 'South America',
    AR: 'South America',
    PE: 'South America',
    CO: 'South America',
    VE: 'South America',
    CL: 'South America',
    EC: 'South America',
    BO: 'South America',
    PY: 'South America',
    UY: 'South America',
    GY: 'South America',
    SR: 'South America',

    // Europe
    GB: 'Europe',
    FR: 'Europe',
    DE: 'Europe',
    IT: 'Europe',
    ES: 'Europe',
    NL: 'Europe',
    BE: 'Europe',
    AT: 'Europe',
    CH: 'Europe',
    SE: 'Europe',
    NO: 'Europe',
    DK: 'Europe',
    FI: 'Europe',
    PL: 'Europe',
    CZ: 'Europe',
    HU: 'Europe',
    RO: 'Europe',
    BG: 'Europe',
    GR: 'Europe',
    PT: 'Europe',
    IE: 'Europe',
    HR: 'Europe',
    SI: 'Europe',
    SK: 'Europe',

    // Asia
    CN: 'Asia',
    IN: 'Asia',
    JP: 'Asia',
    KR: 'Asia',
    TH: 'Asia',
    VN: 'Asia',
    PH: 'Asia',
    MY: 'Asia',
    SG: 'Asia',
    ID: 'Asia',
    TW: 'Asia',
    HK: 'Asia',
    MO: 'Asia',
    KH: 'Asia',
    LA: 'Asia',
    MM: 'Asia',
    BD: 'Asia',
    LK: 'Asia',
    NP: 'Asia',
    BT: 'Asia',
    MN: 'Asia',
    KZ: 'Asia',
    UZ: 'Asia',
    TJ: 'Asia',
    KG: 'Asia',
    TM: 'Asia',
    AF: 'Asia',
    PK: 'Asia',
    IR: 'Asia',
    IQ: 'Asia',
    SY: 'Asia',
    LB: 'Asia',
    JO: 'Asia',
    IL: 'Asia',
    PS: 'Asia',
    SA: 'Asia',
    AE: 'Asia',
    QA: 'Asia',
    BH: 'Asia',
    KW: 'Asia',
    OM: 'Asia',
    YE: 'Asia',
    TR: 'Asia',
    GE: 'Asia',
    AM: 'Asia',
    AZ: 'Asia',

    // Africa
    EG: 'Africa',
    LY: 'Africa',
    SD: 'Africa',
    DZ: 'Africa',
    MA: 'Africa',
    TN: 'Africa',
    ET: 'Africa',
    KE: 'Africa',
    UG: 'Africa',
    TZ: 'Africa',
    RW: 'Africa',
    BI: 'Africa',
    SO: 'Africa',
    DJ: 'Africa',
    ER: 'Africa',
    SS: 'Africa',
    CF: 'Africa',
    TD: 'Africa',
    NE: 'Africa',
    NG: 'Africa',
    CM: 'Africa',
    GQ: 'Africa',
    GA: 'Africa',
    CG: 'Africa',
    CD: 'Africa',
    AO: 'Africa',
    ZM: 'Africa',
    ZW: 'Africa',
    BW: 'Africa',
    NA: 'Africa',
    ZA: 'Africa',
    LS: 'Africa',
    SZ: 'Africa',
    MZ: 'Africa',
    MG: 'Africa',
    MU: 'Africa',
    MW: 'Africa',
    SC: 'Africa',
    KM: 'Africa',

    // Oceania
    AU: 'Oceania',
    NZ: 'Oceania',
    FJ: 'Oceania',
    PG: 'Oceania',
    SB: 'Oceania',
    NC: 'Oceania',
    PF: 'Oceania',
    WS: 'Oceania',
    VU: 'Oceania',
    TO: 'Oceania',
    KI: 'Oceania',
    NR: 'Oceania',
    PW: 'Oceania',
    MH: 'Oceania',
    FM: 'Oceania',
    TV: 'Oceania',
  };

  return continentMap[countryCode] || 'Unknown';
};
export const extractLocationHierarchy = addressComponents => {
  const locationData = {
    country: '',
    countryCode: '',
    state: '',
    stateCode: '',
    city: '',
    locality: '',
    sublocality: '',
    postalCode: '',
    region: '',
    continent: '',
  };

  if (!addressComponents) return locationData;

  addressComponents.forEach(component => {
    const types = component.types;

    // Country
    if (types.includes('country')) {
      locationData.country = component.long_name;
      locationData.countryCode = component.short_name;
    }

    // State/Province
    if (types.includes('administrative_area_level_1')) {
      locationData.state = component.long_name;
      locationData.stateCode = component.short_name;
    }

    // City/Town
    if (types.includes('locality')) {
      locationData.city = component.long_name;
    }

    // Alternative city (administrative_area_level_2)
    if (types.includes('administrative_area_level_2') && !locationData.city) {
      locationData.city = component.long_name;
    }

    // Sublocality (neighborhood, district)
    if (
      types.includes('sublocality') ||
      types.includes('sublocality_level_1')
    ) {
      locationData.sublocality = component.long_name;
    }

    // Postal Code
    if (types.includes('postal_code')) {
      locationData.postalCode = component.long_name;
    }
  });

  // Determine continent/region based on country
  locationData.continent = getContinent(locationData.countryCode);
  locationData.region = locationData.continent; // Alias for region

  return locationData;
};

// Reusable extractor for OpenCage API response
// Reusable extractor for OpenCage API response
export function extractAddressData(apiResponse) {
  if (
    !apiResponse ||
    !apiResponse.results ||
    apiResponse.results.length === 0
  ) {
    return null;
  }

  const result = apiResponse.results[0]; // take first match
  const {components, formatted} = result;

  return {
    address: formatted || null,
    city:
      components.city ||
      components.town ||
      components.village ||
      components._normalized_city ||
      null,
    region: components.continent || null, // continent instead of suburb/municipality
    state: components.state || null,
    country: components.country || null,
    postalCode: components.postcode || null,
  };
}

export function useReverseGeocoding() {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAddressFromLatLng = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      const {ok, data} = await fetchApis(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        'GET',
        null,
        null,
        null,
        {
          'User-Agent': 'react-native-app',
          'Accept-Language': 'en',
          'Content-Type': 'application/json',
        },
      );

      if (ok) {
        setAddress(data.display_name);
      
        return {
          address: data.display_name,
          city: data.address.county,
          state: data.address.state,
          country: data.address.country,
          postalCode: data.address.postcode,
        };
      } else {
        setError('No address found');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    address,
    loading,
    error,
    getAddressFromLatLng,
  };
}
