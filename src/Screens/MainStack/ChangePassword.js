import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import StackHeader from '@components/Header/StackHeader';
import TxtInput from '@components/TextInput/Txtinput';
import { Fonts } from '@constants/Fonts';
import { baseUrl } from '@constants/urls';
import { useAlert } from '@providers/AlertContext';
import { ApiResponse, fetchApis } from '@utils/Helpers';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const ChangePassword = ({navigation}) => {
  const {t} = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isDarkMode,Colors } = useSelector(store => store.theme);
  const { token, language } = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {showAlert} = useAlert();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password validation rules state
  const [rules, setRules] = useState({
    lengthMin: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  // Validate password rules
  const validatePassword = password => {
    const newRules = {
      lengthMin: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      match: password === newPassword,
    };
    setRules(newRules);
    return newRules;
  };

  // Check if all password rules are satisfied
  const areAllRulesSatisfied = () => {
    return Object.values(rules).every(rule => rule === true);
  };

  const handleChangePassword = async () => {
    let errors = {};
  
    if (!currentPassword)
      errors.currentPassword = 'Please enter current password.';
  
    if (!newPassword) {
      errors.newPassword = 'Please enter new password.';
    } else if (!areAllRulesSatisfied()) {
      errors.newPassword = 'Password must meet all requirements.';
    }
  
    if (!confirmPassword)
      errors.confirmPassword = 'Please enter confirm password.';
  
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword =
        'New Password and Confirm Password do not match.';
    }
  
    setFormErrors(errors);
  
    // if no errors, proceed with API call
    if (Object.keys(errors).length === 0) {
      try {
        const payload = {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        };
  
        const {ok, data} = await fetchApis(
          `${baseUrl}/company-admins/change-password`,
          'PUT',
          setLoading,
          payload,
          showAlert,
          {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        );
  
        ApiResponse(showAlert, data, language);
        console.log(data)
  
        if (ok && !data?.error) {
          navigation.goBack();
        } else {
          // showAlert(
          //   'error'
          // );
        }
      } catch (error) {
        logger.error('Change password error:', error, { context:'ChangePassword' });
        showAlert(
          t('Something went wrong. Please try again later.'),
          'error'
        );
      }
      finally {
        setLoading(false);
      }
    }
  };
  

  const handleNewPasswordChange = value => {
    setConfirmPassword(value);
    setFormErrors({...formErrors, confirmPassword: ''});
    validatePassword(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: hp(12)}}>
        <StackHeader
          title={'Change Password'}
          headerTxtStyle={{
            textAlign: 'left',
            fontSize: RFPercentage(pxToPercentage(20)),
            fontFamily: Fonts.PoppinsSemiBold,
          }}
          headerStyle={{
            paddingVertical: hp(2),
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
          }}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <Text style={styles.label}>{t('Current Password')}</Text>
          <TxtInput
            value={currentPassword}
            error={formErrors.currentPassword}
            style={{marginBottom: hp(1)}}
            containerStyle={{
              backgroundColor: isDarkMode
                ? Colors.darkTheme.backgroundColor
                : 'transparent',
            }}
            placeholder="Enter current password"
            onChangeText={value => {
              setCurrentPassword(value);
              setFormErrors({...formErrors, currentPassword: ''});
            }}
            secureTextEntry={true}
            inputStyle={{fontSize: RFPercentage(pxToPercentage(14))}}
          />

          <Text style={styles.label}>{t('New Password')}</Text>
          <TxtInput
            value={newPassword}
            containerStyle={{
              backgroundColor: isDarkMode
                ? Colors.darkTheme.backgroundColor
                : 'transparent',
            }}
            placeholder="Enter new password"
            onChangeText={value => {
              setNewPassword(value);
              setFormErrors({...formErrors, newPassword: ''});
            }}
            secureTextEntry={true}
            inputStyle={{fontSize: RFPercentage(pxToPercentage(14))}}
            error={formErrors.newPassword}
            style={{marginBottom: hp(1)}}
          />

          <Text style={styles.label}>{t('Re-Enter Password')}</Text>
          <TxtInput
            value={confirmPassword}
            containerStyle={{
              backgroundColor: isDarkMode
                ? Colors.darkTheme.backgroundColor
                : 'transparent',
            }}
            placeholder="Re-Enter Password"
            onChangeText={value => {
              handleNewPasswordChange(value);
            }}
            secureTextEntry={true}
            inputStyle={{fontSize: RFPercentage(pxToPercentage(14))}}
            error={formErrors.confirmPassword}
            style={{marginBottom: hp(1)}}
          />
          
          <View style={{marginVertical: 10}}>
            {[
              {key: 'lengthMin', text: t('At least 8 characters')},
              {key: 'uppercase', text: t('Contains uppercase letter')},
              {key: 'lowercase', text: t('Contains lowercase letter')},
              {key: 'number', text: t('Contains number')},
              {key: 'specialChar', text: t('Contains special character')},
              {key: 'match', text: t('Password matches')},
            ].map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 2,
                }}>
                <Icon
                  name={rules[item.key] ? 'check-circle' : 'times-circle'}
                  size={20}
                  color={rules[item.key] ? '#0A9B4C' : 'gray'}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.TextColor,
                  }}>
                  {' '}
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Update'}
          onPress={handleChangePassword}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
          isLoading={loading}
          loaderColor={'#fff'}
        />
      </View>
    </View>
  );
};

export default ChangePassword;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    content: {
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(5),
      marginTop: hp(2),
      borderRadius: wp(3),
      paddingHorizontal: wp(5),
    },

    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
      marginTop: hp(1),
    },
    btnContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: hp(1.5),
      paddingBottom: hp(2),
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(5),
    },

    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
