import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Linking,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {Fonts} from '@constants/Fonts';
import {Images} from '@assets/Images/Images';
import {SCREENS} from '@constants/Screens';
import {Svgs} from '@assets/Svgs/Svgs';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import {useAlert} from '@providers/AlertContext';
import StatusBox from '@components/Cards/StatusBox';
import {statusStyles} from '@constants/DummyData';
import {pxToPercentage} from '@utils/responsive';
import {capitalize} from '@utils/Helpers';
import {setLanguage, setLoggedIn} from '@redux/Slices/authSlice';
import {toggleTheme, setIsThemeApplied, setColors} from '@redux/Slices/theme';
import CustomSwitch from '@components/Buttons/CustomSwitch';
import i18n from '@translations/i18n';
import LanguageBtmSheet from '@components/BottomSheets/LanguageBtmSheet';
import logger from '@utils/logger';

const APP_URL = 'https://play.google.com/store/apps/details?id=com.yourapp';

const Profile = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {User, language} = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode, Colors);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {showAlert} = useAlert();

  const logoutSheetRef = useRef();
  const btmSheetRef = useRef();
  const deleteSheetRef = useRef();

  // ✅ Dark mode toggle handler
  const OnThemeChange = () => {
    dispatch(toggleTheme());
    dispatch(setIsThemeApplied(true));
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Check out this amazing app: ${APP_URL}`,
      });
    } catch (error) {
      logger.log('Error sharing app:', error.message, {context: 'Profile'});
    }
  };

  const handleRateApp = () => {
    Linking.openURL(APP_URL).catch(err =>
      logger.error('Error opening app store:', err, {context: 'Profile'}),
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

  const handleDelete = () => {
    showAlert('Account deleted successfully', 'success');
    deleteSheetRef.current?.close();
  };

  const onLanguageChange = value => {
    dispatch(setLanguage(value));
    if (value.label === 'English') {
      i18n.changeLanguage('en');
    } else if (value.label === 'Español') {
      i18n.changeLanguage('es');
    }
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: isDarkMode ? <Svgs.EditProfileD /> : <Svgs.EditProfile />,
      screen: SCREENS.EDITPROFILE,
    },
    // {
    //   icon: isDarkMode ? (
    //   ) : (
    //   ),
    //   hasSwitch: true,
    //   switchValue: isDarkMode,
    //   onSwitchChange: OnThemeChange,
    // },
    {
      title: 'Change Language',
      icon: <Svgs.language height={hp(4.5)} width={hp(4.5)} />,
      hasBtmSheet: true,
      dropDownValue: language,
      onValueChange: onLanguageChange,
    },
    {
      title: 'Change Password',
      icon: isDarkMode ? <Svgs.changePasswordD /> : <Svgs.changePassword />,
      screen: SCREENS.CHANGEPASSWORD,
    },
    // {
    //   title: 'Billing and Subscription',
    //   screen: SCREENS.SUBSCRIPTION,
    // },
    {
      title: 'Terms & Conditions',
      icon: isDarkMode ? <Svgs.termsD /> : <Svgs.terms />,
      screen: SCREENS.TERMSANDCONDITIONS,
    },
    {
      title: 'Privacy Policy',
      icon: isDarkMode ? <Svgs.privacyD /> : <Svgs.privacy />,
      screen: SCREENS.PRIVACYPOLICY,
    },
    {
      title: 'Share App',
      icon: isDarkMode ? <Svgs.shareD /> : <Svgs.share />,
      screen: 'ShareAppScreen',
    },
    {
      title: 'Rate App',
      icon: isDarkMode ? <Svgs.RateD /> : <Svgs.Rate />,
      screen: 'RateAppScreen',
    },
    // {
    //   title: 'Delete Account',
    //   icon: <Svgs.deleteOutline />,
    //   isDanger: true,
    //   isDelete: true,
    // },
    {
      title: 'Logout',
      icon: <Svgs.logOutOutline />,
      isDanger: true,
      isLogout: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={
              User?.user?.profile_picture
                ? {uri: User?.user?.profile_picture}
                : Images.placeholderImg
            }
            style={styles.ImageStyle}
          />
          <View style={{alignItems: 'flex-start'}}>
            <Text style={styles.ScreenHeading}>
              {`${User?.user?.full_name}`}
            </Text>
            <Text style={styles.Email}>{User?.user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(SCREENS.PROFILEDETAILS)}>
          <Icon
            name="chevron-forward"
            size={wp(6)}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            disabled={item.hasSwitch}
            onPress={() => {
              if (item.hasSwitch) return;
              if (item.hasBtmSheet) {
                btmSheetRef.current.open();
                return;
              } // Don't navigate if it has a switch
              if (item.isLogout) {
                logoutSheetRef.current?.open();
              } else if (item.isDelete) {
                deleteSheetRef.current?.open();
              } else if (item.title === 'Share App') {
                handleShareApp();
              } else if (item.title === 'Rate App') {
                handleRateApp();
              } else if (item.title === 'Billing and Subscription') {
                navigation.navigate(item.screen, {isLogin: false});
              } else {
                navigation.navigate(item.screen);
              }
            }}>
            <View style={styles.leftSection}>
              <View style={styles.menuIconContainer}>{item.icon}</View>
              <Text
                style={[
                  styles.menuText,
                  {color: item.isDanger ? 'red' : isDarkMode ? '#fff' : '#000'},
                ]}>
                {t(item.title)}
              </Text>
            </View>

            {item.hasSwitch ? (
              <CustomSwitch
                value={item.switchValue}
                onValueChange={item.onSwitchChange}
              />
            ) : !item.isLogout && !item.isDelete ? (
              <Icon
                name="chevron-forward"
                size={wp(5)}
                color={isDarkMode ? '#fff' : '#000'}
              />
            ) : null}
          </TouchableOpacity>
        ))}

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

        <ConfirmationBottomSheet
          ref={deleteSheetRef}
          icon={<Svgs.deleteAcc height={hp(10)} />}
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => deleteSheetRef.current?.close()}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </ScrollView>

      <LanguageBtmSheet refRBSheet={btmSheetRef} />
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
    content: {
      marginHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 10,
      paddingHorizontal: 5,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingBottom: hp(2),
      paddingTop: hp(5),
      justifyContent: 'space-between',
      marginBottom: hp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    ImageStyle: {
      width: wp(15),
      height: wp(15),
      borderRadius: wp(7.5),
      marginRight: wp(3),
    },
    ScreenHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(20)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    Email: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1.5),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIconContainer: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(4),
    },
    menuText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      flex: 1,
    },
  });

export default Profile;
