import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import CountryPickerBottomSheet from '@components/BottomSheets/CountryPickerBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import TxtInput from '@components/TextInput/Txtinput';
import logger from '@utils/logger';

const Step2 = () => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);

  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({})
  const countryPickerBtmSeetRef = useRef();
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.heading,
            {textAlign: 'left', fontSize: RFPercentage(2.5)},
          ]}>
          {t('Location Details')}
        </Text>
      </View>
      <View style={{flex: 1, marginTop: hp(2)}}>
        <TouchableOpacity onPress={() => countryPickerBtmSeetRef.current.open()} style={styles.countrySelector}>
          <Text style={[styles.label, {marginBottom: 0, width: '30%'}]}>
            { selectedCountry.name ? selectedCountry.name : t('Country')}
          </Text>
          <MaterialCommunityIcons
            name={'chevron-right'}
            size={RFPercentage(4)}
            color={
              isDarkMode
                ? Colors.darkTheme.secondryTextColor
                : Colors.lightTheme.iconColor
            }
          />
        </TouchableOpacity>
        <Text style={styles.label}>{t('Community/Province(Optional)')}</Text>
        <TxtInput
          value={state}
          containerStyle={styles.inputField}
          placeholder="Add your Community/Province"
          onChangeText={setState}
        />
        <Text style={styles.label}>
          {t('City')} <Text style={{color: 'red'}}>*</Text>
        </Text>
        <TxtInput
          value={city}
          containerStyle={styles.inputField}
          placeholder="Add your city"
          onChangeText={setCity}
        />

        <Text style={styles.label}>
          {t('Postal Code')} <Text style={{color: 'red'}}>*</Text>
        </Text>
        <TxtInput
          value={postalCode}
          containerStyle={styles.inputField}
          placeholder="Add your postal code"
          onChangeText={setPostalCode}
        />
        <Text style={styles.label}>{t('Street Address (Optional)')}</Text>
        <View style={styles.addressContainer}>
          <TxtInput
            value={address}
            placeholder={t('Add street, office address')}
            onChangeText={setAddress}
            style={{flex: 0.7, height: hp(6)}}
          />
          <CustomButton
            containerStyle={styles.mapBtn}
            text={t('Map')}
            textStyle={styles.mapBtnText}
            svg={<Svgs.MapIcon />}
            onPress={() => {
              // navigation.navigate(SCREENS.MAP);
            }}
          />
        </View>
      </View>

      
      <CountryPickerBottomSheet
        refRBSheet={countryPickerBtmSeetRef}
        showSearch={true}
        heading={'Select Country'}
        selectLocation={selectedCountry}
        setSelected={setSelectedCountry}
      />
    </ScrollView>
  );
};

export default Step2;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      padding: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    heading: {
      fontSize: RFPercentage(3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'left',
      width: wp(80),
    },
    countrySelector: {
      flexDirection: 'row',
      paddingHorizontal: wp('4%'),
      paddingVertical: wp('2.5%'),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: wp(3),
      marginBottom: hp(2),
      justifyContent: 'space-between',
      overflow: 'hidden',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
    },
    inputField: {
      borderRadius: wp(3),
      marginBottom: hp(2),
      backgroundColor: isDarkMode ? Colors.darkTheme.input : 'transparent',
    },

    addressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
      gap: wp(2.5),
    },
    mapBtn: {
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      flex: 0.3,
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      borderWidth: 1,
    },
    mapBtnText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(2),
      textAlign: 'center',
    },
  });
