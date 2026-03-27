import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import uuid from 'react-native-uuid';
import {useDispatch, useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import AccountSelectionBottomSheet from '@components/BottomSheets/AccountSelectionBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl, ImgURL} from '@constants/urls';
import logger from '@utils/logger';
import {useAlert} from '@providers/AlertContext';
import {
  setAuthState,
  setLanguage,
  setSavedAccounts,
} from '@redux/Slices/authSlice';
import {setServerRunning} from '@redux/Slices/errorSlice';
import i18n from '@translations/i18n';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import {setColors} from '@redux/Slices/theme';
// import {getFCMToken} from '@utils/NotificationService';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(false);
  const {isDarkMode, Colors} = useSelector(store => store.theme); // Add a default value for isDarkMode
  const dispatch = useDispatch();
  const {language, savedAccounts} = useSelector(store => store.auth);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const loginUrl = `${baseUrl}/company-admins/login`;
  const syncPaypalUrl = `${baseUrl}/payments/company-admin/sync-paypal-subscription`;
  const [isLoading, setIsLoading] = useState(false);

  const {t} = useTranslation();

  const {showAlert} = useAlert();
  const accountSelectSheetRef = useRef();

  const validate = () => {
    let isValid = true;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    setEmailError('');
    setPasswordError('');

    if (!trimmedEmail) {
      setEmailError(t('Please enter your email'));
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)
    ) {
      setEmailError(t('Please enter a valid email address'));
      isValid = false;
    }

    if (!trimmedPassword) {
      setPasswordError(t('Please enter your password'));
      isValid = false;
    }

    return isValid;
  };

  const CheckServerhealth = async () => {
    const connected = await isConnected();
    if (connected) {
      setIsLoading(true);

      try {
        const response = await fetch(`${ImgURL}/health`);
        if (!response.ok) {
          logger.warn('Backend has issues', {
            context: 'Login.CheckServerhealth',
          });
          dispatch(setServerRunning(false)); // this will trigger crash on next render
          return false;
        } else {
          // logger.log('Backend is running', {
          //   context: 'Login.CheckServerhealth',
          // });
          dispatch(setServerRunning(true));
          return true;
        }
      } catch (error) {
        logger.error('Backend is down or crashed', error, {
          context: 'Login.CheckServerhealth',
        });
        dispatch(setServerRunning(false)); // also simulate crash here
        return false;
      }
    } else {
      dispatch(setServerRunning(false));
      return false;
    }
  };

  const handleSignIn = async () => {
    if (validate()) {
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
      // const token = await getFCMToken();
      const token = 'device-token-placeholder';
      // logger.log('FCM token', {token}, {context: 'Login.getToken'});

      const payload = {
        email: email.toLocaleLowerCase(),
        password: password.trim(),
        device_id: token,
      };

      try {
        const {ok, data} = await fetchApis(
          loginUrl,
          'POST',
          setIsLoading,
          payload,
          showAlert,
          null,
          // isServerRunning,
        );

        ApiResponse(showAlert, data, language);
        logger.log('Login response', data, {context: 'Login.handleLogin'});

        if (!ok) {
          return;
        }

        if (data?.error) {
        } else {
          if (isRemember) {
            const id = uuid.v4();

            const savedAccount = {
              name: data?.data?.user?.name,
              email: email,
              id: id,
            };

            await Keychain.setGenericPassword(email, password, {
              service: `savedPassword-${email}`, // unique key per email
            });

            dispatch(setSavedAccounts(savedAccount));
          }
          const token = data?.data?.token;
          const {ok: paypalOk, data: syncPaypalres} = await fetchApis(
            syncPaypalUrl,
            'GET',
            null,
            null, // no body for GET
            showAlert,
            {Authorization: `Bearer ${token}`}, // pass token as headers
          );

          dispatch(
            setAuthState({
              token: data?.data?.token,
              isLoggedIn: true,
              company: data?.data?.company,
            }),
          );

          if (data?.data?.user?.status === 'requested') {
            navigation.navigate(SCREENS.EMAILVERIFIED, {
              navigateFrom: SCREENS.LOGIN,
            });
          } else {
            if (data?.data?.company?.primary_color) {
              dispatch(setColors(data?.data?.company?.primary_color));
            } else {
              dispatch(setColors('#006EC2'));
            }

            navigation.reset({
              index: 0,
              routes: [{name: SCREENS.DASHBOARD}],
            });
          }

        }
      } catch (error) {
        logger.error('Login failed', error, {context: 'Login.handleLogin'});
        showAlert('An unexpected error occurred. Please try again.', 'error');
      }
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
      style={styles.container}>
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
        <Text style={styles.heading}>{t('Sign In')}</Text>
        <Text
          style={[
            styles.subheading,
            language.value === 'es' && {
              fontSize: RFPercentage(2.1),
              width: wp(85),
            },
          ]}>
          {t('Sign in to manage companies, track earnings.')}
        </Text>
      </View>
      <View style={styles.inputsContainer}>
        <Text style={styles.label}>{t('Email')}</Text>
        <TxtInput
          value={email}
          placeholder="yourmail@mail.com"
          onChangeText={text => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          onFocus={() => {
            if (savedAccounts.length > 0) {
              accountSelectSheetRef.current?.open();
            }
          }}
          error={emailError}
        />

        <Text style={[styles.label, {marginTop: hp(2)}]}>{t('Password')}</Text>
        <TxtInput
          value={password}
          placeholder={t('Enter your password')}
          onChangeText={text => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
          secureTextEntry={true}
          error={passwordError}
        />

        <View style={styles.forgetContainer}>
          <TouchableOpacity
            onPress={() => setIsRemember(!isRemember)}
            style={styles.agreeContainer}>
            {isRemember ? (
              <TouchableOpacity onPress={() => setIsRemember(!isRemember)}>
                <Svgs.checked
                  height={hp(2.5)}
                  width={hp(2.5)}
                  style={{marginTop: hp(0.6)}}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsRemember(!isRemember)}>
                {isDarkMode ? (
                  <Svgs.UncheckBoxD
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                ) : (
                  <Svgs.check
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                )}
              </TouchableOpacity>
            )}
            <Text
              style={[
                styles.agreeText,
                language.value === 'es' && {
                  fontSize: RFPercentage(pxToPercentage(14)),
                },
              ]}>
              {t('Remember me')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate(SCREENS.FORGET)}>
            <Text
              style={[
                styles.forgetText,
                language.value === 'es' && {
                  fontSize: RFPercentage(pxToPercentage(13)),
                },
              ]}>
              {t('Forget Password?')}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          text={t('Sign In')}
          onPress={() => handleSignIn()}
          textStyle={styles.SignupBtnText}
          containerStyle={styles.SignupBtn}
          isLoading={isLoading}
          loaderColor={'#fff'}
          LoaderSize={25}
        />
        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t('OR')}</Text>
          <View style={styles.line} />
        </View>
        <Text
          style={[styles.agreeText, {textAlign: 'center', marginTop: hp(4)}]}>
          {t("Don't have an account?")}{' '}
          <Text
            onPress={() => navigation.navigate(SCREENS.SIGNUP)}
            style={styles.TermsText}>
            {' '}
            {t('Sign Up')}
          </Text>
        </Text>
      </View>

      <AccountSelectionBottomSheet
        refRBSheet={accountSelectSheetRef}
        accounts={savedAccounts}
        selectedEmail={email}
        onSelectAccount={async item => {
          const credentials = await Keychain.getGenericPassword({
            service: `savedPassword-${item.email}`,
          });

          if (credentials) {
            setEmail(credentials.username);
            setPassword(credentials.password);
          }

          accountSelectSheetRef.current?.close();
        }}
        onAddAccount={() => {
          setEmail('');
          setPassword('');
          accountSelectSheetRef.current?.close();
        }}
        onAddSelected={() => {
          setEmail('');
          setPassword('');
          accountSelectSheetRef.current?.close();
        }}
      />
    </ScrollView>
  );
};

