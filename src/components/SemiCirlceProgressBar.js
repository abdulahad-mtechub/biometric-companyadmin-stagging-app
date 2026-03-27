import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Svg, { Circle } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const SemiCircleProgress = ({progress = 41.92}) => {
  const radius = wp(40);
  const strokeWidth = wp(4);
  const padding = strokeWidth * 2; // padding to prevent stroke from being clipped
  const adjustedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * adjustedRadius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {language} = useSelector(store => store.auth);

  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Svg
        width={radius * 2 + padding}
        height={radius + padding}
        viewBox={`0 0 ${radius * 2 + padding} ${radius + padding}`}>
        <Circle
          cx={(radius * 2 + padding) / 2}
          cy={radius + padding / 2}
          r={adjustedRadius}
          stroke="#D7DCE0"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          rotation={-180}
          originX={(radius * 2 + padding) / 2}
          originY={radius + padding / 2}
        />
        <Circle
          cx={(radius * 2 + padding) / 2}
          cy={radius + padding / 2}
          r={adjustedRadius}
          stroke="#006EC2"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation={-180}
          originX={(radius * 2 + padding) / 2}
          originY={radius + padding / 2}
        />
      </Svg>

      {/* Center emoji circle */}
      <View
        style={[
          styles.centerCircle,
         
        ]}>
        <Svgs.smileyBlue />
      </View>

      <Text
        style={[
          styles.ChartPercentageText,
          language.value === 'es' && {
            fontSize: RFPercentage(pxToPercentage(25)),
          },
        ]}>
        {progress.toFixed(2)}% {t('Paid')}
      </Text>
      <Text style={styles.ChartSubHeading}>
        {t('You have')} “$11,500” {t('more to Pay')}
      </Text>
    </View>
  );
};

export default SemiCircleProgress;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: hp(2),
      marginBottom: hp(2),
    },
    centerCircle: {
      position: 'absolute',
      backgroundColor: '#D7DCE0',
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(10),
      height: wp(10),
      borderRadius: wp(100),
      padding: wp(13),
      top: wp(20),
    },
    emojiContainer: {
      backgroundColor: '#006EC2',
      borderRadius: wp(6),
      width: wp(12),
      height: wp(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    emoji: {
      fontSize: RFPercentage(3),
      color: '#fff',
    },
    ChartSubHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    ChartPercentageText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(30)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });
