import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import {Fonts} from '@constants/Fonts';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {pxToPercentage} from '@utils/responsive';
import CustomButton from '@components/Buttons/customButton';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import logger from '@utils/logger';
import {SCREENS} from '@constants/Screens';

const EmailVerified = ({navigation, route}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const {navigateFrom} = route.params;
  logger.log({navigateFrom}, { context: 'EmailVerified' });

  const onLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{name: SCREENS.LOGIN}],
    });
  };
  const onDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{name: SCREENS.DASHBOARD}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Svgs.emailVerified height={80} width={80} />

        <Text style={styles.title}>{t('Email Verified')}</Text>

        <Text style={styles.description}>
          {t(
            'Await admin approval to start managing companies and tracking earnings.',
          )}
        </Text>
      </View>

      {navigateFrom === SCREENS.COMPANYINVITATION ? (
        <View style={styles.btnContainer}>
         
          <CustomButton
            text={'Logout'}
            onPress={onLogout}
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton, {flex:1}]}
          />
        </View>
      ) : (
        <View style={styles.btnContainer}>
          <CustomButton
            text={'Logout'}
            onPress={onLogout}
            textStyle={[styles.continueButtonText, styles.logOutBtnText]}
            containerStyle={[styles.continueButton, styles.logOutBtn]}
          />
          <CustomButton
            text={'Go to Dashboard'}
            onPress={onDashboard}
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
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
      marginTop: hp(4),
      marginBottom: hp(2),
    },
    description: {
      fontSize: RFPercentage(pxToPercentage(18)),
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
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
      width: '60%',
    },
    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    logOutBtn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderWidth: 2,
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      width: '40%',
    },
    logOutBtnText: {
      color: isDarkMode
        ? Colors.darkTheme.secondryBtn.TextColor
        : Colors.lightTheme.secondryBtn.TextColor,
    },
  });

export default EmailVerified;
