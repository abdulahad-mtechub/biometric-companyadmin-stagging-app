import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import { useSelector } from 'react-redux';
import { pxToPercentage } from '@utils/responsive';
import { RFPercentage } from 'react-native-responsive-fontsize';
import logger from '@utils/logger';

const LabeledCheckbox = ({title, value, onToggle, containerStyle}) => {
    const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={[styles.checkbox, value && styles.checkedBox]}
        onPress={onToggle}>
        {value && (
          <Icon name="check" size={wp(3.5)} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LabeledCheckbox;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  title: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: RFPercentage(pxToPercentage(14)),
    color: isDarkMode? Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,
    // flex: 1,
    flexWrap: 'wrap',
    width: '90%',
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderRadius: 3,
    borderWidth: 2,
     borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.darkTheme.primaryColor,
    borderColor: Colors.darkTheme.primaryColor,
  },
});