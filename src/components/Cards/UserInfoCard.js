import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {Images} from '@assets/Images/Images';
import {useTranslation} from 'react-i18next';
import {isValidUrl} from '@utils/Helpers';
import logger from '@utils/logger';

const UserInfoCard = ({user}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={styles.cardContainer}>
      <Image
        source={!imageError ? {uri: user.image} : Images.placeholderImg}
        style={styles.profileImage}
        onError={() => setImageError(true)}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('Personal Details')}</Text>
        <Row
          label={t('Full Name')}
          value={user.fullName}
          isDarkMode={isDarkMode}
        />
        {user.dob && (
          <Row
            label={t('Date Of Birth (DOB)')}
            value={user.dob}
            isDarkMode={isDarkMode}
          />
        )}

        <Row label={t('Email')} value={user.email} isDarkMode={isDarkMode} />
        <Row label={t('Phone No')} value={user.phone} isDarkMode={isDarkMode} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('Address')}</Text>
        <Row
          label={t('Country')}
          value={user.country}
          isDarkMode={isDarkMode}
        />
        <Row
          label={t('Province')}
          value={user.province}
          isDarkMode={isDarkMode}
        />
        <Row label={t('City')} value={user.city} isDarkMode={isDarkMode} />
        <Row
          label={t('Postal Code')}
          value={user.postalCode}
          isDarkMode={isDarkMode}
        />
        <Row
          label={t('Street Address')}
          value={user.street}
          isDarkMode={isDarkMode}
        />
      </View>
    </View>
  );
};

const Row = ({label, value}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const styles = rowStyles(isDarkMode, Colors);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(2),
      padding: wp(3),
      marginHorizontal: wp(4),
      marginVertical: wp(1.5),
    },
    profileImage: {
      width: hp(10),
      height: hp(10),
      borderRadius: hp(5),
      alignSelf: 'center',
      marginBottom: hp(2),
    },
    section: {
      marginTop: hp(1),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
  });

const rowStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(0.3),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
        maxWidth: wp(50),
        textAlign:'right'
    },
  });

export default UserInfoCard;
