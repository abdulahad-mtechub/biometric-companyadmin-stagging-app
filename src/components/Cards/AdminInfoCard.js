import React, {useEffect, useState} from 'react';
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
import {Images} from '@assets/Images/Images';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import {capitalize, isValidUrl} from '@utils/Helpers';
import {Svgs} from '@assets/Svgs/Svgs';
import logger from '@utils/logger';

const AdminInfoCard = ({user}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const [imgSource, setImgSource] = useState(() => {
    return user?.profileImage ? {uri: user.profileImage} : Images.placeholderImg;
  });

  useEffect(() => {
    if (user?.profileImage) {
      setImgSource({uri: user.profileImage});
    } else {
      setImgSource(Images.placeholderImg);
    }
  }, [user?.profileImage]);

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
        logger.log('Error opening document:', error, { context:'AdminInfoCard' });
        showAlert('Failed to open document', 'error');
      }
    } else {
      showAlert('Document URL not available', 'error');
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Image
        source={imgSource}
        style={styles.profileImage}
        onError={() => setImgSource(Images.placeholderImg)}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('Admin Details')}</Text>
        <Row
          label={t('Name')}
          value={user.fullName}
          isDarkMode={isDarkMode}
          Colors={Colors}
        />

        <Row
          label={t('Email')}
          value={user.email}
          isDarkMode={isDarkMode}
          Colors={Colors}
        />
        <Row
          label={t('Phone No')}
          value={user.phone}
          isDarkMode={isDarkMode}
          Colors={Colors}
        />
        <Row
          label={t('Date of birth (DOB)')}
          value={user.dob}
          isDarkMode={isDarkMode}
          Colors={Colors}
        />
        <Row
          label={t('Administrator Type')}
          value={capitalize(user.administrator_type)}
          isDarkMode={isDarkMode}
          Colors={Colors}
        />

        {user.admin_document_url ? (
          <>
            <Text
              style={[
                rowStyles(isDarkMode, Colors).label,
                {marginBottom: hp(1)},
              ]}>
              {t('Admin Document:')}
            </Text>
            <View style={styles.uploadContainer}>
              {isImageFile(user.admin_document_url) ? (
                <Image source={{uri: user.admin_document_url}} />
              ) : (
                <TouchableOpacity
                  onPress={() => handleOpenDocument(user.admin_document_url)}
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
        {user.Designation != 'N/A' && (
          <Row
            label={t('Designation')}
            value={user.Designation}
            isDarkMode={isDarkMode}
            Colors={Colors}
          />
        )}
      </View>
    </View>
  );
};

const Row = ({label, value, isDarkMode, Colors}) => {
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
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
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
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

export default AdminInfoCard;
