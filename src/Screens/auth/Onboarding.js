import {
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import {Fonts} from '@constants/Fonts';
import PagerView from 'react-native-pager-view';
import {SCREENS} from '@constants/Screens';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Svgs} from '@assets/Svgs/Svgs';
import {Images} from '@assets/Images/Images';
import i18n from '@translations/i18n';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';
import {setOnboardingShown} from '../../redux/Slices/authSlice';
const Onboarding = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {language} = useSelector(store => store.auth);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const pages = [
    {
      image:
        language.value === 'es'
          ? Images.Onboarding1Spanish
          : Images.Onboarding1,
      title: t('Manage Your \n Workforce'),
      subtitle: t(
        'Approve employees, create schedules, and set work locations for accurate attendance.',
      ),
    },
    {
      image:
        language.value === 'es'
          ? Images.Onboarding2Spanish
          : Images.Onboarding2,
      title: t('Attendance & Tasks in Real Time'),
      subtitle: t(
        'Track clock-ins with facial recognition and GPS verification, and assign location-based tasks.',
      ),
    },
    {
      image:
        language.value === 'es'
          ? Images.Onboarding3Spanish
          : Images.Onboarding3,
      title: t('Requests, Documents & Expenses'),
      subtitle: t(
        'Review leave requests, handle expense claims, and exchange documents securely.',
      ),
    },
  ];
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef(null);
  const handleContinue = () => {
    if (currentPage < pages.length - 1) {
      pagerRef.current.setPage(currentPage + 1);
    } else {
      dispatch(setOnboardingShown(false));
      navigation.reset({
        index: 0,
        routes: [{name: SCREENS.SIGNUP}],
      });
    }
  };

  const lastPage = currentPage === pages.length - 1;
  const secondPage = currentPage === 1;
  const onPageSelected = e => {
    setCurrentPage(e.nativeEvent.position);
  };

  const styles = dynamicStyles(isDarkMode, Colors);

  const renderPaginationDots = () => {
    return (
      <View style={[styles.paginationContainer]}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  currentPage === index
                    ? Colors.lightTheme.primaryColor
                    : '#5E5F60',
                width: currentPage === index ? wp(10) : wp(2),
                height: hp(0.8),
                borderRadius: wp(4),
              },
            ]}
          />
        ))}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={Colors.lightTheme.backgroundColor}
        barStyle={'dark-content'}
      />

      <PagerView
        style={[{height: '100%'}]}
        initialPage={0}
        onPageSelected={onPageSelected}
        ref={pagerRef}>
        {pages.map((page, index) => (
          <View key={index} style={styles.imgContainer}>
            <View style={styles.Background}>
              <Image
                source={page.image}
                style={{width: wp(90), height: hp(75), resizeMode: 'contain'}}
              />
            </View>
            <View style={styles.curvedImageL}>
              <View style={{height: hp(26)}}>
                <Text
                  style={[styles.text, Platform.OS === 'ios' ? {marginTop: hp(5.5)} : {marginTop: hp(3)}]}
                  adjustsFontSizeToFit
                  >
                  {page.title}
                </Text>
                {page.subtitle && (
                  <Text
                  style={[styles.subHeading, Platform.OS === 'ios' ? {marginTop: hp(2.5)} : {marginTop: 0}]}
                    adjustsFontSizeToFit
                    >
                    {page.subtitle}
                  </Text>
                )}
              </View>
              <View>{renderPaginationDots()}</View>
            </View>
          </View>
        ))}
      </PagerView>
      <View style={styles.btnContainer}>
        {!lastPage && (
          <TouchableOpacity
            style={[styles.btn, {backgroundColor: 'transparent'}]}
            onPress={() => {
              dispatch(setOnboardingShown(false));
              navigation.navigate(SCREENS.LOGIN);
            }}>
            <Text
              style={[
                styles.btnText,
                {color: Colors.lightTheme.secondryBtn.TextColor},
              ]}>
              {t('Skip')}
            </Text>
          </TouchableOpacity>
        )}
        <CustomButton
          containerStyle={[
            styles.btn,
            {width: wp(50)},
            lastPage && {width: wp(90)},
          ]}
          text={t('Next')}
          textStyle={styles.btnText}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
};

export default Onboarding;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },

    imgContainer: {
      flex: 1,
    },
    Background: {
      alignItems: 'center',
      marginTop: hp(6),
    },
    curvedImageL: {
      position: 'absolute',
      bottom: 0,
      width: wp(100),
      height: hp(40),
      alignItems: 'center',
      alignSelf: 'center',
      borderStartStartRadius: wp(10),
      borderTopEndRadius: wp(10),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#F1F1FF',
      paddingHorizontal: wp(1),
      overflow: 'hidden',
    },
    text: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontSize: RFPercentage(pxToPercentage(29)),
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
      marginTop: hp(3),
      width: wp(95),
      alignSelf: 'center',
    },
    subHeading: {
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(16)),
      textAlign: 'center',
      marginTop: hp(1.8),
      fontFamily: Fonts.NunitoRegular,
      paddingHorizontal: wp(4),
      width: wp(95),
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      borderRadius: wp(2.5),
      marginHorizontal: wp(0.5),
    },
    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.7),
      borderRadius: wp(4),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(30),
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      borderWidth: 1,
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
    },
    btnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: hp(2),
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      position: 'absolute',
      width: '100%',
      bottom: 10,
    },
  });
