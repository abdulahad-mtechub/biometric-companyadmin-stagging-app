import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import DatePicker from 'react-native-date-picker';
import {pxToPercentage} from '@utils/responsive';
import {Fonts} from '@constants/Fonts';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';
import logger from '@utils/logger';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
const ColorPickerModal = ({isVisible, onClose, onConfirm, mode}) => {
  const [date, setDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState();
  const {isDarkMode,Colors} = useSelector(store => store.theme)
  const {t} = useTranslation()
  
  
  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    container: {
      paddingVertical: 20,
      alignItems: 'center',
      borderRadius: 20,
    },
    minicontainer: {
      paddingVertical: 20,
      borderRadius: 20,
      width: '98%',
    //   alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: 10,
      textAlign:'center'
    },
    confirmButton: {
      borderTopWidth: 1,
      paddingTop: 10,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      alignItems: 'center',
    },
    confirmText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },

    buttonWrapper: {
      width: '100%',
      alignItems: 'center',
    },

    cancelButtonWrapper: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    cancelButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      paddingVertical: RFPercentage(pxToPercentage(15)),
      borderRadius: RFPercentage(pxToPercentage(18)),
      width: '100%',
      alignItems: 'center',
      // borderColor: '#f0f0f0',
    },
    cancelText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });

  const onSelectColor = ({hex}) => {
    // 'worklet';
    // do something with the selected color.
    setSelectedColor(hex);
    logger.log(hex, { context: 'ColorPickerModal' });
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.minicontainer}>
          <Text style={styles.title}>
            {t("Select Color")}
          </Text>
          <View style={{borderRadius: 40}}>
            <ColorPicker
            style={{paddingHorizontal:wp(2), marginBottom:hp(2), gap:hp(1)}}
            value="red"
            onChangeJS={onSelectColor}>
            {/* <Preview /> */}
            <Panel1 />
            <HueSlider />
            {/* <OpacitySlider /> */}
            {/* <Swatches /> */}
          </ColorPicker>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onConfirm(selectedColor)}>
              <Text style={styles.confirmText}>{t("Confirm")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            height: 6,
            width: '100%',
            backgroundColor: 'transparent',
          }}></View>
        <View style={styles.buttonWrapper}>
          <View style={styles.cancelButtonWrapper}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.9} onPress={onClose}>
              <Text style={styles.cancelText}>{t("Cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ColorPickerModal;
