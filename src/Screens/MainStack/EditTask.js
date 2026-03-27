import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';

import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import {viewDocument} from '@react-native-documents/viewer';
import {Svgs} from '@assets/Svgs/Svgs';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import StackHeader from '@components/Header/StackHeader';
import NumericStepper from '@components/Stepper/NumericStepper';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {
  ApiResponse,
  fetchApis,
  fetchFormDataApi,
  truncateText,
} from '@utils/Helpers';
import {
  useReverseGeocoding,
  getCurrentLocation,
  getAddressFromCoordinates,
} from '@utils/LocationHelpers';
import logger from '@utils/logger';
import MapView, {Marker, PROVIDER_DEFAULT} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '../../Constants/Constants';

export default function EditTask({navigation, route}) {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const {item, assignments} = route.params;

  const {workers} = useSelector(store => store.states);
  const CameraBottomSheetRef = useRef(null);
  const [name, setName] = useState(item?.title);
  const [description, setDescription] = useState(item?.description);
  const [selectedWorker, setSelectedWorker] = useState(
    assignments.map(item => {
      return {
        label: item?.worker_name,
        value: item?.worker_id,
        email: item?.worker_email,
      };
    }),
  );
  const [selectedPriority, setSelectedPriority] = useState({
    label: item?.priority,
    value: item?.priority,
  });
  const [selectedStatus, setSelectedStatus] = useState({
    label: item?.status,
    value: item?.status,
  });
  const [dateFrom, setDateFrom] = useState(item?.start_at);
  const [dateTo, setDateTo] = useState(item?.end_at);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [datePickerType, setDatePickerType] = useState(null);
  const {showAlert} = useAlert();

  // Get current position handler
  const getCurrentPosition = useCallback(async () => {
    try {
      const {latitude, longitude} = await getCurrentLocation();
      setSelectedLocation({
        latitude,
        longitude,
        address: '',
      });
      const {address} = await getAddressFromCoordinates(latitude, longitude);
      setAddress(address);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
    } catch (err) {
      logger.warn('Failed to get current location:', err, {
        context: 'EditTask',
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
        context: 'EditTask',
      });
    }
  }, []);

  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
    const [shouldDisplayListView, setShouldDisplayListView] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude:Number(item?.location_lat),
    longitude: Number(item?.location_lng),
  });
  const {token, language} = useSelector(store => store.auth);
  const [RadiusValue, setRadiusValue] = useState(
    item?.location_radius_m ? item?.location_radius_m : 0,
  );
  const [address, setAddress] = useState(
    item?.location_address ? item?.location_address : '',
  );
  const [region, setRegion] = useState({
    latitude: Number(item?.location_lat) || 37.78825,
    longitude: Number(item?.location_lng) || -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  // Error states
  const [errors, setErrors] = useState({});

  const priorities = [
    {label: t('Low'), value: 'low'},
    {label: t('Medium'), value: 'medium'},
    {label: t('High'), value: 'high'},
    {label: t('Urgent'), value: 'urgent'},
  ];
  const status = [
    {label: t('Assigned'), value: 'assigned'},
    {label: t('In Progress'), value: 'in_progress'},
    {label: t('Completed'), value: 'completed'},
    {label: t('Delayed'), value: 'delayed'},
    {label: t('Not Done'), value: 'not_done'},
    {label: t('Cancelled'), value: 'cancelled'},
  ];

  const handleWorkerSelection = useCallback(
    worker => {
      setSelectedWorker(prev => {
        const exists = prev.some(w => w.value === worker.value);
        const newWorkers = exists
          ? prev.filter(w => w.value !== worker.value)
          : [...prev, worker];

        return newWorkers;
      });

      // Clear error
      if (errors.worker) {
        setErrors(prev => ({
          ...prev,
          worker: null,
        }));
      }
    },
    [errors.worker],
  );

  const validateForm = () => {
    const newErrors = {};

    if (!address) newErrors.address = t('Please select a location');

    if (RadiusValue === 0 || !RadiusValue)
      newErrors.RadiusValue = t('Please select a radius');
    if (!name.trim()) newErrors.name = t('Task name is required');
    if (!description.trim())
      newErrors.description = t('Task description is required');
    if (selectedWorker.length === 0)
      newErrors.worker = t('Please select a employee');
    if (!selectedStatus) newErrors.status = t('Please select a status');
    if (!selectedPriority) newErrors.priority = t('Please select a priority');

    if (!dateFrom) newErrors.dateFrom = t('Please select start date');
    if (!dateTo) newErrors.dateTo = t('Please select end date');

    // Ensure dateFrom <= dateTo
    if (dateFrom && dateTo && moment(dateFrom).isAfter(moment(dateTo))) {
      newErrors.dateTo = t('End date must be after start date');
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = useCallback(selectedItem => {
    // Handle both images and documents from CameraBottomSheet
    if (selectedItem.mime === 'application/pdf' || selectedItem.path?.includes('.pdf')) {
      // It's a document - store as object with uri and name
      setSelectedDocuments(prev => [
        ...prev,
        {uri: selectedItem.path, name: selectedItem.name},
      ]);
    } else {
      // It's an image - store as object for consistency
      setSelectedImages(prev => [
        ...prev,
        {path: selectedItem.path, mime: selectedItem.mime},
      ]);
    }
  }, []);

  const viewSelectedDocument = useCallback(uri => {
    viewDocument({
      uri: uri,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, { context:'EditTask' });
      showAlert(t('Failed to open document'), 'error');
    });
  }, []);

  const uploadDocumentToServer = useCallback(async document => {
    if (!document) return null;

    const formData = new FormData();
    formData.append('pdf', {
      uri: document.uri,
      type: 'application/pdf',
      name: document.name || `upload-${Date.now()}.pdf`,
    });

    try {
      const {ok, data} = await fetchFormDataApi(
        `${baseUrl}/upload/pdf`,
        'POST',
        null,
        formData,
        null,
        {'Content-Type': 'multipart/form-data'},
      );

      if (!ok) {
        throw new Error(data?.message || 'Upload failed');
      }

      return data?.data?.url;
    } catch (error) {
      logger.error('Document upload failed:', error, { context:'EditTask' });
      throw error;
    }
  }, []);

  const imageUploadURL = `${baseUrl}/upload/image`;

  const uploadImageToServer = useCallback(
    async path => {
      setIsLoading(true);
      const formDataa = new FormData();
      formDataa.append('image', {
        uri: path,
        type: 'image/jpeg',
        name: `upload-${Date.now()}.jpg`,
      });

      try {
        const {ok, data} = await fetchFormDataApi(
          imageUploadURL,
          'POST',
          null,
          formDataa,
          null,
          {'Content-Type': 'multipart/form-data'},
        );

        const imageUrl = ok ? data?.data?.url : path;

        return imageUrl;
      } catch (error) {
        logger.error('Image upload failed:', error, { context:'EditTask' });
        return false;
      }
    },
    [selectedImages],
  );

  const uploadMultipleImages = useCallback(async () => {
    if (!selectedImages?.length) return [];

    try {
      const uploadedUrls = await Promise.all(
        selectedImages.map(img => {
          // Handle both old format (string) and new format (object)
          const path = typeof img === 'string' ? img : img.path;
          return uploadImageToServer(path);
        }),
      );

      // Filter out any failed uploads (false values)
      const validUrls = uploadedUrls.filter(url => url);

      return validUrls;
    } catch (error) {
      logger.error('Multiple image upload failed:', error, { context:'EditTask' });
      return [];
    }
  }, [selectedImages, uploadImageToServer]);

  const uploadMultipleDocuments = useCallback(async () => {
    if (!selectedDocuments?.length) return [];

    try {
      const uploadedUrls = await Promise.all(
        selectedDocuments.map(doc => uploadDocumentToServer(doc)),
      );

      // remove null/failed uploads
      return uploadedUrls.filter(url => url);
    } catch (error) {
      logger.error('Multiple document upload failed:', error, { context:'EditTask' });
      return [];
    }
  }, [selectedDocuments, uploadDocumentToServer]);

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        let urls = [];

        if (selectedImages.length > 0) {
          const imageUrls = await uploadMultipleImages();
          urls = [...urls, ...imageUrls];
        }

        if (selectedDocuments.length > 0) {
          const documentUrls = await uploadMultipleDocuments();
          urls = [...urls, ...documentUrls];
        }

        const lat = selectedLocation?.latitude
          ? parseFloat(selectedLocation.latitude)
          : null;
        const lng = selectedLocation?.longitude
          ? parseFloat(selectedLocation.longitude)
          : null;

        const payload = {
          title: name,
          description: description,
          priority: selectedPriority.value,
          start_at: dateFrom,
          end_at: dateTo,
          location: {
            address: address,
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
            radius_m: RadiusValue,
          },
          assignees:
            selectedWorker.length > 0
              ? selectedWorker?.map(worker => worker.value)
              : [],
          attachments: urls ? urls : [],
          face_required: true,
          location_required: true,
          evidence_required: true,
          completion_policy: 'all',
          status: selectedStatus.value,
          meta: {
            timezone: 'Europe/Madrid',
            allow_decline: true,
            allow_reschedule: true,
          },
        };

        const {ok, data} = await fetchApis(
          `${baseUrl}/task-management/admin/tasks/${item?.id}`,
          'PATCH',
          setIsLoading,
          payload,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );
        const {ok:oki, data:response} = await fetchApis(
          `${baseUrl}/task-management/admin/tasks/${item?.id}/${selectedStatus.value}`,
          'PATCH',
          setIsLoading,
          payload,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );
        logger.log('🚀 ~ handleSave ~ response:', response, { context:'EditTask' });
        ApiResponse(showAlert, data, language);

        if (ok && !data?.error) {
          logger.log(data, payload, { context:'EditTask' });

          navigation.goBack();
        } else {
        }
      } catch (error) {
        logger.error('handleSave error:', error, { context:'EditTask' });
        showAlert('An unexpected error occurred. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StackHeader
        title="Edit Task"
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        headerView={{paddingHorizontal: wp(2)}}
      />
      <View style={{paddingHorizontal: wp(4)}}>
        <Text style={styles.header}>{t('Task Details')}</Text>
      </View>

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(4),
          paddingBottom: hp(4),
          flexGrow: 1,
        }}
       >
        <View
          style={{flex: 1}}
         >
          <Label text="Title" required isDarkMode={isDarkMode} />
          <TxtInput
            value={name}
            onChangeText={value => {
              setErrors(prev => ({...prev, name: null}));
              setName(value);
            }}
            containerStyle={{
              marginBottom: hp(1),
              backgroundColor: isDarkMode
                ? Colors.darkTheme.input
                : 'transparent',
            }}
            placeholder="E.g. Task #1"
            error={errors.name}
          />

          <Label text="Description" required isDarkMode={isDarkMode} />
          <TextInput
            style={[styles.input, styles.comments]}
            value={description}
            onChangeText={value => {
              setErrors(prev => ({...prev, description: null}));
              setDescription(value);
            }}
            placeholder={t('Describe your request')}
            placeholderTextColor="#A0A0A0"
            multiline
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}

          <Label text="Assigned To" required isDarkMode={isDarkMode} />
          <CustomDropDown
            data={workers}
            selectedValue={selectedWorker}
            onValueChange={handleWorkerSelection}
            placeholder={t('Select Employee')}
            error={errors.worker}
            multiple={true}
          />
          {selectedWorker.length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedWorker.map((item, index) => (
                <View style={styles.tag} key={index}>
                  <Text style={styles.tagText}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Label text="Select Status" required isDarkMode={isDarkMode} />
          <CustomDropDown
            data={status}
            selectedValue={selectedStatus}
            onValueChange={value => {
              setSelectedStatus(value);
              setErrors(prev => ({...prev, status: null}));
            }}
            placeholder={t('Status')}
            error={errors.status}
          />

          
          <Label text="Select Priority" required isDarkMode={isDarkMode} />
          <CustomDropDown
            data={priorities}
            selectedValue={selectedPriority}
            onValueChange={value => {
              setSelectedPriority(value);
              setErrors(prev => ({...prev, priority: null}));
            }}
            placeholder={t('Priority')}
            error={errors.priority}
          />

          <Label text="Upload Attachements" required isDarkMode={isDarkMode} />
          <TouchableOpacity
            onPress={() => CameraBottomSheetRef.current?.open()}
            style={styles.uploadContainer}>
            <Svgs.upload height={hp(5)} />
            <Text style={styles.uploadText}>{t('Upload Attachements')}</Text>
          </TouchableOpacity>
          {errors.upload && (
            <Text style={styles.errorText}>{errors.upload}</Text>
          )}

          {(selectedImages.length > 0 || selectedDocuments.length > 0) && (
            <View style={[styles.uoloadItemsContainer]}>
              {selectedImages.length > 0 &&
                selectedImages.map((item, index) => {
                  // Handle both old format (string) and new format (object)
                  const imagePath = typeof item === 'string' ? item : item.path;
                  return (
                    <View>
                      <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={() =>
                          setSelectedImages(
                            selectedImages.filter((_, i) => i !== index),
                          )
                        }>
                        <Svgs.Cross height={hp(1)} width={hp(1)} />
                      </TouchableOpacity>
                      <Image
                        source={{uri: imagePath}}
                        style={styles.image}
                        key={index}
                      />
                    </View>
                  );
                })}
              {selectedDocuments.length > 0 &&
                selectedDocuments.map((item, index) => (
                  <TouchableOpacity
                    onPress={() => viewSelectedDocument(item.uri)}
                    style={{marginTop: hp(1)}}>
                    <View style={styles.pdfContainer}>
                      <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={() =>
                          setSelectedDocuments(
                            selectedDocuments.filter((_, i) => i !== index),
                          )
                        }>
                        <Svgs.Cross height={hp(1)} width={hp(1)} />
                      </TouchableOpacity>
                      <Svgs.documentred height={hp(4)} width={hp(4)} />
                      <Text>{truncateText(item.name, 10)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <Label text="Set the date range" required isDarkMode={isDarkMode} />
          <View style={styles.dateRow}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('start');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>
                  {dateFrom
                    ? moment(dateFrom).format('YYYY-MM-DD')
                    : t('Date From')}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>

              {errors.dateFrom && (
                <Text style={styles.errorText}>{errors.dateFrom}</Text>
              )}
            </View>

            <Text style={styles.dashText}>–</Text>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('end');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>
                  {dateTo ? moment(dateTo).format('YYYY-MM-DD') : t('Date To')}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>
              {errors.dateTo && (
                <Text style={styles.errorText}>{errors.dateTo}</Text>
              )}
            </View>
          </View>

          {/* <Label text="Set the date range" required isDarkMode={isDarkMode} />
          <View style={styles.dateRow}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('start');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>
                  {dateFrom
                    ? moment(dateFrom).format('YYYY-MM-DD')
                    : t('Date From')}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>

              {errors.dateFrom && (
                <Text style={styles.errorText}>{errors.dateFrom}</Text>
              )}
            </View>

            <Text style={styles.dashText}>–</Text>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('end');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>
                  {dateTo ? moment(dateTo).format('YYYY-MM-DD') : t('Date To')}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>
              {errors.dateTo && (
                <Text style={styles.errorText}>{errors.dateTo}</Text>
              )}
            </View>
          </View> */}
          <Label text="Radius (Meters)" required isDarkMode={isDarkMode} />
          <NumericStepper
            value={RadiusValue}
            setValue={setRadiusValue}
            min={0}
            max={1000}
            containerStyle={{marginBottom: hp(1)}}
          />
          {errors.RadiusValue && (
            <Text style={styles.errorText}>{errors.RadiusValue}</Text>
          )}
        </View>

        <View style={{flex: 1, minHeight: hp(40)}}>
          <Label text="Select location" required isDarkMode={isDarkMode} />
          <GooglePlacesAutocomplete
            placeholder={t('Search Location')}
            minLength={2}
            fetchDetails={true}
            listViewDisplayed={shouldDisplayListView}
             textInputProps={{
              onFocus: () => setShouldDisplayListView(true),
              onBlur: () => setShouldDisplayListView(false),
            }}
            onPress={handlePlaceSelect}
            query={{key: GOOGLE_MAP_API_KEY, language: 'en'}}
            styles={{
              container: {
                position: 'absolute',
                width: '100%',
                zIndex: 1,
                alignItems: 'center',
                marginTop: hp(3),

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
              bottom: 180,
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

          <TxtInput
            value={address}
            setValue={value => setAddress(value)}
            leftSvg={<Svgs.MapIcon />}
            multiline={true}
            editable={false}
            style={{marginVertical: hp(2)}}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>

        
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onClose={() => setIsDatePickerVisible(false)}
          onConfirm={date => {
            logger.log('date', date, { context:'EditTask' });

            const formatted = moment(date).format('YYYY-MM-DD');
            if (datePickerType === 'start') {
              setDateFrom(date);
              if (errors.dateFrom) {
                setErrors(prev => ({...prev, dateFrom: null}));
              }
            } else {
              if (errors.dateTo) {
                setErrors(prev => ({...prev, dateTo: null}));
              }
              setDateTo(date);
            }
            setIsDatePickerVisible(false);
          }}
        />
      </ScrollView>

      <View style={styles.btnContainer}>
        <CustomButton
          text={'Update'}
          onPress={handleSave}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
          isLoading={isLoading}
        />
      </View>

      <CameraBottomSheet
        refRBSheet={CameraBottomSheetRef}
        onPick={handleImagePick}
        showDocument={true}
      />
    </View>
  );
}

const Label = ({text, required}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  return (
    <Text style={[dynamicStyles(isDarkMode, Colors).label]}>
      {t(text)}
      {required && <Text style={{color: 'red'}}> *</Text>}
    </Text>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'center',
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    header: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    label: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      paddingVertical: hp(1),
      marginBottom: hp(1),
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      marginBottom: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
      fontSize: RFPercentage(1.8),
    },
    comments: {
      height: hp(10),
      textAlignVertical: 'top',
    },
    errorText: {
      color: 'red',
      fontSize: RFPercentage(1.6),
      marginBottom: hp(1),
      fontFamily: Fonts.PoppinsRegular,
    },
    section: {
      marginBottom: hp(2),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      marginBottom: hp(0.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
      marginVertical: hp(2),
    },
    dateInput: {
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
    dateText: {
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
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',

      // gap: wp(1.5),
    },
    tag: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : '#579DFF',
      borderRadius: wp(1),
      paddingHorizontal: wp(1.5),
      paddingVertical: hp(1),
      marginLeft: wp(0.5),
    },
    tagText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.6),
      color: Colors.darkTheme.primaryTextColor,
    },
    uoloadItemsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,

      paddingHorizontal: wp(4),
      paddingBottom: hp(0.5),
      paddingTop: 0,
      flexWrap: 'wrap',
      marginBottom: hp(1),
    },
    closeIcon: {
      position: 'absolute',
      top: hp(0),
      right: wp(0),
      zIndex: 1000,
      backgroundColor: Colors.lightTheme.BorderGrayColor,
      padding: wp(1),
      borderRadius: wp(100),
    },
    image: {
      width: wp(20),
      height: hp(10),
      borderRadius: wp(2),
      marginRight: wp(2),
      marginTop: hp(1),
    },
    pdfContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3),
      marginRight: wp(3),
    },
    pdfText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.NunitoBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(0.5),
    },
    uploadText: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.NunitoBold,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginTop: hp(0.5),
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
  });
