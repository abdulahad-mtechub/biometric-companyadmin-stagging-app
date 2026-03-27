import Geolocation from '@react-native-community/geolocation';
import React, {useCallback, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WebView} from 'react-native-webview';
import {useSelector} from 'react-redux';
import logger from '@utils/logger';
const LeafLetMapComponent = ({
  initialLat = 40.7128, // Changed to null to detect when not provided
  initialLng = -74.006, // Changed to null to detect when not provided
  initialZoom = 13,
  markers = [],
  onMapPress = null,
  onLocationFound = () => {},
  height = 300,
  style = {},
  initialMarkerTitle = 'My Location',
  initialMarkerColor = 'blue',
  showSearch = true,
  searchPlaceholder = 'Search for a location...',
  currentLocation = false,
  dashboard = false, // Add dashboard prop
  disabled = false,
  currentLocationOnpress = () => {},
  shouldShowInitialMarker = true,
}) => {
  const webViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const [selectedLocation, setSelectedLocation] = useState({
    // lat:  40.7573,
    // lng:  73.9861,
    // title: '',
  });
  const {t} = useTranslation();

  const defaultLat = initialLat;
  const defaultLng = initialLng;

  const updateToSpecificLocation = useCallback(async () => {
    try {
      Geolocation.getCurrentPosition(async info => {
        try {
          const latitude = info.coords.latitude;
          const longitude = info.coords.longitude;
          logger.log(
            'Updating to specific coordinates:',
            {
              latitude,
              longitude,
            },
            {context: 'LeafLetMap'},
          );

          // Reverse geocode to get address
          const {address, components} = await reverseGeocode(
            latitude,
            longitude,
          );
          const extracted = extractAddressComponents(components);

          const locObj = {
            ...extracted,
            address: address || '',
            latitude,
            longitude,
            name: t('Specific Location'),
          };

          // setSelectedLocation({
          //   lat: latitude,
          //   lng: longitude,
          //   title: locObj.name,
          // });

          // Update parent callback
          onLocationFound(locObj);

          // Update the map view and marker
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({
                type: 'clearMarkers',
              }),
            );

            webViewRef.current.postMessage(
              JSON.stringify({
                type: 'addMarker',
                data: {
                  lat: latitude,
                  lng: longitude,
                  title: locObj.name,
                  popup: '',
                  color: 'blue',
                  isSearchResult: false,
                },
              }),
            );

            webViewRef.current.postMessage(
              JSON.stringify({
                type: 'setView',
                data: {lat: latitude, lng: longitude, zoom: 16},
              }),
            );
          }

          logger.log('Updated address for specific coordinates:', locObj, {
            context: 'LeafLetMap',
          });
        } catch (err) {
          logger.warn('Reverse geocoding failed:', err, {
            context: 'LeafLetMap',
          });
        }
      });
    } catch (err) {
      logger.warn('Failed to update to specific location:', err, {
        context: 'LeafLetMap',
      });
      Alert.alert(
        t('Failed to update to specific location. Please try again.'),
      );
    }
  }, [t, onLocationFound]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
            'Accept-Language': 'en',
          },
        },
      );
      logger.log(
        '🚀 ~ reverseGeocode ~ response:',
        JSON.stringify(response, null, 3),
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Reverse geocoding failed');
      }

      return {
        address: data.display_name,
        components: data.address || {},
      };
    } catch (error) {
      logger.error('Reverse geocoding error:', error, {context: 'LeafLetMap'});
      return {
        address: '',
        components: {},
      };
    }
  };
  const extractAddressComponents = (components = {}) => {
    return {
      streetAddress: `${components.house_number || ''} ${
        components.road || ''
      }`.trim(),
      city: components.city || components.town || components.village || '',
      province: components.state || '',
      postalCode: components.postcode || '',
      country: components.country || '',
    };
  };
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossorigin=""></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            height: 100vh;
            overflow: hidden;
          }
          #mapid { 
            height: 100vh; 
            width: 100vw;
          }
        </style>
      </head>
      <body>
        <div id="mapid"></div>
        <script>
          // Initialize map
         var map = L.map('mapid').setView(
  [${selectedLocation.lat || defaultLat}, ${
    selectedLocation.lng || defaultLng
  }],
  ${initialZoom}
);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(map);

          
          // Keep track of markers
          var allMarkers = [];
          
          // Function to create colored marker icon
          function createColoredIcon(color = 'blue') {
            // Create SVG icon with the specified color
            var svgIcon = \`<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="\${color}" stroke="#fff" stroke-width="2"/>
              <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
            </svg>\`;
            
            return L.divIcon({
              html: svgIcon,
              className: 'custom-marker',
              iconSize: [25, 41],
              iconAnchor: [12.5, 41],
              popupAnchor: [0, -41]
            });
          }

          // Function to add markers with color support
          function addMarker(lat, lng, title, popup, isSearchResult = false, color = 'blue') {
            var icon = createColoredIcon(color);
            var marker = L.marker([lat, lng], { icon: icon }).addTo(map);
            
            if (title) marker.bindTooltip(title);
            if (popup) marker.bindPopup(popup);
            
            // Store marker reference
            allMarkers.push({
              marker: marker,
              isSearchResult: isSearchResult
            });
            
            return marker;
          }

          ${
            selectedLocation.lat && selectedLocation.lng && !dashboard
              ? `
                var initialMarker = addMarker(${selectedLocation.lat}, ${selectedLocation.lng}, '${selectedLocation.title}', '', false, '${initialMarkerColor}');
                allMarkers.push({
                  marker: initialMarker,
                  isSearchResult: false
                });
              `
              : shouldShowInitialMarker && !dashboard
              ? `
                var initialMarker = addMarker(${initialLat}, ${initialLng}, '${initialMarkerTitle}', '', false, '${initialMarkerColor}');
                allMarkers.push({
                  marker: initialMarker,
                  isSearchResult: false
                });
              `
              : '// No initial marker added'
          }

          // Add additional markers with color support
          var markersData = ${JSON.stringify(markers)};
          markersData.forEach(function(markerData) {
            addMarker(
              markerData.lat, 
              markerData.lng, 
              markerData.title || '', 
              markerData.popup || '',
              false,
              markerData.color || 'blue' // Use marker color or default to blue
            );
          });

          // Handle map clicks
          map.on('click', function(e) {
            var clickData = {
              lat: e.latlng.lat,
              lng: e.latlng.lng
            };
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              data: clickData
            }));
          });

          // Function to clear search result markers only
          function clearSearchMarkers() {
            allMarkers = allMarkers.filter(function(item) {
              if (item.isSearchResult) {
                map.removeLayer(item.marker);
                return false;
              }
              return true;
            });
          }

          // Function to receive messages from React Native
          window.addEventListener('message', function(event) {
            var message = JSON.parse(event.data);
            
            switch(message.type) {
              case 'addMarker':
                addMarker(
                  message.data.lat, 
                  message.data.lng, 
                  message.data.title, 
                  message.data.popup,
                  message.data.isSearchResult || false,
                  message.data.color || 'blue' // Support color parameter
                );
                break;
              case 'setView':
                map.setView([message.data.lat, message.data.lng], message.data.zoom || 13);
                break;
              case 'clearMarkers':
                allMarkers.forEach(function(item) {
                  map.removeLayer(item.marker);
                });
                allMarkers = [];
                break;
              case 'clearSearchMarkers':
                clearSearchMarkers();
                break;
            }
          });

          // Disable zoom on mobile for better UX
          map.scrollWheelZoom.disable();
          map.on('focus', () => { map.scrollWheelZoom.enable(); });
          map.on('blur', () => { map.scrollWheelZoom.disable(); });
        </script>
      </body>
    </html>
  `;

  const handleMessage = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'mapClick' && onMapPress) {
        onMapPress(message.data);
      }
    } catch (error) {
      logger.error('Error parsing WebView message:', error, {
        context: 'LeafLetMap',
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    setIsSearching(true);
    setShowResults(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&limit=10`,
        {
          // headers: {
          //   'User-Agent': 'ReactNativeMapApp/1.0 (contact@example.com)',
          // },
        },
      );

      const data = await response.json();

      logger.log('data', data, {context: 'LeafLetMap'});
      setSearchedData(data);
      setShowResults(data.length > 0);

      if (onLocationFound) {
        onLocationFound(data);
      }

      if (data.length === 0) {
        Alert.alert(
          t('No Results'),
          t('No locations found. Please try a different search term.'),
        );
      }
    } catch (error) {
      logger.error('Search error:', error, {context: 'LeafLetMap'});
      Alert.alert(
        t('Error'),
        t('Failed to search location. Please try again later.'),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = item => {
    const coords = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };

    // setSelectedLocation({
    //   title: item.display_name,
    //   lat: item.lat,
    //   lng: item.lon,
    // });

    onMapPress(coords);

    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchedData([]);
    setShowResults(false);
  };

  const formatAddress = displayName => {
    const parts = displayName.split(',');
    const mainLocation = parts[0];
    const subLocation = parts.slice(1, 3).join(',').trim();
    return {mainLocation, subLocation};
  };

  const getLocationIcon = type => {
    // You can customize icons based on location type
    if (type?.includes('city') || type?.includes('town')) return '🏙️';
    if (type?.includes('restaurant') || type?.includes('food')) return '🍽️';
    if (type?.includes('shop') || type?.includes('store')) return '🏪';
    if (type?.includes('hotel') || type?.includes('accommodation')) return '🏨';
    if (type?.includes('hospital') || type?.includes('medical')) return '🏥';
    if (type?.includes('school') || type?.includes('university')) return '🏫';
    return '📍';
  };

  const addMarker = (
    lat,
    lng,
    title = '',
    popup = '',
    isSearchResult = false,
    color = 'blue', // Add color parameter
  ) => {
    const message = JSON.stringify({
      type: 'addMarker',
      data: {lat, lng, title, popup, isSearchResult, color},
    });
    webViewRef.current?.postMessage(message);
  };

  const setView = (lat, lng, zoom = 13) => {
    const message = JSON.stringify({
      type: 'setView',
      data: {lat, lng, zoom},
    });
    webViewRef.current?.postMessage(message);
  };

  const clearMarkers = () => {
    const message = JSON.stringify({
      type: 'clearMarkers',
    });
    webViewRef.current?.postMessage(message);
  };

  const clearSearchMarkers = () => {
    const message = JSON.stringify({
      type: 'clearSearchMarkers',
    });
    webViewRef.current?.postMessage(message);
  };

  // Expose methods through ref
  React.useImperativeHandle(webViewRef, () => ({
    addMarker,
    setView,
    clearMarkers,
    clearSearchMarkers,
    search: handleSearch,
  }));

  const renderSearchItem = ({item, index}) => {
    const {mainLocation, subLocation} = formatAddress(item.display_name);
    const icon = getLocationIcon(item.type);

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.locationIconContainer}>
          <Text style={styles.locationIcon}>{icon}</Text>
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.mainLocationText} numberOfLines={1}>
            {mainLocation}
          </Text>
          <Text style={styles.subLocationText} numberOfLines={2}>
            {subLocation}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {height}, style]}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t(searchPlaceholder)}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              editable={!isSearching}
              placeholderTextColor={Colors.darkTheme.secondryTextColor}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.searchButton,
              (isSearching || !searchQuery.trim()) &&
                styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={isSearching || !searchQuery.trim()}>
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showResults && searchedData.length > 0 && (
        <View
          style={[
            styles.searchResultsContainer,
            {
              maxHeight: searchedData.length > 3 ? '50%' : '30%',
            },
          ]}>
          <ScrollView style={{height: '100%'}}>
            {searchedData?.slice(0, 6)?.map((item, index) => (
              <View key={`${item.place_id}-${index}`}>
                {renderSearchItem({item, index})}
                <View style={styles.separator} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.mapContainer]}>
        <WebView
          ref={webViewRef}
          source={{html: htmlContent}}
          style={styles.webview}
          onMessage={!disabled && handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {currentLocation && (
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
          onPress={currentLocationOnpress}>
          <MaterialIcons
            name="my-location"
            size={RFPercentage(4)}
            color={'#006ec2'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 40,
    backgroundColor: '#f6f8fa',
    marginRight: 12,
    fontSize: 16,
    color: '#24292f',
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    top: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#656d76',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#0969da',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 80,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchButtonDisabled: {
    backgroundColor: '#8c959f',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  searchResultsContainer: {
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f6f8fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  resultsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#656d76',
  },
  hideResultsText: {
    fontSize: 14,
    color: '#0969da',
    fontWeight: '500',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  mainLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f',
    marginBottom: 2,
  },
  subLocationText: {
    fontSize: 13,
    color: '#656d76',
    lineHeight: 18,
  },
  selectIndicator: {
    paddingHorizontal: 8,
  },
  selectText: {
    fontSize: 14,
    color: '#0969da',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginLeft: 68,
  },
  mapContainer: {
    flex: 1,
  },
  mapContainerWithResults: {
    flex: 0.6, // Reduce map height when results are shown
  },
  webview: {
    flex: 1,
  },
});

export default LeafLetMapComponent;
