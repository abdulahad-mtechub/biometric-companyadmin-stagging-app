import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '@constants/themeColors';
import {Fonts} from '@constants/Fonts';
import { useTranslation } from 'react-i18next';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const ReusableBottomSheet = ({
  refRBSheet,
  height,
  bgColor,
  sheetTitle = 'Select An Option',
  iconContainerStyle,
  options = [],
  isScrollable = true
}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const backgroundColor = bgColor
    ? bgColor
    : isDarkMode
    ? Colors.darkTheme.backgroundColor
    : Colors.lightTheme.backgroundColor;

  const styles = dynamicStyles(isDarkMode);

  // Calculate height with safe area for iOS
  const sheetHeight = height
    ? height + (Platform.OS === 'ios' ? insets.bottom : 0)
    : hp('35%') + (Platform.OS === 'ios' ? insets.bottom : 0);

  return (
    <RBSheet
      ref={refRBSheet}
      height={sheetHeight}
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
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        },
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={isScrollable}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t(sheetTitle)}</Text>
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
              {option.icon && <View style={[styles.icon, iconContainerStyle]}>{option.icon}</View>}
            <View style={styles.textWrapper}>
              <Text style={styles.optionTitle}>{t(option.title)}</Text>
              {option.description && (
                <Text style={styles.optionDesc}>{t(option.description)}</Text>
              )}
            </View>
            <Icon
              name="chevron-right"
              size={RFPercentage(3)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor
              }
            />
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

export default ReusableBottomSheet;
