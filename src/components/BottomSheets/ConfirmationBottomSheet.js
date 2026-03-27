import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import CustomButton from '@components/Buttons/customButton';
import { useTranslation } from 'react-i18next';
import { pxToPercentage } from '@utils/responsive';
import { useSelector } from 'react-redux';
import logger from '@utils/logger';

const ConfirmationBottomSheet = forwardRef(
  (
    {
      icon: Icon,
      title,
      description,
      onConfirm,
      onCancel,
      confirmText = 'Yes',
      cancelText = 'No',
      height = 320,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef(null);
    const {t} = useTranslation()
    const {isDarkMode, Colors} = useSelector(store => store.theme);

    const styles = dynamicStyles(isDarkMode, Colors);
    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.open(), // ✅ Correct method
      close: () => bottomSheetRef.current?.close(), // ✅ Correct method
    }));

    return (
      <RBSheet
        ref={bottomSheetRef}
        height={height}
        closeOnDragDown={true}
        closeOnPressMask={false}
        customStyles={{
          container: {
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            borderTopLeftRadius: wp(5),
            borderTopRightRadius: wp(5),
          },
        }}>
        <View style={styles.container}>
          {
            Icon &&<View style={styles.iconContainer}>{Icon}</View>
          }
          

          <Text
            style={[
              styles.title,
              {
                color: isDarkMode
                  ? Colors.darkTheme.primaryTextColor
                  : Colors.lightTheme.primaryTextColor,
              },
            ]}>
            {t(title)}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor,
              },
            ]}>
            {t(description)}
          </Text>

          <View style={styles.buttonRow}>

            <CustomButton
              text={t(cancelText)}
              onPress={onCancel}
              textStyle={[styles.continueButtonText, {color: Colors.darkTheme.primaryColor}]}
              containerStyle={[styles.continueButton, styles.BackButton]}
            />
            <CustomButton
              text={t(confirmText)}
              onPress={onConfirm}
              textStyle={styles.continueButtonText}
              containerStyle={[styles.continueButton]}
            />
          </View>
        </View>
      </RBSheet>
    );
  },
);

export default ConfirmationBottomSheet;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: wp(5),

      justifyContent: 'center',
    },
    iconContainer: {
      alignSelf: 'center',
      marginBottom: hp(2),
    },
    title: {
      textAlign: 'center',
      fontSize: RFPercentage(pxToPercentage(21)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
    },
    description: {
      textAlign: 'center',
      fontSize: RFPercentage(pxToPercentage(15)),
      fontFamily: Fonts.PoppinsRegular,
      marginBottom: hp(3),
      paddingHorizontal: wp(3),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: wp(0),
    },
    cancelButton: {
      backgroundColor: Colors.lightTheme.secondryColor,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(7),
      borderRadius: wp(2),
    },
    confirmButton: {
      backgroundColor: Colors.primaryColor,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(7),
      borderRadius: wp(2),
    },
   
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(2),
      flex: 1,
    },
    continueButtonText: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    BackButton: {
      borderWidth: 1,
      borderColor: Colors.darkTheme.primaryColor,
      backgroundColor: 'transparent',
    },
  });
