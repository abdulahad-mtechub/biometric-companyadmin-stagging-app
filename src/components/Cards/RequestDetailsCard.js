import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import {Images} from '@assets/Images/Images';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const RequestDetailsCard = ({
  details,
  showFrom,
  heading,
  onPathPress,
  showChevron = true,
  imageLabel,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const Row = ({label, value, type}) => (
    <View style={styles.row}>
      <Text style={styles.label}>{t(label)}</Text>
      <View style={styles.valueContainer}>
        {Array.isArray(value) ? (
          value.map((line, index) => (
            <Text key={index} style={styles.value}>
              {line}
            </Text>
          ))
        ) : type === 'link' ? (
          <TouchableOpacity
            onPress={() => {
              onPathPress && onPathPress(value);
            }}>
            <Text
              style={[
                styles.value,
                {
                  color: Colors.lightTheme.primaryColor,
                  textDecorationLine: 'underline',
                },
              ]}>
              {value}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>{t(value)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.rowViewSb}>
        <Text style={styles.title}>{t(heading) || t('Request Details')}</Text>

        {/* {showChevron && <Svgs.ChevronDownFilled height={wp(7)} width={wp(7)} />} */}
      </View>
      {showFrom && (
        <View style={[styles.row]}>
          <Text style={styles.label}>{t(imageLabel || 'From')}</Text>
          <View
            style={[styles.valueContainer, {flexDirection: 'row', flex: 0.7}]}>
            <Image source={Images.placeholderImg} style={styles.profileImage} />
            <Text style={styles.value}>{'Brooklyn Simmons'}</Text>
          </View>
        </View>
      )}

      {details.map((item, index) => (
        <Row
          key={index}
          label={t(item.label)}
          value={item.value}
          type={item.type}
        />
      ))}
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      margin: wp(4),
    },
    title: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'center',
      //   marginBottom: hp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      flex: 1,
      // backgroundColor:'red'
    },
    valueContainer: {
      flex: 1.2,
      alignItems: 'flex-end',
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
    },
    rowViewSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1.2),
    },
    profileImage: {
      width: wp(5),
      height: wp(5),
      borderRadius: wp(5),
      marginRight: wp(2),
    },
  });

export default RequestDetailsCard;
