import moment from 'moment';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
import {isValidUrl} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';
import logger from '@utils/logger';
import StatusBox from '../../components/Cards/StatusBox';

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
      <Text style={styles.Secondvalue}>{value}</Text>
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
  return headings[actionType] || 'Punch';
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
    CLOCK_IN: 'Clock In',
    CLOCK_OUT: 'Clock Out',
    BREAK_START: 'Break Start',
    BREAK_END: 'Break End',
  };
  return statusMap[status] || status;
};

const TodayLogsAttendenceDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const {item} = route.params;
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  logger.log(JSON.stringify(item, null, 2), {
    context: 'TodayLogsAttendenceDetails',
  });

  const isSpanish = language.value === 'es';
  const [region, setRegion] = useState(DEFAULT_REGION);

  const styles = useMemo(
    () => createStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );

  const PunchSection = memo(({icon, title, rows, styles, t}) => (
    <View style={styles.statusContainer}>
      <SectionHeader icon={icon} title={title} styles={styles} t={t} />
      {rows.map((row, index) =>
        row.label === 'Image' ? (
          <SecondaryRow
            key={index}
            label="Image"
            valueComponent={
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(row.value);
                  setIsImagePreviewVisible(true);
                }}>
                <Image
                  source={
                    isValidUrl(row.value)
                      ? {uri: row.value}
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
            key={index}
            label={row.label}
            value={row.value}
            valueComponent={
              row.label === 'Status' ? <StatusBox status={row.value} /> : null
            }
            styles={styles}
            t={t}
          />
        ),
      )}
    </View>
  ));

  useEffect(() => {
    if (
      item?.location?.coordinates &&
      !isNaN(item.location.coordinates.lat) &&
      !isNaN(item.location.coordinates.lng)
    ) {
      setRegion({
        latitude: item.location.coordinates.lat,
        longitude: item.location.coordinates.lng,
        latitudeDelta: 10,
        longitudeDelta: 10,
      });
    }
  }, [item]);

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
          valueComponent={
            <TouchableOpacity
              onPress={() => {
                setIsImagePreviewVisible(true);
                setSelectedImage(item.profileImage);
              }}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={
                  isValidUrl(item.profileImage)
                    ? {uri: item.profileImage}
                    : Images.placeholderImg
                }
                style={{
                  width: wp(8),
                  height: wp(8),
                  borderRadius: wp(10),
                  marginRight: wp(2),
                }}
              />
              <Text style={styles.statusText}>{item.fullName}</Text>
            </TouchableOpacity>
          }
          isSpanish={isSpanish}
        />

        <WorkerStatus
          name="Email"
          text={item?.email}
          nameTextStyle={styles.statusText}
          isSpanish={isSpanish}
        />
        <WorkerStatus
          name="Department"
          text={item?.department}
          nameTextStyle={styles.statusText}
          isSpanish={isSpanish}
        />
      </View>
    ),
    [styles, t, item, isSpanish],
  );

  const renderMapSection = useCallback(
    () => (
      <View style={[styles.statusContainer, {flex: 1}]}>
        <Text
          style={[styles.Sectiontitle, {marginLeft: wp(2), marginBottom: 0}]}>
          {t('Map View')}
        </Text>
        <LeafLetMapComponent
          initialLat={region?.latitude}
          initialLng={region?.longitude}
          initialZoom={1}
          style={styles.mapImage}
          initialMarkerTitle={'Current Location'}
          showSearch={false}
        />
      </View>
    ),
    [region, styles, t],
  );

  return (
    <View style={styles.scrollView}>
      <StackHeader
        title={moment(item.lastPunchTime).format('DD MMM, YYYY')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={handleBackPress}
        headerStyle={styles.headerStyle}
      />
      {renderWorkerInfo()}
      <PunchSection
        icon={getIcon(item.lastAction)}
        title={getHeading(item.lastAction)}
        rows={
          item.lastStatus === 'ABSENT'
            ? [
                {
                  label: 'Status',
                  value: getStatus(item.lastStatus),
                },
                {
                  label: 'Image',
                  value: item?.evidencePhoto,
                },
              ]
            : [
                {
                  label: 'Time',
                  value: moment(item.lastPunchTime).format('hh:mm A'),
                },
                {
                  label: 'Status',
                  value: getStatus(item.lastStatus),
                },
                {
                  label: 'Location',
                  value: item?.location?.text || 'Not Available',
                },
                {
                  label: 'Image',
                  value: item?.evidencePhoto,
                },
              ]
        }
        styles={styles}
        t={t}
      />

      {renderMapSection()}

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
      height: hp(100),
      borderRadius: wp(2),
      overflow: 'hidden',
    },
  });

export default memo(TodayLogsAttendenceDetails);
