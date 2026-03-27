import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  I18nManager,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import {SCREENS} from '@constants/Screens';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const UpgradeFeatureView = ({
  navigation,
  featureName = 'Paid',
  backIcon = false,
}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const isRTL = I18nManager.isRTL;

  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let count = 0;
    const maxCount = 2; // run twice

    const runAnimation = () => {
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        count += 1;
        if (count < maxCount) {
          runAnimation(); // run again until it reaches 2
        }
      });
    };

    runAnimation();

    return () => shineAnim.stopAnimation();
  }, [shineAnim]);

  // Interpolated position for shine
  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-wp(40), wp(32)],
  });

  return (
    <View style={styles.upgradeContainer}>
      {/* Semi-transparent overlay */}
      <View style={[styles.absolute, styles.overlayBackground]} />

      {/* Glass morphism container */}
      <View
        style={[
          styles.glassContainer,
          {
            backgroundColor: isDarkMode
              ? 'rgba(30,30,30,0.6)'
              : 'rgba(255,255,255,0.9)',
          },
        ]}>
        {backIcon && (
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => navigation.goBack()}>
            <Feather
              name={isRTL ? 'chevron-left' : 'chevron-left'}
              size={hp(4)}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        )}

        <View style={styles.upgradeContent}>
          <Feather
            name="eye-off"
            size={hp(13)}
            color={'#000'}
            style={styles.upgradeIcon}
          />

          <Text
            style={[
              styles.upgradeTitle,
              {
                color: isDarkMode
                  ? Colors.darkTheme.primaryTextColor
                  : Colors.lightTheme.primaryTextColor,
              },
            ]}>
            {t('Upgrade to Premium')}
          </Text>

          <Text
            style={[
              styles.upgradeDescription,
              {
                color: isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor,
              },
            ]}>
            {t('Access') +
              ` ${t(featureName)} ` +
              t('features by upgrading your subscription plan')}
          </Text>

          {/* ✨ Animated Shining Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.upgradeButton,
              {backgroundColor: Colors.darkTheme.primaryColor},
            ]}
            onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}>
            <Animated.View
              style={[styles.shineOverlay, {transform: [{translateX}]}]}
            />
            <Text style={styles.upgradeButtonText}>{t('View Plans')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UpgradeFeatureView;

const styles = StyleSheet.create({
  upgradeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlayBackground: {},
  glassContainer: {
    flex: 1,
    padding: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconContainer: {
    position: 'absolute',
    top: hp(5),
    left: wp(5),
    zIndex: 10,
  },
  upgradeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  upgradeIcon: {
    marginBottom: hp(3),
  },
  upgradeTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: RFPercentage(pxToPercentage(22)),
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  upgradeDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: RFPercentage(pxToPercentage(14)),
    textAlign: 'center',
    marginBottom: hp(4),
    lineHeight: hp(2.5),
  },
  upgradeButton: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    minWidth: wp(40),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: RFPercentage(pxToPercentage(16)),
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 2,
  },
  shineOverlay: {
    position: 'absolute',
    width: wp(10), // wider streak
    height: hp(12),
    top: -hp(1),
    backgroundColor: 'rgba(255,255,255,0.5)',
    transform: [{rotate: '35deg'}], // increased rotation to make it more italic
    zIndex: 1,
    opacity: 0.6, // optional: softer light
  },
});
