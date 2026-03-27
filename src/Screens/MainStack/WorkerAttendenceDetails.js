import moment from 'moment';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Marker} from 'react-native-maps';
import {useSelector} from 'react-redux';

import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import LeafLetMapComponent from '@components/Maps/LeafLetMap';
import {Fonts} from '@constants/Fonts';
import {useAlert} from '@providers/AlertContext';
import {isValidUrl} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';
import logger from '@utils/logger';

const DEFAULT_REGION = {
  latitude: 33.6520751,
  longitude: 73.0816881,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

const StatusRow = memo(
  ({label, value, valueComponent, styles, t, isSpanish}) => (
    <View style={styles.row}>
      <Text
        style={[styles.statusText, isSpanish && {fontSize: RFPercentage(1.5)}]}>
        {t(label)}
      </Text>
      {valueComponent ? (
        <View style={styles.value}>{valueComponent}</View>
      ) : (
        <Text
          style={[
            styles.valueText,
            isSpanish && {fontSize: RFPercentage(pxToPercentage(13))},
          ]}>
          {value}
        </Text>
      )}
    </View>
  ),
);

const SecondaryRow = memo(({label, value, valueComponent, styles, t}) => (
  <View style={styles.row}>
    <Text style={styles.Secondlabel}>{t(label)}</Text>
    {valueComponent ? (
      <View style={styles.value}>{valueComponent}</View>
    ) : (
      <Text style={styles.Secondvalue}>{t(value)}</Text>
    )}
  </View>
));

const SectionHeader = memo(({icon, title, styles, t}) => (
  <View
    style={[styles.row, {justifyContent: 'flex-start', alignItems: 'center'}]}>
    {icon}
    <Text style={[styles.Sectiontitle, {marginLeft: wp(2), marginBottom: 0}]}>
      {t(title)}
    </Text>
  </View>
));

const MapMarkers = memo(({gpsCoordinates}) => {
  if (!Array.isArray(gpsCoordinates) || gpsCoordinates.length === 0) {
    return null;
  }

  return (
    <>
      {gpsCoordinates.map((item, index) => {
        if (!item?.lat || !item?.lng || isNaN(item.lat) || isNaN(item.lng)) {
          return null;
        }

        return (
          <Marker
            key={`marker_${index}_${item.status || index}`}
            coordinate={{
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lng),
            }}
            title={item.status || 'Unknown Punch'}
          />
        );
      })}
    </>
  );
});

const getIcon = actionType => {
  const icons = {
    CLOCK_IN: <Svgs.checkInSvg />,
    CLOCK_OUT: <Svgs.checkOutSvg />,
    BREAK_START: <Svgs.BreakSvg />,
    BREAK_END: <Svgs.BreakSvg />,
  };
  return icons[actionType] || <Svgs.BreakSvg />;
};

const getHeading = actionType => {
  const headings = {
    CLOCK_IN: 'Clock In',
    CLOCK_OUT: 'Clock Out',
    BREAK_START: 'Break Start',
    BREAK_END: 'Break End',
  };
  return headings[actionType] || 'Dummy';
};

const getRows = item => {
  const baseRows = {
    CLOCK_IN: [
      {label: 'Clock-In', value: moment(item.occurredAt).local().format("hh:mm A")},
      {label: 'Clock-In Location', value: item?.location?.locationText},
      {label: 'Image', value: item?.evidence?.selfieUrl},
      {label: 'Face Validation', value: item?.validation?.faceMatched? 'Valid' : 'Invalid'},
      {label: 'Location Validation', value: item?.validation?.locationValidated? 'Valid' : 'Invalid'},
      {label: 'Punch Status', value: item?.validation?.punchStatus},
    ],
    CLOCK_OUT: [
      {label: 'Clock-Out', value: moment(item.occurredAt).local().format("hh:mm A")},
      {label: 'Clock-Out Location', value: item?.location?.locationText},
      {label: 'Image', value: item?.evidence?.selfieUrl},
      {label: 'Face Validation', value: item?.validation?.faceMatched? 'Valid' : 'Invalid'},
      {label: 'Location Validation', value: item?.validation?.locationValidated? 'Valid' : 'Invalid'},
      {label: 'Punch Status', value: item?.validation?.punchStatus},

    ],
    BREAK_START: [
      {
        label: 'Break Start',
        value: moment(item.occurredAt).local().format("hh:mm A"),
      },
      {label: 'Break Location', value: item?.location?.locationText},
      {label: 'Image', value: item?.evidence?.selfieUrl},
      {label: 'Face Validation', value: item?.validation?.faceMatched? 'Valid' : 'Invalid'},
      {label: 'Location Validation', value: item?.validation?.locationValidated? 'Valid' : 'Invalid'},
      {label: 'Punch Status', value: item?.validation?.punchStatus},
    ],
    BREAK_END: [
      {label: 'Break End', value: moment(item.occurredAt).local().format("hh:mm A")},
      {label: 'Break Location', value: item?.location?.locationText},
      {label: 'Image', value: item?.evidence?.selfieUrl},
      {label: 'Face Validation', value: item?.validation?.faceMatched? 'Valid' : 'Invalid'},
      {label: 'Location Validation', value: item?.validation?.locationValidated? 'Valid' : 'Invalid'},
      {label: 'Punch Status', value: item?.validation?.punchStatus},
    ],
  };

  return (
    baseRows[item.actionType] || [{label: 'Status', value: item.actionType}]
  );
};

