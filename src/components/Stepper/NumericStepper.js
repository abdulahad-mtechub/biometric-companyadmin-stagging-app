import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {t} from 'i18next';
import logger from '@utils/logger';

const NumericStepper = ({
  value,
  setValue,
  min = 0,
  max = 100,
  containerStyle,
  error,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);

  const increment = () => {
    if (value < max) setValue(value + 1);
  };

  const decrement = () => {
    if (value > min) setValue(value - 1);
  };

  const handleChange = text => {
    // Allow only numeric values
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') {
      setValue(0);
    } else {
      const num = parseInt(numericValue, 10);
      if (num >= min && num <= max) {
        setValue(num);
      }
    }
  };

  return (
    <View style={[ containerStyle]} >
      
      <View style={[styles.container]}>
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={handleChange}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={increment}>
            <MaterialIcons
              name="keyboard-arrow-up"
              size={RFPercentage(2.8)}
              color={styles.arrowColor.color}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={decrement}>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={RFPercentage(2.8)}
              color={styles.arrowColor.color}
            />
          </TouchableOpacity>
        </View>
        
      </View>
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
    </View>
  );
};

export default NumericStepper;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : 'transparent',
      width: '100%',
    },
    input: {
      flex: 1,
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      paddingVertical: hp(0.8),
    },
    buttonContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowColor: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });
