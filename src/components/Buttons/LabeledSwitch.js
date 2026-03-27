import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import CustomSwitch from './CustomSwitch';
import {pxToPercentage} from '@utils/responsive';
import {useTranslation} from 'react-i18next';
import Loader from '@components/Loaders/loader';
import logger from '@utils/logger';

const LabeledSwitch = ({
  title,
  subtitle,
  value,
  onValueChange,
  Icon,
  GoRight,
  OnRightPress,
  titleTextStyle,
  loading
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={styles.toggleContainer}>
      {Icon && <View style={styles.iconContainer}>{Icon}</View>}
      <View style={styles.toggleContent}>
        <Text
          style={[
            styles.toggleTitle,
            Icon && styles.titleWithIcon, // Apply extra style if Icon is passed
            titleTextStyle,
          ]}>
          {t(title)}
        </Text>
        {subtitle && <Text style={styles.toggleSubtitle}>{t(subtitle)}</Text>}
      </View>
      {GoRight ? (
        <TouchableOpacity onPress={OnRightPress} style={{padding: wp(1.5)}}>
          {isDarkMode ? <Svgs.chevronRight /> : <Svgs.chevronRightL />}
        </TouchableOpacity>
      ) : (
        <>
         { loading && <Loader size="small" />}
          <CustomSwitch value={value} onValueChange={onValueChange} />
        </>

       
      )}
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(2),
     
    },
    iconContainer: {
      marginRight: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleContent: {
      flex: 1,
      marginRight: wp(8),
    },
    toggleTitle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    titleWithIcon: {
      fontSize: RFPercentage(pxToPercentage(17)), // Increased size
      fontFamily: Fonts.PoppinsSemiBold, // Bolder weight
    },
    toggleSubtitle: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginTop: hp(0.5),
    },
  });

export default LabeledSwitch;
