import React, {useEffect, useState} from 'react';
import {Dimensions, Text, StyleSheet, View, Pressable, Platform} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useAlert} from '@providers/AlertContext';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import {Svgs} from '@assets/Svgs/Svgs';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import logger from '@utils/logger';
const {width} = Dimensions.get('window');

const DynamicAlert = () => {
  const {t} = useTranslation();
  const {alert, hideAlert} = useAlert();
  const {isDarkMode} = useSelector(store => store.theme);

  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(() => {
        hideAlert();
      }, alert.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [alert.visible]);

  if (!alert.visible) return null;

  const getShadowStyle = () => {
    switch (alert.type) {
      case 'success':
        return styles.successShadow;
      case 'error':
        return styles.errorShadow;
      default:
        return {};
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,

      zIndex: 1000,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    text: {
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.7),
      marginLeft: wp(2),
      width: '90%',
      flexWrap: 'wrap',
    },
    descriptionText: {
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.5),
    },
    icon: {
      width: width * 0.06,
      height: width * 0.06,
      top: hp(5),
    },
    success: {
      borderColor: '#4CAF50',
      borderWidth: 1,
      backgroundColor: '#edffee',
    },
    error: {
      borderColor: Colors.error,
      backgroundColor: '#ffeeed',
    },
    successShadow: {
      shadowColor: Colors.success,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    errorShadow: {
      shadowColor: Colors.error,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
  });
  const Content = (
    <View
      style={[
        styles[alert.type],
        getShadowStyle(),
        {padding: width * 0.045, margin: width * 0.04, borderRadius: 10},
      ]}>
      <View style={styles.content}>
        {alert.type === 'error' ? (
          <Svgs.errorAlert height={25} width={25} />
        ) : (
          <Svgs.successAlert height={25} width={25} />
        )}

        <Text
          style={[
            styles.text,
            alert.type === 'error' ? {color: Colors.error} : {color: '#0CC25F'},
          ]}>
          {t(alert.message)}
        </Text>
      </View>

      {alert.description && (
        <Text
          style={[
            styles.descriptionText,
            alert.type === 'error' ? {color: Colors.error} : {color: '#0CC25F'},
          ]}>
          {t(alert.description)}
        </Text>
      )}
    </View>
  );



  return (
    <Animatable.View
      animation={alert.type === 'success' ? 'slideInDown' : 'bounceInRight'}
      duration={500}
      style={[styles.container, Platform.OS === 'ios' && {top: 40}]}>
      {alert.onPress ? (
        <Pressable onPress={alert.onPress}>{Content}</Pressable>
      ) : (
        Content
      )}
    </Animatable.View>
  );
};

export default DynamicAlert;
