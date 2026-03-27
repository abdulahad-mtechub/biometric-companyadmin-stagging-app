import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import logger from '@utils/logger';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {setToken} from '@redux/Slices/createAccSlice';
import {ApiResponse, fetchApis} from '@utils/Helpers';

const CELL_COUNT = 6;

const VerifyEmail = ({navigation, route}) => {
  const {language} = useSelector(store => store.auth);

  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const {t} = useTranslation();
  const {email, code, userId} = route.params;
  const [apiCode, setApiCode] = useState(code);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [validationState, setValidationState] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const dispatch = useDispatch();

  // Use useRef to store the interval reference
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    setCanResend(false);
    let timeLeft = 60;
    setTimer(timeLeft);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        setCanResend(true);
      }
    }, 1000);
  }, []);

  // Start timer on component mount
  useEffect(() => {
    startTimer();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTimer]);

  const verify_Email_URL = `${baseUrl}/public/company-admin/verify-invite?userId=${userId}&token=${value}`;

  // Enhanced inline validation
  useEffect(() => {
    if (!value) {
      setError('');
      setValidationState('idle');
    } else if (value.length < CELL_COUNT) {
      setError(t('Code must be 6 digits.'));
      setValidationState('invalid');
    } else if (!/^\d+$/.test(value)) {
      setError(t('Code should contain only numbers.'));
      setValidationState('invalid');
    } else {
      setError('');
      setValidationState('valid');
    }
  }, [value, apiCode]);

  const handleVerifyCode = async () => {
    if (!value) {
      setError(t('Please Enter OTP Code.'));
      setValidationState('invalid');
      return;
    }
  
    if (value.length < CELL_COUNT) {
      setError(t('Code must be 6 digits.'));
      setValidationState('invalid');
      return;
    }
  
    if (!/^\d+$/.test(value)) {
      setError(t('Code should contain only numbers.'));
      setValidationState('invalid');
      return;
    }
  
    try {
      setIsLoading(true);
  
      const {ok, data} = await fetchApis(
        verify_Email_URL,
        'GET',
        null,
        null,
        showAlert,
        null,
      );
  
      // ❌ NETWORK or REQUEST FAILED
      if (!ok) {
        ApiResponse(showAlert, data, language);
        setValidationState('invalid');
        return;
      }
  
      // ❌ API response has error: true
      if (data?.error) {
        ApiResponse(showAlert, data, language);
        setValidationState('invalid');
        return;
      }
  
      // ⭐ SUCCESS CASE
      ApiResponse(showAlert, data, language); // shows translated success
  
      // Move to next screen
      navigation.navigate(SCREENS.COMPANYINVITATION, {
        token: data?.data?.profileUpdateToken,
      });
  
      dispatch(setToken(data?.data?.profileUpdateToken));
  
      setValidationState('valid');
    } catch (error) {
      logger.log(error, { context: 'VerifyEmail' });
      showAlert(t('Something went wrong, please try again later.'), 'error');
      setValidationState('invalid');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSendCode = async () => {
    const payload = {
      email: email.toLowerCase(),
    };

    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/resend-verification-otp`,
        'POST',
        null,
        payload,
        showAlert,
        {
          'Content-Type': 'application/json',
        },
      );

      // ❌ NETWORK / SERVER / API error
      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }

      ApiResponse(showAlert, data, language);

      // Update OTP and reset UI state
      setApiCode(data?.data?.otp);
      setValue('');
      setError('');
      setValidationState('idle');

      logger.log(data?.data?.otp, { context: 'VerifyEmail' });
    } catch (error) {
      logger.error('Error sending code:', error, { context: 'VerifyEmail' });
      showAlert(t('An unexpected error occurred. Please try again.'), 'error');
    }
  };

  const handleResend = () => {
    if (canResend) {
      startTimer();
      handleSendCode();
    }
  };

  const styles = dynamicStyles(isDarkMode, Colors);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={hp(2)}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <StackHeader
          title={t('Account Verification')}
          headerTxtStyle={{
            textAlign: 'left',
            fontSize: RFPercentage(2.6),
            fontFamily: Fonts.PoppinsSemiBold,
          }}
          headerStyle={{marginTop: hp(2)}}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.contentContainer}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View>
              <Text style={styles.screenTitle}>{t('Enter OTP Code')}</Text>
              <Text style={styles.screenDesc}>
                {t(
                  'Enter the 6-digit code sent to your email to verify your account.',
                )}
              </Text>

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
                    style={[
                      styles.cell,
                      isFocused && styles.focusCell,
                      validationState === 'invalid' && styles.errorOtp,
                    ]}
                    onLayout={getCellOnLayoutHandler(index)}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                )}
              />

              {validationState === 'invalid' && error && (
                <Text style={styles.invalidOtpText}>
                  {t('Invalid OTP. Please try again.')}
                </Text>
              )}

              <View style={styles.resendContainer}>
                <Text style={[styles.resendCode]}>
                  {t("Didn't receive code?")}
                </Text>
                {timer > 0 ? (
                  <Text
                    style={[
                      styles.resendCode,
                      {
                        fontSize: RFPercentage(2.1),
                        color: isDarkMode
                          ? Colors.darkTheme.primaryColor
                          : Colors.lightTheme.primaryColor,
                        fontFamily: Fonts.NunitoBold,
                      },
                    ]}>
                    {timer < 10 ? `0${timer}` : timer}s
                  </Text>
                ) : (
                  <Text
                    onPress={handleResend}
                    style={[
                      styles.resendCode,
                      {
                        color: canResend
                          ? isDarkMode
                            ? Colors.darkTheme.primaryColor
                            : Colors.lightTheme.primaryColor
                          : 'gray',
                        fontFamily: Fonts.NunitoBold,
                      },
                    ]}>
                    {t('Resend Code')}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.btnContainer}>
              <CustomButton
                containerStyle={[styles.continueButton, {flex: 1}]}
                text={t('Verify Code')}
                textStyle={styles.continueButtonText}
                onPress={handleVerifyCode}
                isLoading={isLoading}
                loaderColor={'#fff'}
                LoaderSize={25}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmail;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    screenTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    screenDesc: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    codeFieldRoot: {
      marginTop: hp(3),
      alignSelf: 'center',
      width: wp(90),
    },
    cell: {
      width: wp(12),
      height: hp(7),
      fontSize: RFPercentage(3),
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#FAFAFA',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      borderWidth: 1,
      textAlign: 'center',
      borderRadius: wp(3),
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : '#FAFAFA',
      fontFamily: Fonts.PoppinsBold,
      textAlignVertical: 'center',
      marginHorizontal: wp(1),
      paddingTop: Platform.OS === 'ios' ? hp(1.9) : 0,
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
    errorOtp: {
      backgroundColor: '#fee2e2',
      borderWidth: 1,
      borderColor: '#dc2626',
    },
    invalidOtpText: {
      color: '#dc2626',
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.NunitoBold,
      marginTop: hp(1),
      textAlign: 'center',
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: hp(3),
      paddingHorizontal: wp(4),
    },
    resendCode: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(2.3),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginRight: wp(1),
    },
    btnContainer: {
      marginBottom: hp(3),
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
