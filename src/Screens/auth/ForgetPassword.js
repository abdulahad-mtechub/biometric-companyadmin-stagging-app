import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import StackHeader from '@components/Header/StackHeader';
import {ScrollView} from 'react-native';
import {Fonts} from '@constants/Fonts';
import {useDispatch, useSelector} from 'react-redux';
import TxtInput from '@components/TextInput/Txtinput';
import CustomButton from '@components/Buttons/customButton';
import {useAlert} from '@providers/AlertContext';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {RFPercentage} from 'react-native-responsive-fontsize';
import SuccessBottomSheet from '@components/BottomSheets/SuccessBottomSheet';
import {useTranslation} from 'react-i18next';
import {SCREENS} from '@constants/Screens';
import {pxToPercentage} from '@utils/responsive';
import {baseUrl, ImgURL} from '@constants/urls';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import {setServerRunning} from '@redux/Slices/errorSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import logger from '@utils/logger';

const CELL_COUNT = 6;

const ForgetPassword = ({navigation, route}) => {
  const indexx = route.params?.indexx;

  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const {language} = useSelector(store => store.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [index, setIndex] = useState(indexx || 0); // 0 = forget password screen, 1 = verify code screen
  const [email, setEmail] = useState('');
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(60);
  const [apiCode, setApiCode] = useState('');
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({}); // <-- NEW state

  const forgetPasswordUrl = `${baseUrl}/company-admins/forgot-password`;
  const ResetPasswordUrl = `${baseUrl}/company-admins/reset-password`;

  const successBtmSheetRef = useRef();

  const CheckServerhealth = async () => {
    const connected = await isConnected();
    if (connected) {
      setIsLoading(true);
      try {
        const response = await fetch(`${ImgURL}/health`);
        if (!response.ok) {
          logger.warn('Backend has issues', { context: 'ForgetPassword.CheckServerhealth' });
          dispatch(setServerRunning(false)); // this will trigger crash on next render
          return false;
        } else {
          logger.log('Backend is running', { context: 'ForgetPassword.CheckServerhealth' });
          dispatch(setServerRunning(true));
          return true;
        }
      } catch (error) {
        logger.error('Backend is down or crashed', error, { context: 'ForgetPassword.CheckServerhealth' });
        dispatch(setServerRunning(false)); // also simulate crash here
        return false;
      }
    } else {
      dispatch(setServerRunning(false));
      return false;
    }
  };

  const BackHandler = () => {
    if (index === 1) {
      setIndex(0);
    } else if (index === 2) {
      setIndex(1);
    } else if (index === 0) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    let interval = null;
    if (index === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [index, timer]);

  const validateEmail = () => {
    let valid = true;
    const newErrors = {};

    if (!email || email.trim().length === 0) {
      newErrors.email = t('Please enter your email address');
      valid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = t('Please enter a valid email address');
        valid = false;
      }
    }

    setErrors(prev => ({...prev, ...newErrors}));
    return valid;
  };

  const validatePassword = () => {
    let valid = true;
    const newErrors = {};

    if (!password || password.trim().length === 0) {
      newErrors.password = t('Please enter a password');
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = t('Password must be at least 8 characters long');
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = t(
        'Password must include at least one uppercase letter, one lowercase letter, and one number',
      );
      valid = false;
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      newErrors.confirmPassword = t('Please confirm your password');
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('Passwords do not match');
      valid = false;
    }

    setErrors(prev => ({...prev, ...newErrors}));
    return valid;
  };

  const handleSendCode = async () => {
    if (validateEmail()) {
      const serverIsRunning = await CheckServerhealth();
      if (!serverIsRunning) {
        const connected = await isConnected();
        if (!connected) {
          showAlert(t('No internet connection'), 'error');
        } else {
          showAlert(t('Server is not running. Please try again later.'), 'error');
        }
        return;
      }

      const payload = {
        email: email,
      };

      try {
        const {ok, data} = await fetchApis(
          forgetPasswordUrl,
          'POST',
          setIsLoading,
          payload,
          showAlert,
          {
            'Content-Type': 'application/json',
          },
        );

        ApiResponse(showAlert, data, language);

        if (!ok) return; // stop on error

        // Continue on success
        setApiCode(data?.data?.debugCode);
        logger.log('Forgot password response', data, { context: 'ForgetPassword.handleSendCode' });
        setIndex(1);
      } catch (error) {
        logger.error('Error sending code', error, { context: 'ForgetPassword.handleSendCode' });
        showAlert('An unexpected error occurred. Please try again.', 'error');
      }
    }
  };

  const [rules, setRules] = useState({
    lengthMin: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  // Validate password rules
  const validateRules = passwordd => {
    const newRules = {
      lengthMin: passwordd.length >= 8,
      uppercase: /[A-Z]/.test(passwordd),
      lowercase: /[a-z]/.test(passwordd),
      number: /\d/.test(passwordd),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordd),
      match: passwordd === password,
    };
    setRules(newRules);
    return newRules;
  };

  const handleVerifyCode = async () => {
    let newErrors = {};
    if (!value || value.length === 0) {
      newErrors.otp = t('Please enter OTP code');
    } else if (value !== apiCode) {
      newErrors.otp = t('Invalid code');
    }

    setErrors(prev => ({...prev, ...newErrors}));

    if (Object.keys(newErrors).length === 0) {
      // no error → success
      setIndex(2);
    }
  };

  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const handleResetPassword = async () => {
    if (validatePassword()) {
      const payload = {
        email: email.toLowerCase(),
        verificationCode: value,
        newPassword: password,
        confirmPassword: confirmPassword,
      };

      try {
        const {ok, data} = await fetchApis(
          ResetPasswordUrl,
          'POST',
          setIsLoading,
          payload,
          showAlert,
          {
            'Content-Type': 'application/json',
          },
        );

        // ⬇️ Unified message handling
        ApiResponse(showAlert, data, language);

        if (!ok) return; // Stop if error

        // ⬇️ Continue on success
        setTimeout(() => {
          successBtmSheetRef.current?.open();
        }, 2500);
      } catch (error) {
        logger.error('Error resetting password', error, { context: 'ForgetPassword.handleResetPassword' });
        showAlert('An unexpected error occurred. Please try again.', 'error');
      }
    }
  };

  const ForgetPasswordUI = () => {
    return (
      <View style={styles.screenContainer}>
        <View style={{flex: 0.1, paddingHorizontal: wp(5)}}>
          <View style={styles.screenTitleContainer}>
            <Text style={styles.screenTitle}>{t('Forget Password')}</Text>
            <Text style={[styles.screenDesc]}>
              {t(
                "Enter your email below, and we'll send you a 6-digit code to reset your password.",
              )}
            </Text>
          </View>

          <Text style={styles.label}>{t('Email')}</Text>
          <TxtInput
            value={email}
            placeholder="example@mail.com"
            onChangeText={setEmail}
            error={errors.email}
          />
        </View>
        <View style={styles.btnContainer}>
          <CustomButton
            containerStyle={styles.btn}
            text={t('Send Code')}
            textStyle={styles.btnText}
            onPress={handleSendCode}
            isLoading={isLoading}
            loaderColor={'#fff'}
            LoaderSize={25}
          />
        </View>
      </View>
    );
  };

  const VerifyCodeUI = () => {
    return (
      <View style={styles.screenContainer}>
        <View style={{flex: 0.1, paddingHorizontal: wp(5)}}>
          <View style={styles.screenTitleContainer}>
            <Text style={styles.screenTitle}>{t('Enter OTP Code')}</Text>
            <Text style={[styles.screenDesc]}>
              {t(
                'Enter the 6-digit code sent to your email to verify and reset your password.',
              )}
            </Text>
          </View>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />
          {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: hp(3),
            }}>
            <Text style={[styles.resendCode]}>{t("Didn't receive code?")}</Text>
            {timer > 0 ? (
              <Text
                style={[
                  styles.resendCode,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryColor
                      : Colors.lightTheme.primaryColor,
                    fontFamily: Fonts.PoppinsSemiBold,
                  },
                ]}>
                {timer < 10 ? `0${timer}` : timer}S
              </Text>
            ) : (
              <Text
                onPress={() => handleResend()}
                style={[
                  styles.resendCode,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryColor
                      : Colors.lightTheme.primaryColor,
                    fontFamily: Fonts.NunitoBold,
                    textDecorationLine: 'underline',
                  },
                ]}>
                {t('Resend Code')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.btnContainer}>
          <CustomButton
            containerStyle={styles.btn}
            text={t('Verify Code')}
            textStyle={styles.btnText}
            onPress={handleVerifyCode}
            isLoading={isLoading}
            loaderColor={'#fff'}
            LoaderSize={25}
          />
        </View>
      </View>
    );
  };

  const handleResend = () => {
    setTimer(60);
    handleSendCode();
  };

  const ResetPassword = () => {
    return (
      <View style={styles.screenContainer}>
        <View style={{flex: 0.1, paddingHorizontal: wp(5)}}>
          <Text style={styles.screenTitle}>{t('Update Password')}</Text>
          <Text
            style={[
              styles.screenDesc,
              {textAlign: 'center', fontSize: RFPercentage(2.2)},
            ]}>
            {t(
              'Your password must be at least 8 characters long with letters,numbers, and special characters.',
            )}
          </Text>
          <View>
            <Text style={styles.label}>{t('New Password')}</Text>
            <TxtInput
              placeholder={t('Enter new Password')}
              style={{width: wp(88), marginBottom: hp(3)}}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              containerStyle={{paddingHorizontal: wp(3)}}
              error={errors.password}
            />
            <Text style={[styles.label, {marginTop: hp(0)}]}>
              {t('Confirm Password')}
            </Text>
            <TxtInput
              placeholder={t('Re-enter the password')}
              style={{width: wp(88)}}
              value={confirmPassword}
              onChangeText={value => {
                validateRules(value);

                setConfirmPassword(value);
              }}
              secureTextEntry={true}
              containerStyle={{paddingHorizontal: wp(3)}}
              error={errors.confirmPassword}
            />

            <View style={{marginBottom: hp(2)}}>
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
                    color={
                      rules[item.key]
                        ? '#0A9B4C'
                        : Colors.lightTheme.BorderGrayColor
                    }
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
        </View>

        <View style={styles.btnContainer}>
          <CustomButton
            containerStyle={styles.btn}
            text={t('Reset Password')}
            textStyle={styles.btnText}
            onPress={handleResetPassword}
            isLoading={isLoading}
            loaderColor={'#fff'}
            LoaderSize={25}
          />
        </View>
      </View>
    );
  };

  const styles = dynamicStyles(isDarkMode, Colors);

  const renderView = () => {
    switch (index) {
      case 1:
        return VerifyCodeUI();
      case 2:
        return ResetPassword();
      // case 3:
      //   return ResetSuccess();

      default:
        return ForgetPasswordUI();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <StackHeader
          title={t('Reset Password')}
          headerTxtStyle={{
            textAlign: 'left',
            fontSize: RFPercentage(2.6),
            fontFamily: Fonts.PoppinsSemiBold,
          }}
          headerStyle={{marginTop: hp(2)}}
          onBackPress={BackHandler}
        />
        {renderView()}
      </ScrollView>

      <SuccessBottomSheet
        refRBSheet={successBtmSheetRef}
        text={t('Password Reset Successfully')}
        height={hp(40)}
        
        BtnText={'Ok'}
        onBtnPress={() => {
          // navigation.navigate('Login');
          navigation.reset({
            index: 0,
            routes: [{name: SCREENS.LOGIN}],
          });
          successBtmSheetRef.current?.close();
        }}
      />
    </View>
  );
};

export default ForgetPassword;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    screenContainer: {
      marginHorizontal: wp(2),
      flex: 1,
      justifyContent: 'space-between',
      marginTop: hp(4),
    },
    screenTitleContainer: {paddingTop: hp(0), alignItems: 'center'},
    screenTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(32)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    screenDesc: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(18)),
      textAlign: 'center',
      marginTop: hp(1),
      marginBottom: wp(8),
      width: '100%',
      lineHeight: RFPercentage(3),
    },

    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp('90%'),
      alignSelf: 'center',
      marginBottom: hp(5),
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(18)),
    },
    btnContainer: {
      marginTop: hp(5),
    },
    codeFieldRoot: {marginTop: wp(2), alignSelf: 'center', width: wp(90)},
    cell: {
      width: wp(13),
      height: hp(6),
      // lineHeight: RFPercentage(4),
      fontSize: RFPercentage(pxToPercentage(24)),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#FAFAFA',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      borderWidth: 1,
      textAlign: 'center',
      borderRadius: wp(5),
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : '#FAFAFA',
      fontFamily: Fonts.PoppinsBold,
      textAlignVertical: 'center',
    },
    focusCell: {
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.primaryColor}20`
        : `${Colors.lightTheme.primaryColor}20`,
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    label: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
      marginBottom: hp('1%'),
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginTop: hp(3),
    },
    resendCode: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginRight: wp(1),
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      height: '50%',
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      paddingLeft: wp('2%'),
      marginTop: hp(1),
    },
  });
