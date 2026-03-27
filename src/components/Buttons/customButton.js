import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import Loader from '@components/Loaders/loader';
import logger from '@utils/logger';

const CustomButton = ({
  containerStyle,
  borderColor,
  onPress,
  mode,
  text,
  textStyle,
  txtColor,
  icon,
  iconSize,
  iconColor,
  pressedRadius,
  svg,
  img,
  imgStyle,
  isLoading,
  vertical,
  rightSvg,
  contentContainer,
  loaderColor,
  LoaderSize,
  keey,
  modeContainerStyle,
  disabled
}) => {
  const { isDarkMode,Colors } = useSelector(store => store.theme);
  const {t} = useTranslation();
  const renderContent = () => {
    
    if (isLoading) {
      return <Loader color={Colors.darkTheme.primaryTextColor} size={LoaderSize} loading={isLoading} />;
    }

    if (icon) {
      return (
        <>
          <Icon name={icon} size={iconSize} color={iconColor} />
          {text && <Text style={[textStyle, txtColor, mode && {color: isDarkMode? Colors.darkTheme.secondryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,    fontSize: RFPercentage(1.8),
    fontFamily: Fonts.PoppinsSemiBold,}]}>{t(text)}</Text>}
        </>
      );
    }

    if (rightSvg) {
      return (
        <View
          style={[
            contentContainer,
          ]}>
          {text && <Text style={[textStyle, txtColor, mode && {color: isDarkMode? Colors.darkTheme.secondryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,    fontSize: RFPercentage(1.8),
              fontFamily: Fonts.PoppinsSemiBold,}]}>{t(text)}</Text>}
          {rightSvg}
        </View>
      );
    }

    if (text && !svg && !icon) {
      return <Text style={[textStyle, txtColor, mode && {color: isDarkMode? Colors.darkTheme.secondryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor ,   fontSize: RFPercentage(1.8),
        fontFamily: Fonts.PoppinsSemiBold,}]}>{t(text)}</Text>;
    }

    if (svg) {
      return (
        <View
          style={[!vertical && {flexDirection: 'row', alignItems: 'center'}]}>
          {svg}
          {text && <Text style={[textStyle, txtColor, mode && {color: isDarkMode? Colors.darkTheme.secondryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,     fontSize: RFPercentage(1.8),
    fontFamily: Fonts.PoppinsSemiBold,}]}>{t(text)}</Text>}
        </View>
      );
    }

    if (img) {
      return <Image source={img} style={imgStyle} />;
    }

    return null;
  };

  return (
    <Pressable
      onPress={onPress}
      key={keey}
      style={({pressed}) => [
        containerStyle,
        mode && {
          backgroundColor: 'transparent',
          borderColor: isDarkMode? Colors.darkTheme.secondryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
          borderWidth: 1,
        },
        pressed && {opacity: 0.5, borderRadius: pressedRadius},
      ]}
      disabled={disabled || isLoading}>
      {renderContent()}
    </Pressable>
  );
};

export default CustomButton;


