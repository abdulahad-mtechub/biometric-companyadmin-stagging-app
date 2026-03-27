import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {Images} from '@assets/Images/Images';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Svgs} from '@assets/Svgs/Svgs';
import {Fonts} from '@constants/Fonts';
import CustomButton from '@components/Buttons/customButton';
import { SCREENS } from '@constants/Screens';
import { useTranslation } from 'react-i18next';
import logger from '@utils/logger';

const FaceVerified = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
    const {t} = useTranslation();
  

  return (
    <View style={styles.container}>
      <View style={{paddingBottom: hp(2)}}>
        <Image source={Images.placeholderImg} style={styles.image} />
        <Svgs.checkedCircled style={styles.checkedCircled} />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>{t("Verification Completed")}</Text>
        <Text style={styles.subheading}>
          {t("Await admin approval to start managing companies and tracking earnings.")}
        </Text>
      </View>
      <View style={[styles.btnContainer]}>
        <CustomButton
          text={t('Continue')}
          onPress={() => {navigation.navigate(SCREENS.SUBSCRIPTION, {isLogin: true})}}
          textStyle={styles.continueButtonText}
          containerStyle={[
            styles.continueButton,

          ]}
        />
      </View>
    </View>
  );
};

export default FaceVerified;
const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(18),
    },
    image: {
      width: hp(45),
      height: hp(45),
      resizeMode: 'cover',
      borderRadius: wp(100),
      borderColor: '#06D188',
      borderWidth: 4,
      alignSelf: 'center',
    },
    checkedCircled: {
      position: 'absolute',
      bottom: hp(0),
      alignSelf: 'center',
      backgroundColor: '#ffffff',
      borderRadius: wp(100),
    },
    headerContainer: {
      marginTop: hp(3),
      alignItems: 'center',
    },
    heading: {
      fontSize: RFPercentage(3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
    },
    subheading: {
      fontSize: RFPercentage(2.1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      width: wp(80),
      marginTop: hp(2),
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingTop: hp(2),
      // flex: 1,
      justifyContent: 'flex-end',
      marginTop: hp(5),
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(5),
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
