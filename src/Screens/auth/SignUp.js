import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import CustomSwitch from '@components/Buttons/CustomSwitch';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl, ImgURL} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {setLanguage} from '@redux/Slices/authSlice';
import {setServerRunning} from '@redux/Slices/errorSlice';
import i18n from '@translations/i18n';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '@utils/logger';

const Signup = ({navigation, route}) => {
  const {referral} = route?.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [customReferral, setCustomReferral] = useState(referral || '');
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const {language} = useSelector(store => store.auth);
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const dispatch = useDispatch();
  const SignupUrl = `${baseUrl}/company-admins/register`;
  const [isLoading, setIsLoading] = useState(false);


  const [rules, setRules] = useState({
    lengthMin: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  const validatePassword = Cpassword => {
    const newRules = {
      lengthMin: Cpassword.length >= 8,
      uppercase: /[A-Z]/.test(Cpassword),
      lowercase: /[a-z]/.test(Cpassword),
      number: /\d/.test(Cpassword),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(Cpassword),
      match: Cpassword === password,
    };
    setRules(newRules);
  };

  const saveReferralCode = async code => {
    try {
      await AsyncStorage.setItem('REFERRAL_CODE', code);
      logger.log(
        'Referral code saved',
        {code},
        {context: 'SignUp.saveReferralCode'},
      );
    } catch (error) {
      logger.error('Failed to save referral code', error, {
        context: 'SignUp.saveReferralCode',
      });
    }
  };

  const validate = () => {
    let valid = true;
    let newErrors = {};

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = ConfirmPassword.trim();

    if (!trimmedEmail) {
      newErrors.email = t('Email is required');
      valid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)
    ) {
      newErrors.email = t('Please enter a valid email address');
      valid = false;
    }

    if (!trimmedPassword) {
      newErrors.password = t('Password is required');
      valid = false;
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&_.])[A-Za-z\d@$!%*?&_.]{8,}$/.test(
        trimmedPassword,
      )
    ) {
      newErrors.password = t(
        'Password: 8+ chars, 1 letter, 1 number, 1 symbol',
      );
      valid = false;
    }

    if (!trimmedConfirmPassword) {
      newErrors.confirmPassword = t('Confirm Password is required');
      valid = false;
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      newErrors.confirmPassword = t('Passwords do not match');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const CheckServerhealth = async () => {
    const connected = await isConnected();
    if (connected) {
      setIsLoading(true);
      try {
        const response = await fetch(`${ImgURL}/health`);
        if (!response.ok) {
          dispatch(setServerRunning(false));
          return false;
        } else {
          dispatch(setServerRunning(true));
          return true;
        }
      } catch (error) {
        dispatch(setServerRunning(false));
        return false;
      }
    } else {
      dispatch(setServerRunning(false));
      return false;
    }
  };

  const handleSignup = async () => {
    try {
      if (!validate()) return;

      const serverIsRunning = await CheckServerhealth();
      if (!serverIsRunning) {
        const connected = await isConnected();
        if (!connected) {
          showAlert(t('No internet connection'), 'error');
        } else {
          showAlert(
            t('Server is not running. Please try again later.'),
            'error',
          );
        }
        return;
      }

      const payload = {
        email: email.toLowerCase(),
        password: password.trim(),
        confirmPassword: ConfirmPassword.trim(),
        role: 'company_admin',
        device_id: '',
      };

      const {ok, data} = await fetchApis(
        SignupUrl,
        'POST',
        setIsLoading,
        payload,
        showAlert,
        null,
      );

      console.log(data);

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }

      // ✔ Success
      ApiResponse(showAlert, data, language);
       saveReferralCode(customReferral);

      navigation.navigate(SCREENS.VERIFYEMAIL, {
        email: email.toLowerCase(),
        code: data?.data?.otp,
        userId: data?.data?.user?.id,
      });
    } catch (error) {
      logger.error('Signup error', error, {context: 'SignUp.handleSignUp'});
      showAlert(t('Something went wrong. Please try again.'), 'error');
    } finally {
      // Ensures loader stops even if error happens
      setIsLoading(false);
    }
  };

  const styles = dynamicStyles(isDarkMode, Colors);

  const onLanguageChange = value => {
    dispatch(setLanguage(value));
    if (value.label === 'English') {
      i18n.changeLanguage('en');
    } else if (value.label === 'Español') {
      i18n.changeLanguage('es');
    }
    showAlert(`App language has been changed`, 'success');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      contentContainerStyle={{paddingBottom: hp(10)}}>
      <CustomDropDown
        data={[
          {label: 'English', value: 'en'},
          {label: 'Español', value: 'es'},
        ]}
        selectedValue={language}
        onValueChange={onLanguageChange}
        placeholder={t(`Select Language`)}
        containerStyle={styles.dropdownContainer}
        width={wp(35)}
        search={false}
      />
      <View style={{alignItems: 'center'}}>
        <Svgs.Logo />
        <Text style={styles.heading}>{t('Create Account')}</Text>
        <Text style={styles.subheading}>
          {t('Sign up to manage companies and track your earnings.')}
        </Text>
      </View>
      <View style={styles.inputsContainer}>
        {customReferral && (
          <View>
            <Text style={styles.label}>
              {t('Account Executive Referral Code')}
              {customReferral ? ` (${t('Read only')})` : ''}
            </Text>
            <TxtInput
              placeholder={t('Enter referral code')}
              value={customReferral}
              onChangeText={value => setCustomReferral(value)}
              editable={customReferral ? false : true}
              inputStyle={{fontSize: RFPercentage(1.6)}}
              style={{marginBottom: hp(1.5)}}
            />
          </View>
        )}

        <Text style={styles.label}>{t('Email')}</Text>
        <TxtInput
          placeholder="example@mail.com"
          value={email}
          onChangeText={value => {
            setEmail(value);
            setErrors(prev => ({...prev, email: null}));
          }}
          inputStyle={{fontSize: RFPercentage(1.6)}}
          style={{marginBottom: hp(1.5)}}
          error={errors.email}
        />

        <Text style={styles.label}>{t('Password')}</Text>
        <TxtInput
          placeholder={t('8+ chars, 1 letter, 1 number, 1 symbol')}
          value={password}
          secureTextEntry
          onChangeText={value => {
            setPassword(value);
            setErrors(prev => ({...prev, password: null}));
          }}
          inputStyle={{fontSize: RFPercentage(1.6)}}
          style={{marginBottom: hp(1.5)}}
          error={errors.password}
        />

        <Text style={styles.label}>{t('Confirm Password')}</Text>
        <TxtInput
          placeholder={t('Re-enter your password')}
          value={ConfirmPassword}
          secureTextEntry
          onChangeText={value => {
            setConfirmPassword(value);
            setErrors(prev => ({...prev, confirmPassword: null}));
            validatePassword(value); // Run rules only here
          }}
          inputStyle={{fontSize: RFPercentage(1.6)}}
          style={{marginBottom: hp(1.5)}}
          error={errors.confirmPassword}
        />

        <View style={{marginVertical: 10}}>
          {[
            {key: 'lengthMin', text: 'At least 8 characters'},
            {key: 'uppercase', text: 'Contains uppercase letter'},
            {key: 'lowercase', text: 'Contains lowercase letter'},
            {key: 'number', text: 'Contains number'},
            {key: 'specialChar', text: 'Contains special character'},
            {key: 'match', text: 'Password matches'},
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
                  marginLeft: 6,
                  fontSize: 14,
                  color: isDarkMode
                    ? Colors.darkTheme.primaryTextColor
                    : Colors.lightTheme.primaryTextColor,
                }}>
                {t(item.text)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.termsContainer}>
          <CustomSwitch
            value={isAgreedToTerms}
            onValueChange={setIsAgreedToTerms}
          />
          <Text
            style={[
              styles.termsText,
              language.value === 'es' && {
                fontSize: RFPercentage(pxToPercentage(13)),
              },
            ]}>
            {t('Agree with')}
            <Text
              style={{
                color: Colors.darkTheme.primaryColor,
                fontFamily: Fonts.PoppinsSemiBold,
              }}
              onPress={() => Linking.openURL('https://biometricpro.app/terms')}>
              {' '}
              {t('Terms & Conditions')}
            </Text>
          </Text>
        </View>

        <CustomButton
          text={t('Register')}
          onPress={handleSignup}
          textStyle={styles.SignupBtnText}
          containerStyle={styles.SignupBtn}
          isLoading={isLoading}
          loaderColor={'#fff'}
          LoaderSize={25}
          disabled={!isAgreedToTerms}
        />

        <Text
          style={[styles.agreeText, {textAlign: 'center', marginTop: hp(4)}]}>
          {t('Already have an account?')}{' '}
          <Text
            onPress={() => navigation.navigate(SCREENS.LOGIN)}
            style={styles.TermsText}>
            {t('Sign In')}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default Signup;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(3),
    },
    heading: {
      fontSize: RFPercentage(pxToPercentage(30)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginVertical: hp(1.5),
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
    },
    subheading: {
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      width: wp('70%'),
      marginBottom: hp(4),
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      marginBottom: hp(0.5),
    },
    inputsContainer: {
      paddingHorizontal: wp(5),
    },
    agreeText: {
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      marginTop: hp(0.7),
    },
    TermsText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      textDecorationLine: 'underline',
      fontFamily: Fonts.PoppinsSemiBold,
    },
    SignupBtn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginTop: hp(3),
    },
    SignupBtnText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    dropdownContainer: {
      alignSelf: 'flex-end',
      zIndex: 1000,
      marginRight: wp(5),
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(2),
    },
    termsText: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginLeft: wp(2),
      textAlignVertical: 'center',
    },
  });