export default Login;

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
      fontSize: RFPercentage(3.3),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginVertical: hp(1.5),
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    subheading: {
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      textAlign: 'center',
      width: wp(70),
      textAlignVertical: 'center',
      marginBottom: hp(4),
    },
    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      textAlign: 'left',
      width: wp(70),
      textAlignVertical: 'center',
      marginBottom: hp(0.5),
    },
    inputsContainer: {
      paddingHorizontal: wp(5),
    },
    agreeText: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginLeft: wp(2),
      marginTop: hp(0.7),
    },
    TermsText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      textDecorationLine: 'underline',
      fontFamily: Fonts.PoppinsSemiBold,
    },
    agreeContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    forgetContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    forgetText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      textDecorationLine: 'underline',
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
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      marginLeft: wp(2),
    },
    continueBtn: {
      backgroundColor: 'transparent',
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginTop: hp(3),
      borderWidth: 2,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    continueBtnText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : '#2D333A',
      fontFamily: Fonts.NunitoSemiBold,
      marginLeft: wp(2),
    },
    lineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: hp(3),
    },
    line: {
      flex: 1,
      height: hp(0.3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    orText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsMedium,
      marginHorizontal: wp(2.5),
    },
    continue: {
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: 10,
      width: wp(32),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(1),
    },
    dropdownContainer: {
      alignSelf: 'flex-end',
      zIndex: 1000,
      marginRight: wp(5),
    },
    termsText: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginLeft: wp(2),
      marginTop: hp(0.7),
    },
  });
