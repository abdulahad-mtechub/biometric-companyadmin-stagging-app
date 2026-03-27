import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import CustomButton from '@components/Buttons/customButton';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Svgs} from '@assets/Svgs/Svgs';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const TxtInput = (
  {
    style,
    rightIcon,
    placeholder,
    rightIconSize,
    rightIconColor,
    keyboardType,
    onChangeText,
    value,
    onBlur,
    multiline,
    leftIcon,
    leftIconSize,
    leftIconColor,
    secureTextEntry,
    onFocus,
    onPress,
    error,
    placeholderTextColor,
    rightIconPress,
    rightIconContainerStyle,
    isEmoji,
    containerStyle,
    svg,
    autoFocus,
    rightIconFocusColor,
    selectableColor,
    inputStyle,
    leftSvg,
    btnText,
    leftBtnStyle,
    leftBtnPress,
    editable,
    focusedStyle,
    maxLength,
    numberOfLines,
    rightSvg,
    rightComponent,
    onSubmitEditing,
    
  },
  ref,
) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setFocused] = useState(false);
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const {language} = useSelector(store => store.auth);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const themeColors = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  return (
    <TouchableOpacity onPress={onPress} disabled={editable === false? false: true} style={[{}, style]}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: wp('4%'),
            borderColor: themeColors.BorderGrayColor,
            borderWidth: wp('0.3%'),
            borderRadius: wp(3),
            backgroundColor: isDarkMode
              ? Colors.darkTheme.input
              : 'transparent',
            paddingVertical: hp(0.5),
          },
          containerStyle,
          isFocused && {
            borderColor: themeColors.primaryColor,
            backgroundColor: `${themeColors.primaryColor}20`,
          },
          isFocused && focusedStyle,
          error && {
            borderColor: '#FF3B30',
            backgroundColor: isDarkMode ? '#FF3B3020' : '#FF3B3010',
          },
        ]}>
        {/* Left Icon / SVG */}
        {(leftSvg || leftIcon) && (
          <CustomButton
            svg={leftSvg}
            icon={leftIcon}
            iconColor={leftIconColor}
            iconSize={leftIconSize}
            containerStyle={leftBtnStyle}
            onPress={leftBtnPress}
          />
        )}

        {/* Optional inline SVG */}
        {svg && svg}

        {/* TextInput - full flex */}
        <TextInput
          ref={ref}
          style={[
            language.value === 'es'
              ? {
                  fontSize: RFPercentage(pxToPercentage(13)),
                }
              : {
                  fontSize: RFPercentage(pxToPercentage(15)),
                },
            {
              flex: 1,

              fontFamily: Fonts.PoppinsRegular,
              color: themeColors.primaryTextColor,
              paddingVertical: wp('2%'), // helps prevent height stretching
            },
            inputStyle,
            (leftIcon || leftSvg) && {marginLeft: wp(2)},
          ]}
          placeholder={t(placeholder)}
          placeholderTextColor={
            placeholderTextColor || themeColors.QuaternaryText
          }
          selectionColor={selectableColor || `${themeColors.primaryColor}40`}
          keyboardType={keyboardType}
          onFocus={() => (onFocus ? onFocus() : setFocused(true))}
          onBlur={() => (onBlur ? onBlur() : setFocused(false))}
          onChangeText={onChangeText}
          value={value}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          // onPress={onPress}
          editable={editable}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
        />

        {/* Password toggle */}
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            {isPasswordVisible ? (
              <Svgs.passwordEyeOpenL />
            ) : (
              <Svgs.passwordEyeL />
            )}
          </TouchableOpacity>
        )}

        {/* Right Icon / SVG / Button */}
        {(rightIcon || rightSvg) && (
          <CustomButton
            icon={rightIcon}
            iconSize={rightIconSize}
            iconColor={rightIconColor}
            svg={rightSvg}
            onPress={rightIconPress}
            containerStyle={rightIconContainerStyle}
            text={btnText}
            textStyle={{
              fontSize: RFPercentage(pxToPercentage(14)),
              fontFamily: Fonts.PoppinsRegular,
              color: themeColors.primaryTextColor,
              marginLeft: wp('2%'),
            }}
          />
        )}

        {rightComponent && rightComponent}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            color: 'red',
            fontFamily: Fonts.PoppinsRegular,
            fontSize: RFPercentage(pxToPercentage(14)),
            paddingLeft: wp('2%'),
            marginTop: hp(0.5),
            marginBottom: hp(0.5),
          }}>
          {typeof error === 'string' ? t(error) : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default TxtInput;
