import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';

import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Images} from '@assets/Images/Images';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {pxToPercentage} from '@utils/responsive';

import MarkValidPunchBottomSheet from '@components/BottomSheets/markAsValidBtmSheet';
import CustomButton from '@components/Buttons/customButton';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis, isValidUrl} from '@utils/Helpers';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';
import logger from '@utils/logger';

// ✅ Mock data
const DEFAULT_REGION = {
  latitude: 33.6520751,
  longitude: 73.0816881,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

const safeParseFloat = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const isValidCoordinate = (lat, lng) => {
  const latitude = safeParseFloat(lat);
  const longitude = safeParseFloat(lng);

  return (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const StatusRow = React.memo(({label, value, valueComponent, styles, t}) => (
  <View style={styles.row}>
    <Text style={styles.statusText}>{t(label)}</Text>
    {valueComponent ? (
      <View style={styles.value}>{valueComponent}</View>
    ) : (
      <Text style={styles.valueText}>{value}</Text>
    )}
  </View>
));

const SecondaryRow = React.memo(({label, value, valueComponent, styles, t}) => (
  <View style={styles.row}>
    <Text style={styles.Secondlabel}>{t(label)}</Text>
    {valueComponent ? (
      <View style={styles.value}>{valueComponent}</View>
    ) : (
      <Text style={styles.Secondvalue}>{value}</Text>
    )}
  </View>
));

const UnvalidatedWorkerAttendenceDetails = ({navigation, route}) => {
  const {id, date} = route.params;
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const mapRef = useRef(null);

  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const styles = useMemo(
    () => createStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  const validPunchSheetRef = useRef();
  const [details, setDetails] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);

  // ✅ New state for button action type
  const [selectedAction, setSelectedAction] = useState(null); // 'VALID' or 'INVALID'

  const handleSave = async comments => {
    await updateStatus(comments);
  };

  const fetchDetails = async setIsLoading => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/attendance/unvalidated/${id}`,
        'GET',
        setIsLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );
      if (ok && !data.error) {
        console.log(data)
        setDetails(data?.data);
      } else {
        ApiResponse(showAlert, data, language);
        return;
      }
    } catch (error) {
      logger.error('fetchDetails error:', error, { context: 'UnvalidatedWorkerAttendenceDetails' });
      showAlert('Something went wrong while fetching details', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchDetails(setIsLoading);
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleCancel = () => {
    logger.log('User cancelled', { context: 'UnvalidatedWorkerAttendenceDetails' });
    setSelectedAction(null); // Reset action on cancel
    // Handle cancel logic here
  };

  const processedLocation = useMemo(() => {
    if (!details?.location) return null;

    const lat = safeParseFloat(details.location.gpsLatitude);
    const lng = safeParseFloat(details.location.gpsLongitude);

    if (!isValidCoordinate(lat, lng)) {
      logger.warn('Invalid coordinates:', details.location, { context: 'UnvalidatedWorkerAttendenceDetails' });
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      locationText: details.location.locationText || 'Unknown Location',
    };
  }, [details?.location]);

  // ✅ Memoized region calculation
  const calculatedRegion = useMemo(() => {
    if (!processedLocation) return DEFAULT_REGION;

    return {
      latitude: processedLocation.latitude,
      longitude: processedLocation.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }, [processedLocation]);

  // ✅ Update region when location data changes
  useEffect(() => {
    if (processedLocation && mapRef.current) {
      const newRegion = calculatedRegion;

      // Add a small delay to ensure map is ready
      setTimeout(() => {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }, 100);
    }
  }, [processedLocation, calculatedRegion]);

  // ✅ Updated handlers for mark as valid/invalid
  const handleMarkAsValid = useCallback(() => {
    setSelectedAction('VALID');
    validPunchSheetRef.current?.open();
  }, []);

  const handleMarkAsInvalid = useCallback(() => {
    setSelectedAction('INVALID');
    validPunchSheetRef.current?.open();
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getReviewStatus = status => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      case 'APPROVED':
        return 'Approved';
      default:
        return status;
    }
  };

  const getStatus = status => {
    if (!status) return 'Unknown';

    switch (status) {
      case 'CLOCK_IN':
        return 'Clock In';
      case 'CLOCK_OUT':
        return 'Clock Out';
      case 'BREAK':
        return 'Break Start';
      case 'BACK_FROM_BREAK':
        return 'Break End';
      case 'ABSENT':
        return 'Absent';
      case 'PRESENT':
        return 'Present';
      case 'LATE_ARRIVAL':
        return 'Late Clock In';
      default:
        return status;
    }
  };

  const updateStatus = async comments => {
    const payload = {
      reviewStatus: selectedAction === 'VALID' ? 'APPROVED' : 'REJECTED',
      reviewNote: comments,
    };
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/attendance/punch/${id}`,
        'PATCH',
        setBtnLoading,
        payload,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);

      if (ok && !data?.error) {
        logger.log('Updated status:', data.data, { context: 'UnvalidatedWorkerAttendenceDetails' });
        fetchDetails(null);
      } else {
      }
    } catch (error) {
      logger.error('Error updating status:', error, { context: 'UnvalidatedWorkerAttendenceDetails' });
      showAlert('Something went wrong while updating status', 'error');
    }
  };

  const bottomSheetContent = useMemo(() => {
    if (selectedAction === 'VALID') {
      return {
        heading: 'Mark as Valid Punch',
        subheading: 'Add reason for marking the punch as valid?',
      };
    } else if (selectedAction === 'INVALID') {
      return {
        heading: 'Mark as Invalid Punch',
        subheading: 'Are you sure you want to mark this punch as invalid?',
      };
    }

    // Fallback based on current status
    return {
      heading:
        details?.validation?.reviewStatus === 'REJECTED'
          ? 'Mark as Valid Punch'
          : 'Mark as Invalid Punch',
      subheading:
        details?.validation?.reviewStatus === 'REJECTED'
          ? 'Add reason for marking the punch as valid?'
          : 'Are you sure you want to mark this punch as invalid?',
    };
  }, [selectedAction, details?.validation?.reviewStatus]);

  const renderWorkerInfo = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <StatusRow
          label="Employee Name"
          styles={styles}
          t={t}
          value={details?.worker?.fullName || 'N/A'}
        />

        <WorkerStatus
          name="Email"
          text={details?.worker?.email}
          nameTextStyle={styles.statusText}
        />

        <WorkerStatus
          name="Validation Status"
          status={
            details?.validation?.validationIssues?.length > 0 &&
            (details?.validation?.reviewStatus === 'REJECTED' ||
              details?.validation?.reviewStatus === 'PENDING')
              ? 'Invalid'
              : 'Valid'
          }
          nameTextStyle={styles.statusText}
        />
        <WorkerStatus
          name="Punch"
          status={getStatus(details?.actionType)}
          nameTextStyle={styles.statusText}
        />
      </View>
    ),
    [styles, t, details],
  );

  const renderAuditSection = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <Text style={[styles.Sectiontitle]}>{t('Audit')}</Text>
        <WorkerStatus
          name="Review Status"
          status={getReviewStatus(details?.validation?.reviewStatus)}
          nameTextStyle={styles.Secondlabel}
        />
        <SecondaryRow
          label="Face Matched"
          value={details?.validation?.faceMatched ? 'Yes' : 'No'}
          styles={styles}
          t={t}
        />
        <SecondaryRow
          label="Location Validated"
          value={details?.validation?.locationValidated ? 'Yes' : 'No'}
          styles={styles}
          t={t}
        />
      </View>
    ),
    [styles, t, details],
  );

  const renderSection = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <Text style={styles.Sectiontitle}>{t('Selfie')}</Text>
        <SecondaryRow
          label="Original"
          valueComponent={
            <TouchableOpacity
              onPress={() => {
                setIsImagePreviewVisible(true);
                setSelectedImage(details?.worker?.profileImage);
              }}>
              <Image
                source={
                  isValidUrl(details?.worker?.profileImage)
                    ? {uri: details?.worker?.profileImage}
                    : Images.placeholderImg
                }
                style={styles.selfieImage}
              />
            </TouchableOpacity>
          }
          styles={styles}
          t={t}
        />
        <SecondaryRow
          label="Scanned"
          valueComponent={
            <TouchableOpacity
              onPress={() => {
                setIsImagePreviewVisible(true);
                setSelectedImage(details?.evidence?.selfieUrl);
              }}>
              <Image
                source={
                  isValidUrl(details?.evidence?.selfieUrl)
                    ? {uri: details?.evidence?.selfieUrl}
                    : Images.placeholderImg
                }
                style={styles.selfieImage}
              />
            </TouchableOpacity>
          }
          styles={styles}
          t={t}
        />
      </View>
    ),
    [styles, t, details],
  );

  const renderMapSection = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.Sectiontitle,
            {marginLeft: wp(2), marginBottom: hp(1)},
          ]}>
          {t('Map View')}
        </Text>

        {processedLocation ? (
          // <MapView
          //   ref={mapRef}
          //   provider={PROVIDER_DEFAULT}
          //   style={styles.mapImage}
          //   region={calculatedRegion}
          //   showsUserLocation
          //   showsMyLocationButton={false}
          //   <Marker
          //     coordinate={{
          //       latitude: processedLocation.latitude,
          //       longitude: processedLocation.longitude,
          //     }}
          //     title={processedLocation.locationText}
          //   />
          // </MapView>

          <LeafLetMapComponent
            initialLat={processedLocation.latitude}
            initialLng={processedLocation.longitude}
            initialZoom={1}
            markers={[]}
            // height={400}
            style={styles.mapImage}
            initialMarkerTitle={'Current Location'}
            searchPlaceholder={t("Find a place...")}
            onLocationFound={result => {
              logger.log('Found:', result, { context: 'UnvalidatedWorkerAttendenceDetails' }, { context: 'UnvalidatedWorkerAttendenceDetails' }, { context: 'UnvalidatedWorkerAttendenceDetails' });
            }}
            showSearch={false}
          />
        ) : (
          <View style={[styles.mapImage, styles.mapPlaceholder]}>
            <Text style={styles.mapPlaceholderText}>
              {t('Location data not available')}
            </Text>
          </View>
        )}
      </View>
    ),
    [processedLocation, calculatedRegion, styles, t],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        <StackHeader
          title={date}
          headerTxtStyle={styles.headerTxtStyle}
          onBackPress={handleBackPress}
          headerStyle={styles.headerStyle}
        />
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader size={wp(10)} />
          </View>
        ) : (
          <View>
            {renderWorkerInfo()}
            {renderAuditSection()}
            {renderSection()}
            {renderMapSection()}
          </View>
        )}
      </ScrollView>

      
      {details?.validation?.reviewStatus === 'PENDING' ? (
        <View style={[styles.btnContainer, styles.rowBtnContainer]}>
          <CustomButton
            text="Mark as Valid"
            onPress={handleMarkAsValid}
            textStyle={styles.continueButtonText}
            containerStyle={[
              styles.continueButton,
              {
                width: wp(40),
              },
            ]}
            loading={selectedAction === 'VALID' && btnLoading}
          />
          <CustomButton
            text="Mark as Invalid"
            onPress={handleMarkAsInvalid}
            textStyle={styles.continueButtonText}
            containerStyle={[
              styles.continueButton,
              {
                width: wp(40),
              },
            ]}
            loading={selectedAction === 'INVALID' && btnLoading}
          />
        </View>
      ) : (
        <View style={[styles.btnContainer]}>
          <CustomButton
            text={
              details?.validation?.reviewStatus === 'REJECTED'
                ? 'Mark as Valid'
                : 'Mark as Invalid'
            }
            onPress={
              details?.validation?.reviewStatus === 'REJECTED'
                ? handleMarkAsValid
                : handleMarkAsInvalid
            }
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
            loading={btnLoading}
          />
        </View>
      )}

      
      <MarkValidPunchBottomSheet
        refRBSheet={validPunchSheetRef}
        onSave={handleSave}
        onCancel={handleCancel}
        heading={bottomSheetContent.heading}
        subheading={bottomSheetContent.subheading}
      />

      <ImagePreviewModal
        visible={isImagePreviewVisible}
        imageUri={selectedImage}
        onClose={() => setIsImagePreviewVisible(false)}
      />
    </View>
  );
};

// ✅ Styles
const createStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    scrollView: {flex: 1},
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: hp(2),
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: hp(40),
      flex: 1,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    image: {
      width: wp(8),
      height: hp(4),
      borderRadius: wp(4),
    },
    selfieImage: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(10),
    },
    workerInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 0.6,
    },
    workerName: {flex: 1},
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.8),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginVertical: hp(0.3),
      flexWrap: 'wrap',
    },
    valueText: {
      fontFamily: Fonts.NunitoSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      width: '55%',
      textAlign: 'right',
    },
    value: {
      width: '55%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    Sectiontitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    Secondlabel: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      flex: 1,
    },
    Secondvalue: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
      width: '55%',
    },
    mapImage: {
      width: '100%',
      height: hp(40),
      borderRadius: wp(2),
      overflow: 'hidden',
    },
    mapPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    mapPlaceholderText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    mapDateContainer: {
      position: 'absolute',
      top: hp(5),
      right: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(3),
      borderRadius: hp(1.5),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 3,
    },
    mapDateText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      marginRight: wp(1),
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
    rowBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
    },
  });

export default UnvalidatedWorkerAttendenceDetails;
