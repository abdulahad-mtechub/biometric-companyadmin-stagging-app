// Settings.js
import React, {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {Svgs} from '@assets/Svgs/Svgs';
import StackHeader from '@components/Header/StackHeader';
import {pxToPercentage} from '@utils/responsive';
import {setColors} from '@redux/Slices/theme';
import {useAlert} from '@providers/AlertContext';
import {setLoggedIn} from '@redux/Slices/authSlice';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import DeleteAccountBottomSheet from '@components/BottomSheets/DeleteAccountBottomSheet';
import {fetchApis, ApiResponse} from '@utils/Helpers';
import {baseUrl} from '@constants/urls';
import logger from '@utils/logger';

const Settings = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const dispatch = useDispatch();
  const {token, language} = useSelector(store => store.auth);

  const logoutSheetRef = useRef();
  const deleteSheetRef = useRef();

    const handleDeleteAccount = async (password, reason) => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/company-admins/me/delete`,
        'DELETE',
        null,
        {
          password: password,
          deletion_reason: reason,
        },
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);

      if (ok && !data?.error) {
        // Show success message

        handleLogout();

        // Navigate to login
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{name: SCREENS.LOGIN}],
          });
          dispatch(setColors('#006EC2'));
        }, 1500);
      }
    } catch (error) {
      logger.error('Delete account error:', error, {context: 'Settings'});
      showAlert('Failed to delete account', 'error');
      throw error; // Re-throw to let the component handle the error state
    }
  };

  const menuItems = [
    {
      id: 1,
      title: t('Change Language'),
      // subtitle: t('Update your basic account details and preferences'),
      icon: isDarkMode ? <Svgs.GeneralSettingD /> : <Svgs.GeneralSetting />,
      screen: 'GeneralSettings',
    },
   
    {
      id: 5,
      title: 'Change Password',
      icon: isDarkMode ? <Svgs.changePasswordD /> : <Svgs.changePassword />,
      screen: SCREENS.CHANGEPASSWORD,
    },

    {
      id: 6,
      title: 'Terms & Conditions',
      icon: isDarkMode ? <Svgs.termsD /> : <Svgs.terms />,
      screen: SCREENS.TERMSANDCONDITIONS,
    },
    {
      id: 7,
      title: 'Privacy Policy',
      icon: isDarkMode ? <Svgs.privacyD /> : <Svgs.privacy />,
      screen: SCREENS.PRIVACYPOLICY,
    },
    {
      id: 8,
      title: 'Share App',
      icon: isDarkMode ? <Svgs.shareD /> : <Svgs.share />,
      screen: 'ShareAppScreen',
    },
    {
      id: 9,
      title: 'Rate App',
      icon: isDarkMode ? <Svgs.RateD /> : <Svgs.Rate />,
      screen: 'RateAppScreen',
    },
    {
      id: 10,
      title: 'Delete Account',
      icon: <Svgs.deleteOutline />,
      isDanger: true,
      isDelete: true,
    },
    {
      id: 11,
      title: 'Logout',
      icon: <Svgs.logOutOutline />,
      isDanger: true,
      isLogout: true,
    },
  ];
  const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID'; // Replace with your actual App Store ID
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourapp';

  const handleShareApp = async () => {
    try {
      const appUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
      await Share.share({
        message: `Check out this amazing app: ${appUrl}`,
      });
    } catch (error) {
      logger.log('Error sharing app:', error.message, {context: 'Settings'});
    }
  };
  const handleRateApp = () => {
    const appUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(appUrl).catch(err =>
      logger.error('Error opening app store:', err, {context: 'Settings'}),
    );
  };

  const handleLogout = async () => {
    logoutSheetRef.current?.close();
    dispatch(setLoggedIn(false));
    navigation.reset({
      index: 0,
      routes: [{name: SCREENS.LOGIN}],
    });
    dispatch(setColors('#006EC2'));
    showAlert('Logged out successfully', 'success');
  };

  const renderMenuItem = item => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => {
          if (item.title === 'Share App') {
            handleShareApp();
            return;
          }
          if (item.title === 'Rate App') {
            handleRateApp();
            return;
          }

          if (item.isLogout) {
            logoutSheetRef.current?.open();
            return;
          }
          if (item.isDelete) {
            deleteSheetRef.current?.open();
            return;
          }

          navigation.navigate(item.screen);
        }}>
        <View style={styles.menuIconContainer}>{item.icon}</View>
        <View style={styles.menuContent}>
          <Text
            style={[
              styles.menuTitle,
              {color: item.isDanger ? 'red' : isDarkMode ? '#fff' : '#000'},
            ]}>
            {t(item.title)}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <Icon
          name="chevron-right"
          size={30}
          color={styles.chevronColor.color}
        />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Settings')}
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

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>{menuItems.map(renderMenuItem)}</View>
      </ScrollView>
      <ConfirmationBottomSheet
        ref={logoutSheetRef}
        icon={
          <TouchableOpacity
            style={{
              backgroundColor: Colors.lightTheme.primaryColor,
              borderRadius: hp(5),
              padding: hp(2),
              alignItems: 'center',
            }}>
            <Svgs.logout />
          </TouchableOpacity>
        }
        title="Logout"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        onConfirm={handleLogout}
        onCancel={() => logoutSheetRef.current?.close()}
        confirmText="Logout"
        cancelText="Cancel"
      />

      <DeleteAccountBottomSheet
        ref={deleteSheetRef}
        onDelete={handleDeleteAccount}
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },

    scrollContainer: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
    },
    content: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: hp(1),
      marginBottom: hp(1.5),
    },
    menuIconContainer: {
      marginRight: wp(3),
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    menuSubtitle: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    iconColor: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    chevronColor: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

export default Settings;
