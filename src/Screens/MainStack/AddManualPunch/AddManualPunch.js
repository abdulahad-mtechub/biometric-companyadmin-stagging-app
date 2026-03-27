import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import { Fonts } from '@constants/Fonts';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import logger from '@utils/logger';

const AddManualPunch = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);
  const [step, setStep] = useState(1);

  const BackHandler = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };
  const handleContinue = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }else{
      navigation.goBack();
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.backArrowContainer}>
        <MaterialCommunityIcons
          name={'close'}
          size={RFPercentage(4)}
          color={
            isDarkMode
              ? Colors.darkTheme.secondryTextColor
              : Colors.lightTheme.iconColor
          }
          onPress={BackHandler}
        />

        <Text style={[styles.heading]}>{t("Add Manual Punch")}({step}/2)</Text>
      </View>
      {step === 1 ? <Step1 /> : <Step2 />}

      <View style={styles.btnContainer}>
        {step === 1 ? (
          <CustomButton
            text={'Next'}
            onPress={handleContinue}
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
          />
        ) : (
          <View style={{flexDirection: 'row'}}>
            <CustomButton
              text={'Back'}
              onPress={BackHandler}
              textStyle={styles.SkipButtonText}
              containerStyle={[styles.SkipButton, {width: '35%'}]}
            />
            <CustomButton
              text={'Save'}
              onPress={handleContinue}
              textStyle={styles.continueButtonText}
              containerStyle={[styles.continueButton, { width: "50%", marginLeft: wp(7)  }]}
            />
          </View>
        )}
      </View>

     
    </View>
  );
};

export default AddManualPunch;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
      paddingTop: hp(2),
    },
    backArrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      paddingHorizontal: wp(2),
      marginBottom: hp(2),
    },
    heading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      width: wp(80),
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsMedium,
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,

      paddingVertical: wp(4),
      paddingHorizontal: wp(4),
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
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    SkipButton: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#f1f2f4',
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    SkipButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryBtn.TextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
  });
