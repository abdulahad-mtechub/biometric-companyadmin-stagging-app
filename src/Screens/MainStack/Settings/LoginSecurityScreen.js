import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-animatable';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {
  default as Icon,
  default as MaterialIcons,
} from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { SCREENS } from '@constants/Screens';
import { useAlert } from '@providers/AlertContext';
import { Svgs } from '@assets/Svgs/Svgs';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import StackHeader from '@components/Header/StackHeader';
import { setLoggedIn } from '@redux/Slices/authSlice';
import logger from '@utils/logger';

const LoginSecurityScreen = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const userData = useSelector(store => store?.auth.User);
  logger.log(
    '🚀 ~ LoginSecurityScreen ~ userData:',
    JSON.stringify(userData, null, 2), { context: 'LoginSecurityScreen' });
  // return;
  const logoutSheetRef = useRef();
  const deleteSheetRef = useRef();
  const dispatch = useDispatch();
  const {showAlert} = useAlert();
  const token = useSelector(store => store?.auth?.user?.token);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      logoutSheetRef.current?.close();
      await Promise.all([
        AsyncStorage.removeItem('localuserData'),
        AsyncStorage.removeItem('isLoggedIn'),
        AsyncStorage.removeItem('SinupUserData'),
      ]);
      dispatch(setLoggedIn(false));
      navigation.reset({
        index: 0,
        routes: [{name: SCREENS.LOGIN}],
      });
      showAlert(t('Logged out successfully'), 'success');
    } catch (error) {
      logger.error('Logout failed:', error, { context: 'LoginSecurityScreen' });
      showAlert(t('Something went wrong while logging out'), 'error');
    }
  };

  // const handleDelete = async password => {
  //   try {
  //     setLoading(true);
  //     const body = {password: password};
  //     if (response?.error === false) {
  //       dispatch(logout());
  //       deleteSheetRef.current?.close();
  //     } else {
  //       deleteSheetRef.current?.close();
  //     }
  //   } catch (error) {
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Login & Security')}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(2.5),
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

      <View style={styles.card}>
        <View style={styles.avatar}>
          {userData?.user?.profile_image ? (
            <Image
              source={{uri: userData?.user?.profile_image}}
              style={styles.avatar}
            />
          ) : (
            <MaterialIcons name="account-circle" size={hp(5)} color="#999" />
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData?.user?.first_name}</Text>
          <Text style={styles.userEmail}>{userData?.user?.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logoutSheetRef.current?.open()}>
          <Icon name="logout" size={16} color="#fff" style={{marginRight: 6}} />
          <Text style={styles.logoutText}>{t('Logout')}</Text>
        </TouchableOpacity>
      </View>

      
      <ConfirmationBottomSheet
        ref={logoutSheetRef}
        icon={<Svgs.logout height={hp(10)} />}
        title={t('Are you sure?')}
        description={t(
          'Are you sure you want to log out? You will need to sign in again to access your account.',
        )}
        onConfirm={handleLogout}
        onCancel={() => logoutSheetRef.current?.close()}
        confirmText={t('Logout Confirm')}
        cancelText={t('Cancel')}
      />
      
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : '#fff',
      borderRadius: 10,
      padding: wp(4),
      margin: wp(5),
    },
    avatar: {
      width: hp(5),
      height: hp(5),
      borderRadius: 25,
    },
    userInfo: {
      flex: 1,
      marginLeft: wp(1),
    },
    userName: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    userEmail: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.3),
      color: 'gray',
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#007bff',
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
      borderRadius: 6,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#CC0000',
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
      borderRadius: 15,
      height: hp(6),
      marginHorizontal: wp(5),
      justifyContent: 'center',
      position: 'absolute',
      bottom: hp(3),
      width: wp(90),
    },
    logoutText: {
      color: '#fff',
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsMedium,
    },
    delText: {
      color: '#fff',
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsMedium,
      fontWeight: 'bold',
    },
  });

export default LoginSecurityScreen;
