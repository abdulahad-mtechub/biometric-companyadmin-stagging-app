import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import logger from '@utils/logger';

const SuccessBottomSheet = ({ refRBSheet, text, BtnText, onBtnPress, height,draggable=false , closeOnPressMask = false }) => {
  const { isDarkMode,Colors } = useSelector(store => store.theme);
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: hp(4),
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    message: {
      marginTop: hp(5),
      fontSize: RFPercentage(2.5),
      textAlign: 'center',
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
     btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp('80%'),
      alignSelf: 'center',
      marginTop: hp(2),
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
    },
  });

  return (
    <RBSheet
      ref={refRBSheet}
      height={height || hp(40)}
      openDuration={300}
      closeOnPressMask={closeOnPressMask}
      draggable={draggable}
      customStyles={{
        container: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: styles.container.backgroundColor,
        },
      }}>
      <View style={styles.container}>
        <Svgs.successAlert height={hp(10)} width={wp(35)} />
        <Text style={styles.message}>{t(text)}</Text>
        {
            BtnText  &&<CustomButton
            containerStyle={styles.btn}
            text={BtnText}
            textStyle={styles.btnText}
            onPress={onBtnPress}
          />
        }
        
      </View>
    </RBSheet>
  );
};

export default SuccessBottomSheet;