const getStatus = status => {
  if (!status) return 'Unknown';

  const statusMap = {
    HAS_ISSUES: 'Invalid',
    OVERTIME: 'Overtime',
    EARLY_OUT: 'Early Out',
    HALF_DAY: 'Half Day',
    ABSENT: 'Absent',
    PRESENT: 'Present',
    LATE_ARRIVAL: 'Late Clock In',
    LATE_AND_EARLY_OUT: 'Late & EarlyOut',
  };

  return statusMap[status] || status;
};

const WorkerAttendanceDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const {item} = route.params;
  console.log(item)

  const isSpanish = language.value === 'es';
  const [region, setRegion] = useState(DEFAULT_REGION);

  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const mapRef = useRef(null);

  const styles = useMemo(
    () => createStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  const gpsCoordinates = useMemo(
    () =>
      item?.punches?.map(punch => ({
        lat: punch.location?.gpsLatitude,
        lng: punch.location?.gpsLongitude,
        status: getHeading(punch?.actionType),
      })) || [],
    [item?.punches],
  );

  
  useEffect(() => {
    if (
      Array.isArray(gpsCoordinates) &&
      gpsCoordinates.length > 0 &&
      gpsCoordinates[0] &&
      !isNaN(gpsCoordinates[0].lat) &&
      !isNaN(gpsCoordinates[0].lng)
    ) {
      const first = gpsCoordinates[0];

      try {
        const newRegion = {
          latitude: first.lat,
          longitude: first.lng,
          latitudeDelta: 10,
          longitudeDelta: 10,
        };

        console.log({newRegion})
        setRegion(newRegion);
      } catch (error) {
        logger.warn('Error animating map:', error, { context: 'WorkerAttendenceDetails' });
      }
    }
  }, [gpsCoordinates]);

  const PunchSection = memo(({icon, title, rows, styles, t}) => (
    <View style={styles.statusContainer}>
      <SectionHeader icon={icon} title={title} styles={styles} t={t} />
      <FlatList
        data={rows}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) =>
          item.label === 'Image' ? (
            <SecondaryRow
              label="Image"
              valueComponent={
                <TouchableOpacity onPress={() => {
                  setIsImagePreviewVisible(true);
                  setSelectedImage(item.value)}} >
                  <Image
                    source={
                      isValidUrl(item.value)
                        ? {uri: item.value}
                        : Images.placeholderImg
                    }
                    style={{width: wp(8), height: wp(8), borderRadius: wp(10)}}
                  />
                </TouchableOpacity>
              }
              styles={styles}
              t={t}
            />
          ) : (
            <SecondaryRow
              label={item.label}
              value={item.value}
              styles={styles}
              t={t}
            />
          )
        }
      />
    </View>
  ));

  const handleViewFullMap = useCallback(() => {
    // navigation.navigate(SCREENS.MAP);
    showAlert('Under Development', 'success');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderWorkerInfo = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <StatusRow
          label="Employee Name"
          styles={styles}
          t={t}
          value={item?.worker?.fullName}
          isSpanish={isSpanish}
        />

        <WorkerStatus
          name="Email"
          text={item?.worker?.email}
          nameTextStyle={[
            styles.statusText,
            isSpanish && {
              fontSize: RFPercentage(1.3),
              fontFamily: Fonts.PoppinsSemiBold,
            },
          ]}
          isSpanish={isSpanish}
        />

        <WorkerStatus
          name="Status"
          status={getStatus(item?.statusBadge?.status)}
          nameTextStyle={[
            styles.statusText,
            isSpanish && {
              fontSize: RFPercentage(1.3),
              fontFamily: Fonts.PoppinsSemiBold,
            },
          ]}
          isSpanish={isSpanish}
        />

        <StatusRow
          label="Working Hours"
          value={item?.attendance?.totalHours}
          styles={styles}
          t={t}
          isSpanish={isSpanish}
        />
      </View>
    ),
    [styles, t, item, isSpanish],
  );

  const renderMapSection = useCallback(
    () => (
      <View style={styles.statusContainer}>
        <Text
          style={[styles.Sectiontitle, {marginLeft: wp(2), marginBottom: 0}]}>
          {t('Map View')}
        </Text>
        {/* <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.mapImage}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}>
          <MapMarkers gpsCoordinates={gpsCoordinates} />
        </MapView> */}

        <LeafLetMapComponent
          // ref={mapRef}
          initialLat={region.latitude}
          initialLng={region.longitude}
          initialZoom={13}
          markers={gpsCoordinates}
          // onMapPress={coordinates => {
          //   setSelectedLocation({
          //     latitude: coordinates.lat,
          //     longitude: coordinates.lng,
          //     address: '',
          //     name: '',
          //   });
          // }}
          // height={400}
          style={styles.mapImage}
          initialMarkerTitle={'Current Location'}
          searchPlaceholder={t("Find a place...")}
          onLocationFound={result => {
            // logger.log('Found:', result, );
          }}
          showSearch={false}
        />
      </View>
    ),
    [region, styles, t, handleViewFullMap, gpsCoordinates],
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        <StackHeader
          title={moment(item?.date).format('DD MMM, YYYY')}
          headerTxtStyle={styles.headerTxtStyle}
          onBackPress={handleBackPress}
          headerStyle={styles.headerStyle}
        />

        <FlatList
          data={item?.punches}
          ListHeaderComponent={renderWorkerInfo()}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={ gpsCoordinates.length > 0 && renderMapSection()}
          renderItem={({item}) => (
            <PunchSection
              icon={getIcon(item.actionType)}
              title={getHeading(item.actionType)}
              rows={getRows(item)}
              styles={styles}
              t={t}
            />
          )}
        />
      </View>

      <ImagePreviewModal
        visible={isImagePreviewVisible}
        imageUri={selectedImage}
        onClose={() => setIsImagePreviewVisible(false)}
      />
    </View>
  );
};

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

export default memo(WorkerAttendanceDetails);
