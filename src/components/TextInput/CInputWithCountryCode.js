import React, {useRef, useState, useEffect, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Fonts} from '@constants/Fonts';
import CountryPickerBottomSheet from '@components/BottomSheets/CountryPickerBottomSheet';
import CountryList from 'country-list-with-dial-code-and-flag';
import logger from '@utils/logger';

const CInputWithCountryCode = ({
  phoneNo, // full phone number (e.g., "+21355686669609888")
  setPhoneNo, // callback to update full phone number
  setCountryCode, // callback to update country code separately
  countryCode = '+1',
  placeholder = 'Enter phone number',
  width = '100%',
  containerStyle,
  error,
  placeholderTextColor,
  editable = true,
}) => {
  const countryPickerBtmSeetRef = useRef();
  const {isDarkMode,Colors} = useSelector(state => state.theme);
  const styles = useMemo(() => dynamicStyles(isDarkMode,Colors), [isDarkMode,Colors]);
  const {t} = useTranslation();

  const countryArray = useMemo(() => {
    const countries = CountryList.getAll();
    return countries.sort(
      (a, b) => b.data.dial_code.length - a.data.dial_code.length,
    );
  }, []);

  // State for selected country and raw phone number
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [rawPhone, setRawPhone] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const extractDialCodeFromPhone = useCallback(
    fullPhoneNumber => {
      if (!fullPhoneNumber || !fullPhoneNumber.startsWith('+')) {
        return {
          country: null,
          dialCode: '',
          remainingNumber: fullPhoneNumber || '',
        };
      }

      const foundCountry = countryArray.find(c =>
        fullPhoneNumber.startsWith(c.data.dial_code),
      );

      if (foundCountry) {
        return {
          country: foundCountry.data,
          dialCode: foundCountry.data.dial_code,
          remainingNumber: fullPhoneNumber.substring(
            foundCountry.data.dial_code.length,
          ),
        };
      }

      return {country: null, dialCode: '', remainingNumber: fullPhoneNumber};
    },
    [countryArray],
  );

  // Initialize component with existing phone number
  useEffect(() => {

    if (phoneNo && !isInitialized) {
      const parsed = extractDialCodeFromPhone(phoneNo);
      if (parsed.country) {
        setSelectedCountry(parsed.country);
        setRawPhone(parsed.remainingNumber);
        setCountryCode?.(parsed.dialCode);

      } else {
        // Fallback to provided countryCode or default
        const defaultCountry = countryArray.find(
          c => c.data.dial_code === countryCode,
        )?.data;
        if (defaultCountry) {
         
          setSelectedCountry(defaultCountry);
          setRawPhone(phoneNo.replace(/^\+\d+/, '')); // Remove any leading dial code
        }
      }
      setIsInitialized(true);
    } else if (!phoneNo && !isInitialized) {
      // Initialize with default country
      const defaultCountry =
        countryArray.find(c => c.data.name === 'United States')?.data ||
        countryArray[0]?.data;
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
        setCountryCode?.(defaultCountry.dial_code);
      }
      setIsInitialized(true);
    }
  }, [
    phoneNo,
    countryCode,
    countryArray,
    extractDialCodeFromPhone,
    setCountryCode,
    isInitialized,
  ]);

  // Update parent when raw phone or country changes
  useEffect(() => {
    if (selectedCountry && isInitialized) {
      const fullNumber = rawPhone
        ? `${selectedCountry.dial_code}${rawPhone}`
        : selectedCountry.dial_code;
      setPhoneNo?.(fullNumber);
    }
  }, [rawPhone, selectedCountry, isInitialized, phoneNo]);

  // Handle country selection
  const handleCountrySelect = useCallback(
    country => {
      setSelectedCountry(country);
      setCountryCode?.(country.dial_code);
      countryPickerBtmSeetRef.current?.close();
    },
    [setCountryCode],
  );

  // Handle phone number input
  const handlePhoneChange = useCallback(text => {
    const cleanText = text.replace(/[^\d\s-]/g, '');
    setRawPhone(cleanText);
  }, []);

  // Handle country picker press
  const handleCountryPickerPress = useCallback(() => {
    if (editable) {
      countryPickerBtmSeetRef.current?.open();
    }
  }, [editable]);

  // Don't render until initialized
  if (!isInitialized || !selectedCountry) {
    return (
      <View style={[styles.container, containerStyle, {width}]}>
        <View style={styles.countryCodeButton}>
          <Text style={styles.countryCodeText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // console.log(JSON.stringify(countryArray, null, 2));

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          containerStyle,
          {width},
          error && styles.errorContainer,
          !editable && styles.disabledContainer,
        ]}>
        <TouchableOpacity
          style={styles.countryCodeButton}
          activeOpacity={editable ? 0.7 : 1}
          onPress={handleCountryPickerPress}
          disabled={!editable}>
          <Text
            style={[styles.countryCodeText, !editable && styles.disabledText]}>
            {selectedCountry.flag} {selectedCountry.dial_code}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, !editable && styles.disabledText, Platform.OS === 'ios' && {paddingVertical:hp(1)}]}
          placeholder={placeholder}
          value={rawPhone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          editable={editable}
          maxLength={15} // Reasonable max length for phone numbers
          placeholderTextColor={
            placeholderTextColor ||
            (isDarkMode
              ? Colors.darkTheme.secondryTextColor
              : Colors.lightTheme.secondryTextColor)
          }
        />
      </View>

      {error && (
        <Text style={styles.errorText}>
          {typeof error === 'string' ? t(error) : 'Invalid input'}
        </Text>
      )}

      <CountryPickerBottomSheet
        refRBSheet={countryPickerBtmSeetRef}
        showSearch={true}
        heading={'Select Country'}
        selectLocation={selectedCountry}
        setSelected={handleCountrySelect}
      />
    </View>
  );
};

export default CInputWithCountryCode

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },

    errorContainer: {
      borderColor: '#FF3B30',
      backgroundColor: isDarkMode ? '#FF3B3020' : '#FF3B3010',
    },
    disabledContainer: {
      opacity: 0.6,
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F5F5F5',
    },

    disabledText: {
      opacity: 0.7,
    },
    errorText: {
      color: '#FF3B30',
      fontFamily: Fonts.PoppinsRegular || 'System',
      fontSize: RFPercentage(1.6),
      // marginTop: hp(0.5),
      marginLeft: wp(1),
      textAlign: 'left',
    },

    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: wp(2),
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.7),
      width: '100%',
      alignSelf: 'center',
      marginBottom: hp(1),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    countryCodeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: wp(2),
    },
    countryCodeText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.8),
      borderRightWidth: 1,
      borderRightColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      paddingRight: wp(2),
    },
    textInput: {
      // flex: 1,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.8),
      // paddingHorizontal: wp(2),
      width: '100%',
      // backgroundColor: 'red',
      textAlignVertical: 'center',
    },
  });
