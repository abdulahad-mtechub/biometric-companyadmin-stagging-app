import React from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const ErrorScreen = ({onRefresh, onReportIssue, isFromHome}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Svgs.warningAlert height={80} width={80} />

        <Text style={styles.title}>
          {isFromHome
            ? t('Error from Home Screen')
            : t('Something Went Wrong!')}
        </Text>

        <Text style={styles.description}>
          {isFromHome
            ? t('An error occurred in the Home screen. Please try again.')
            : t('There was a problem processing the request.')}
          {'\n'}
          {t('Please try again.')}
        </Text>

        <View onPress={onReportIssue} style={styles.reportButton}>
          <Text style={styles.reportText}>{t('To report an issue,')}</Text>
          <Text style={styles.linkText}>{t('Click here')}</Text>
        </View>
      </View>

      <View style={styles.btnContainer}>
        <CustomButton
          text={'Refresh'}
          onPress={onRefresh}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>
    </SafeAreaView>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors?.darkTheme.backgroundColor
        : Colors?.lightTheme.backgroundColor,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    title: {
      fontSize: RFPercentage(pxToPercentage(26)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(2),
    },
    description: {
      fontSize: RFPercentage(pxToPercentage(17)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
      fontFamily: Fonts.NunitoRegular,
    },
    reportButton: {
      flexDirection: 'row',
    },
    reportText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      textAlign: 'center',
    },
    linkText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      textDecorationLine: 'underline',
      fontFamily: Fonts.NunitoBold,
      marginLeft: 5,
    },

    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });

export default ErrorScreen;
