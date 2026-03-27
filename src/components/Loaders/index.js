import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import logger from '@utils/logger';

const FullLoader = ({loading, size, color, bgColor}) => {
      const { isDarkMode,Colors } = useSelector(store => store.theme);
  return (
    <Modal visible={loading} transparent={true}>
      <View
        style={[{backgroundColor: bgColor}, styles.container]}>
        <ActivityIndicator  size={size || "large"} color={color || isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor} />
      </View>
    </Modal>
  );
};

export default FullLoader;

const styles = StyleSheet.create({
  container : {
    height: hp(100),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',

  }
});
