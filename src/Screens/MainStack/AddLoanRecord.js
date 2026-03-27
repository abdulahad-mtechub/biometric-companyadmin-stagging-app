import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const AddLoanRecord = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const styles = dynamicStyles(isDarkMode, theme,Colors);
  const [paymentMethod, setpaymentMethod] = useState('');
  const [paymentStatus, setpaymentStatus] = useState('');
  const [amount, setAmount] = useState('250.00');
  const handlePresetPress = value => {
    setAmount(parseFloat(value).toFixed(2).toString());
  };
  const presetAmounts = [5, 10, 20, 25, 50, 75, 100, 150, 200];

  return (
    <View style={[styles.continaer]}>
      {/* <View style={styles.contentContainer}> */}
      <ScrollView style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons
            name={'close'}
            onPress={() => navigation.goBack()}
            size={RFPercentage(3.5)}
            color={
              isDarkMode
                ? Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor
            }
          />
          <Text style={styles.screenHeading}>{t('Add Loan Record')}</Text>
        </View>

        <View style={styles.ContentContainer}>
          <Text style={[styles.heading]}>{t('Expense Details')}</Text>
          <Text style={styles.label}>
            {t('Paid Amount')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <View style={[styles.inputContainer]}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={[styles.amountInput]}
              />
              
            </View>
            <Text style={[styles.euroSign]}>$</Text>
            <Text style={[styles.loanText]}>{t('Loan Amount')}: $2,069.50</Text>
          </View>

          {/* Preset Buttons */}
          <View style={styles.buttonGrid}>
            {presetAmounts.map((val, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePresetPress(val)}
                style={[styles.amountButton]}>
                <Text
                  style={[styles.buttonText, {color: theme.secondryTextColor}]}>
                  ${val.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomDropDown
            data={[
              {label: 'PayPal', value: 'PayPal'},
              {label: 'Stripe', value: 'Stripe'},
            ]}
            selectedValue={paymentMethod}
            onValueChange={setpaymentMethod}
            placeholder="Payment Method"
            width={'100%'}
          />

          <Text style={styles.label}>
            {t('Date of Payment')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TouchableOpacity style={styles.input}>
            <Text style={styles.dateText}>{t('Select your payment date')}</Text>
            <View style={styles.iconRight}>{<Svgs.calenderL />}</View>
          </TouchableOpacity>

          <CustomDropDown
            data={[
              {label: 'Paid', value: 'Paid'},
              {label: 'Unpaid', value: 'Unpaid'},
            ]}
            selectedValue={paymentStatus}
            onValueChange={setpaymentStatus}
            placeholder="Payment Status"
            width={'100%'}
          />

          <Text style={[styles.label]}>
            {t('Description')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.comments]}
            placeholder={t('Describe your request')}
            placeholderTextColor="#A0A0A0"
            multiline
          />

          <View style={{marginTop: hp(1)}}>
            <Text style={styles.label}>
              {t('Supporting Proof')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <Text
              style={[
                styles.label,
                {
                  color: isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor,
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(pxToPercentage(14)),
                  width: wp(90),
                },
              ]}>
              {t('Upload image/Document in PNG/JPG/PDF Format')}
            </Text>
            <View style={styles.uploadContainer}>
              <TouchableOpacity style={styles.uploadIcon}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Save'}
          onPress={() => {}}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>

      {/* </View> */}
    </View>
  );
};

export default AddLoanRecord;

const dynamicStyles = (isDarkMode, theme,Colors) =>
  StyleSheet.create({
    continaer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(1),
    },
    screenHeading: {
      paddingTop: hp(0.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(17),
    },
    ContentContainer: {
      paddingBottom: hp(2),
      flex: 1,
      paddingHorizontal: wp(5),
      marginBottom: hp(5),
      marginTop: hp(2),
    },
    heading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'left',
      width: wp(80),
      fontSize: RFPercentage(pxToPercentage(18)),
      marginBottom: hp(2),
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
      fontSize: RFPercentage(pxToPercentage(14)),
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
    dateText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(15)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    iconRight: {
      marginLeft: wp(2),
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
    },
 
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
    uploadIcon: {
      padding: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : '#5E5F60',
      borderRadius: wp(10),
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: wp(2),
      padding: wp(2),
      alignItems: 'center',
      marginBottom: hp(3),
      backgroundColor: theme.primaryColor,
      borderColor: theme.BorderGrayColor,
    },
    amountInput: {
      fontSize: RFPercentage(pxToPercentage(40)),
      width: wp(35),
      textAlign: 'center',
      color: '#ffffff',
      fontFamily: Fonts.PoppinsMedium,
    },
    euroSign: {
      fontSize: RFPercentage(pxToPercentage(22)),
      marginLeft: wp(1),
      paddingBottom: hp(0.8),
      fontFamily: Fonts.PoppinsMedium,
      color: '#ffffff',
      position: 'absolute',
      right: wp(25),
      top: hp(1.5),
    },
    loanText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: '#ffffff',
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    amountButton: {
      width: wp(26),
      paddingVertical: hp(1),
      borderRadius: wp(2),
      marginBottom: hp(1.5),
      alignItems: 'center',
      borderWidth: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : 'transparent',
      borderColor: theme.BorderGrayColor,
    },
    buttonText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      //   position: "absolute",
      //   bottom: hp(2.5),
      //   left: wp(0),
      //   right: wp(0),
      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    comments: {
      height: hp(40),
      textAlignVertical: 'top',
    },
  });
