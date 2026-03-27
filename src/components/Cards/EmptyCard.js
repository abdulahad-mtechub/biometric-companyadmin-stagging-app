import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Svgs} from '@assets/Svgs/Svgs';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const EmptyCard = ({icon, heading, subheading, containerStyle}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  return (
    <View style={[{alignItems: 'center', paddingVertical: 30}, containerStyle]}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.emptyTextHeading}>{t(heading)}</Text>
      <Text style={styles.emptyText}>{t(subheading)}</Text>
    </View>
  );
};

export default EmptyCard;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    iconContainer: {},
    emptyTextHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(18)), // Reduced from 26 to 20
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      marginTop: hp(0.5), // Reduced from hp(2)
    },
    emptyText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(12)), // Reduced from 16 to 14
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
  });
