import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import logger from '@utils/logger';
// import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const SuccessModal = ({ visible, onClose, text }) => {
    const {isDarkMode,Colors} = useSelector(store => store.theme);
    



    const styles = StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalContainer: {
          width: '80%',
          height: '37%',
          backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
          borderRadius: 16,
          paddingVertical: 30,
          paddingHorizontal: 20,
          alignItems: 'center',
          position: 'relative',
        },
        closeIcon: {
          position: 'absolute',
          top: 15,
          right: 23,
          zIndex: 1,
        },
       
        message: {
          marginTop: 20,
          fontSize: RFPercentage(2.5),
          textAlign: 'center',
          fontFamily: Fonts.PoppinsSemiBold,
          color: isDarkMode?Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,
        },
      });
      
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          {/* <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Svgs.grayCross/>
          </TouchableOpacity> */}

          <Svgs.successAlert height={hp(18)} width={wp(35)}/>
          

          {/* Message */}
          <Text style={styles.message}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
