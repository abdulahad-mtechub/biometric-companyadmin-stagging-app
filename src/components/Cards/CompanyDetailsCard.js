import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import {pxToPercentage} from '@utils/responsive';
import StatusBox from './StatusBox';
import {statusStyles} from '@constants/DummyData';
import {capitalize, isValidUrl} from '@utils/Helpers';
import {useAlert} from '@providers/AlertContext';
import logger from '@utils/logger';

const CompanyDetailsCard = ({data}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = createStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const {showAlert} = useAlert();

  const style = statusStyles[capitalize(data.subscriptionStatus)] || '';

  const hasZones =
    (data?.zones && data.zones.length > 0) ||
    (data?.countries && data.countries.length > 0) ||
    (data?.cities && data.cities.length > 0);

  const [imgSource, setImgSource] = useState(() => {
    // Initialize with company's logo or placeholder
    return data?.logo ? {uri: data.logo} : Images.borderdLogo;
  });

  // Update image source when data.logo changes
  useEffect(() => {
    if (data?.logo) {
      setImgSource({uri: data.logo});
    } else {
      setImgSource(Images.borderdLogo);
    }
  }, [data?.logo]);

  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };

  const handleOpenDocument = async document_url => {
    if (document_url) {
      try {
        const canOpen = await Linking.canOpenURL(document_url);
        if (canOpen) {
          await Linking.openURL(document_url);
        } else {
          showAlert('Cannot open this document', 'error');
        }
      } catch (error) {
        logger.log('Error opening document:', error, { context:'CompanyDetailsCard' });
        showAlert('Failed to open document', 'error');
      }
    } else {
      showAlert('Document URL not available', 'error');
    }
  };

  return (
    <View style={styles.card}>
      <Image
        source={imgSource}
        style={styles.logo}
        onError={() => setImgSource(Images.borderdLogo)}
      />

      <Section title={t('Company Details')} />
      <Row label={t('Legal Name')} value={data.legalName} />
      <Row label={t('Business Sector/Industry')} value={data.businessSector} />
      <Row label={t('Trade Name')} value={data.tradeName} />
      <Row label={t('Registration No.')} value={data.registrationNumber} />
      <Row label={t('Business Phone No.')} value={data.phone} />
      <Row label={t('Business Email')} value={data.email} />
      <Row label={t('Business Activity')} value={data.business_activity} />
      {data.company_document_url ? (
        <>
          <Text
            style={[
              rowStyles(isDarkMode, Colors).label,
              {marginBottom: hp(1)},
            ]}>
            {t('Company Document:')}
          </Text>
          <View style={styles.uploadContainer}>
            {isImageFile(data.company_document_url) ? (
              <Image source={{uri: data.company_document_url}} />
            ) : (
              <TouchableOpacity
                onPress={() => handleOpenDocument(data.company_document_url)}
                style={{
                  padding: wp(4),
                  backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.pdf />
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : null}

      <Section title={t('Address')} />
      <Row label={t('Account Executive')} value={data.name} />
      <Row label={t('Account Executive Email')} value={data.execEmail} />
      <Section title={t('Address')} />
      <Row label={t('Country')} value={data.country} />
      <Row label={t('Province')} value={data.province} />
      <Row label={t('City')} value={data.city} />
      <Row label={t('Postal Code')} value={data.postalCode} />
      <Row label={t('Street Address')} value={data.street} />

      <Section title={t('Selected Colors')} />
      <Text
        style={[rowStyles(isDarkMode, Colors).label, {marginBottom: hp(1)}]}>
        {t('Primary Color')}
      </Text>
      <View
        style={[styles.colorPickerInput, {backgroundColor: data.primary_color}]}
      />
      <Text
        style={[rowStyles(isDarkMode, Colors).label, {marginBottom: hp(1)}]}>
        {t('Secondary Color')}
      </Text>
      <View
        style={[
          styles.colorPickerInput,
          {backgroundColor: data.secondary_color},
        ]}
      />

      <Section title={t('Subscription Details')} />
      <Row
        label={t('Subscription Status')}
        valueComponent={
          <StatusBox
            backgroundColor={style.backgroundColor}
            color={style.color}
            status={capitalize(data.subscriptionStatus)}
            icon={style.icon}
          />
        }
      />
      <Row
        label={t('Subscription Plan')}
        value={capitalize(data.subscription)}
      />
      <Row label={t('Region Code')} value={data.Region_Code} />

      {/* {hasZones && (
        <>
          <Section title={t('Target Zone / Region')} />

          {data?.zones?.length > 0 && (
            <Row
              label={t('Zone')}
              valueComponent={<Tags tags={data.zones} />}
            />
          )}

          {data?.countries?.length > 0 && (
            <Row
              label={t('Countries')}
              valueComponent={<Tags tags={data.countries} />}
            />
          )}

          {data?.cities?.length > 0 && (
            <Row
              label={t('Cities')}
              valueComponent={<Tags tags={data.cities} />}
            />
          )}
        </>
      )} */}
    </View>
  );
};

const Section = ({title}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  return (
    <Text
      style={{
        fontFamily: Fonts.PoppinsBold,
        fontSize: RFPercentage(pxToPercentage(16)),
        marginVertical: hp(1.2),
        color: isDarkMode
          ? Colors.darkTheme.primaryTextColor
          : Colors.lightTheme.primaryTextColor,
      }}>
      {title}
    </Text>
  );
};

const Row = ({label, value, valueComponent}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = rowStyles(isDarkMode, Colors);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {valueComponent ? (
        <View style={styles.value}>{valueComponent}</View>
      ) : (
        <Text style={styles.valueText}>{value}</Text>
      )}
    </View>
  );
};

const Tags = ({tags}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const styles = tagStyles(isDarkMode, Colors);

  return (
    <View style={styles.container}>
      {tags.map((tag, index) => (
        <View style={styles.tag} key={index}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
};

const TrialBadge = ({label}) => (
  <View
    style={{
      backgroundColor: '#FFA55D',
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.4),
      borderRadius: wp(1),
      flexDirection: 'row',
    }}>
    <Svgs.trial />
    <Text
      style={{
        fontSize: RFPercentage(1.6),
        fontFamily: Fonts.NunitoMedium,
        color: '#fff',
      }}>
      {label}
    </Text>
  </View>
);

const createStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      margin: wp(4),
    },
    logo: {
      width: hp(12),
      height: hp(12),
      borderRadius: hp(4),
      alignSelf: 'center',
      marginBottom: hp(2),
    },
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
    colorPickerInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp('4%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp('0.3%'),
      borderRadius: wp(3),
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
      paddingVertical: hp(0.5),
      height: hp(6),
    },
  });

const rowStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginVertical: hp(0.3),
      flexWrap: 'wrap',
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      width: '45%',
    },
    valueText: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      width: '55%',
      textAlign: 'right',
    },
    value: {
      width: '55%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
  });

const tagStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    tag: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : '#579DFF',
      borderRadius: wp(1),
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.8),
      margin: wp(0.5),
    },
    tagText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: '#fff',
    },
  });

export default CompanyDetailsCard;
