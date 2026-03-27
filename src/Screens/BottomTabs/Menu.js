import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {Svgs} from '@assets/Svgs/Svgs';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {SCREENS} from '@constants/Screens';
import SubscriptionAlertBanner from '@components/SubscriptionAlertBanner/SubscriptionAlertBanner';
import logger from '@utils/logger';
import ComingSoonModal from '../../components/Modals/ComingSoonModal';

const Menu = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const [ComingSoonVisible, setComingSoonVisible] = useState(false);
  const MenuCards = [
    {
      title: 'Profile',
      icon: <Svgs.workerWhite />,
      backgroundColor: '#F4769D',
      onPress: () => {
        navigation.navigate(SCREENS.EDITPROFILE);
      },
    },
    // {
    //   title: 'Task Management',
    //   icon: <Svgs.task />,
    //   backgroundColor: '#579DFF',
    //   onPress: () => {
    //     navigation.navigate(SCREENS.TASKMANAGEMENT);
    //   },
    // },
    {
      title: 'Request Management',
      icon: <Svgs.request />,
      backgroundColor: '#8A97A9',
      onPress: () => {
        navigation.navigate(SCREENS.REQUESTMANAGEMENT);
      },
    },
    {
      title: 'Documents',
      icon: <Svgs.document />,
      backgroundColor: '#F5CD47',
      onPress: () => {
        navigation.navigate(SCREENS.DOCUMENTMANAGEMENT);
      },
    },
    {
      title: 'Payment Management',
      icon: <Svgs.dollarGreenBG />,
      backgroundColor: '#4BCE97',
      onPress: () => {
        navigation.navigate(SCREENS.EXPENSEMANAGEMENT);
      },
    },
    {
      title: 'Reports & Statistics',
      icon: <Svgs.report />,
      backgroundColor: '#FEA362',
      onPress: () => {
        navigation.navigate(SCREENS.REPORTSSTATISTICS);
      },
    },
    {
      title: 'Absence Management',
      icon: <Svgs.delayed />,
      backgroundColor: '#D24848FF',
      onPress: () => {
        navigation.navigate(SCREENS.ABSCENCEMANAGEMENT);
      },
    },
    {
      title: 'Subscription Plans',
      backgroundColor: '#2196F3',
      icon: <Svgs.RateD />,
      onPress: () => {
        navigation.navigate(SCREENS.SUBSCRIPTIONPLANS);
      },
    },

    {
      title: 'Suppliers',
      icon: <Svgs.supplier />,
      backgroundColor: '#9F8FEF',
      onPress: () => {
        setComingSoonVisible(true);

        setTimeout(() => {
          setComingSoonVisible(false);
        }, 5000);
      },
    },
    {
      title: 'Vacancies',
      icon: <Svgs.document />,
      backgroundColor: '#F4769D',
      onPress: () => {
        setComingSoonVisible(true);

        setTimeout(() => {
          setComingSoonVisible(false);
        }, 5000);
      },
    },
    {
      title: 'Applicants',
      icon: <Svgs.leaveWhite />,
      backgroundColor: '#8A97A9',
      onPress: () => {
        setComingSoonVisible(true);

        setTimeout(() => {
          setComingSoonVisible(false);
        }, 5000);
      },
    },

    {
      title: 'Settings',
      icon: <Svgs.setting />,
      backgroundColor: '#F87168',
      onPress: () => {
        navigation.navigate(SCREENS.SETTINGS);
      },
    },
  ];
  const MenuCard = ({icon, title, backgroundColor, onPress}) => {
    const themeColors = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

    return (
      <TouchableOpacity
        onPress={() => onPress()}
        style={[
          styles.card,
          {
            backgroundColor:
              backgroundColor === false
                ? 'transparent'
                : themeColors.backgroundColor,
            borderColor:
              backgroundColor === false
                ? 'transparent'
                : themeColors.BorderGrayColor,
          },
        ]}>
        <View style={[styles.cardIconContainer, {backgroundColor}]}>
          {icon}
        </View>
        <Text style={[styles.title, {color: themeColors.primaryTextColor}]}>
          {t(title)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.ScreenHeading]}>{t('More')}</Text>
        <View style={styles.iconContainer}>
          {/* <TouchableOpacity onPress={() => navigation.navigate(SCREENS.GLOBALSEARCH)} >
            {isDarkMode ? <Svgs.searchD /> : <Svgs.SearchL />}
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS)}>
            {isDarkMode ? (
              <Svgs.BellD height={hp(4)} />
            ) : (
              <Svgs.BellL height={hp(4)} />
            )}
          </TouchableOpacity> */}
        </View>
      </View>
      
      <FlatList
        data={MenuCards}
        numColumns={2}
        keyExtractor={item => item.title}
        ListHeaderComponent={<SubscriptionAlertBanner
        onPress={() => navigation.navigate(SCREENS.SUBSCRIPTIONPLANS)}
      />}
        renderItem={({item}) => (
          <MenuCard
            title={item.title}
            icon={item.icon}
            backgroundColor={item.backgroundColor}
            onPress={item.onPress}
          />
        )}
        contentContainerStyle={{alignItems: 'center'}}
      />
      <ComingSoonModal
        isVisible={ComingSoonVisible}
        onClose={() => setComingSoonVisible(false)}
      />
    </View>
  );
};

export default Menu;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      justifyContent: 'space-between',
      marginBottom: hp(0),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    ScreenHeading: {
      paddingTop: hp(1.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },

    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(5),
    },

    card: {
      width: wp(42),
      height: hp(16),
      borderWidth: 1,
      borderRadius: wp(3),
      padding: wp(4),
      margin: wp(2),
      // justifyContent: 'space-between',
    },
    cardIconContainer: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      marginTop: hp(1),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
    },
  });
