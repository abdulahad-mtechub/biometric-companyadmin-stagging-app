import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Colors} from '@constants/themeColors';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Svgs} from '@assets/Svgs/Svgs';
import {setLanguage} from '@redux/Slices/authSlice';
import i18n from '@translations/i18n';
import logger from '@utils/logger';

const LanguageBtmSheet = ({
  refRBSheet,
  bgColor,
  isScrollable = true,
}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {language} = useSelector(store => store.auth);

  const backgroundColor = bgColor
    ? bgColor
    : isDarkMode
    ? Colors.darkTheme.backgroundColor
    : Colors.lightTheme.backgroundColor;

  const styles = dynamicStyles(isDarkMode);

  const options = [
    {
      icon: <Svgs.edit height={hp(4)} />,
      title: 'English',
      description: 'Select edit to edit the invite.',
      onPress: () => {
        const appLanguage = {label: 'English', value: 'en'};
        dispatch(setLanguage(appLanguage));
        i18n.changeLanguage(appLanguage.value);
        refRBSheet.current?.close();
      },
    },
    {
      icon: <Svgs.deleteBlueOutline height={hp(4)} />,
      title: 'Spanish',
      description: 'Select delete to delete invite.',
      onPress: () => {
        const appLanguage = {label: 'Spanish', value: 'es'};
        dispatch(setLanguage(appLanguage));
        i18n.changeLanguage(appLanguage.value);
        refRBSheet.current?.close();
      },
    },
  ];

  return (
    <RBSheet
      ref={refRBSheet}
      height={hp('20%')}
      openDuration={300}
      draggable={false}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopLeftRadius: wp('6%'),
          borderTopRightRadius: wp('6%'),
          backgroundColor: backgroundColor,
          paddingHorizontal: wp('5%'),
          paddingTop: hp('2%'),
        },
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={isScrollable}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('Select Your Preferred Language')}
          </Text>
          <TouchableOpacity onPress={() => refRBSheet.current.close()}>
            <Icon
              name="x"
              size={RFPercentage(3)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor
              }
            />
          </TouchableOpacity>
        </View>

        {/* Option Items */}
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionContainer, index === 0 && {borderTopWidth: 0}]}
            onPress={option.onPress}>
            <MaterialCommunityIcons
              name={language.label === option.title ? 'radiobox-marked' : 'radiobox-blank'}
              size={RFPercentage(3)}
              color={Colors.lightTheme.primaryColor}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.optionTitle}>{t(option.title)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </RBSheet>
  );
};

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('1%'),
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(20)),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('1.5%'),
      borderTopWidth: 0.5,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    icon: {
      width: wp('10%'),
      justifyContent: 'center',
      alignItems: 'center',
      // paddingTop: hp('0.5%'),

      paddingHorizontal: wp('6.5%'),
      paddingVertical: hp('1%'),
      borderRadius: wp(100),
    },
    textWrapper: {
      flex: 1,
      marginLeft: wp('4%'),
    },
    optionTitle: {
      fontSize: RFPercentage(pxToPercentage(17)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
    optionDesc: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginTop: hp('0.2%'),

      fontFamily: Fonts.PoppinsRegular,
    },
  });

export default LanguageBtmSheet;
