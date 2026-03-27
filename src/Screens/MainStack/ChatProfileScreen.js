import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { departmentMembers } from '@constants/DummyData';
import { Fonts } from '@constants/Fonts';
import { Images } from '@assets/Images/Images';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomSwitch from '@components/Buttons/CustomSwitch';
import DepartmentMemberCard from '@components/Cards/DepartmentMemberCard';
import StackHeader from '@components/Header/StackHeader';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const mediaData = {
  today: [
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  ],
  yesterday: [
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=988&q=80',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=962&q=80',
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  ],
};

const ChatProfileScreen = ({navigation, route}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const theme = Colors[isDarkMode ? 'darkTheme' : 'lightTheme'];
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);
  const [MuteNotification, setMuteNotification] = useState(false);
  const {isGroup} = route.params;

  return (
    <ScrollView style={[styles.container]}>
      {/* Header */}
      <StackHeader
        title={t('Chat Details')}
        headerTxtStyle={styles.headerTxtStyle}
        headerStyle={styles.headerStyle}
        onBackPress={() => navigation.goBack()}
      />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Image
            source={isGroup ? Images.GroupPlaceholder : Images.placeholderImg}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.nameTextWithTheme(theme)}>
          {isGroup ? 'Design Team' : 'John Doe'}
        </Text>
        {!isGroup && (
          <View style={styles.emailRow}>
            <Text style={styles.emailTextWithTheme(theme)}>
              Johndoe@gmail.com
            </Text>
            <TouchableOpacity style={styles.emailCopyBtn}>
              <Svgs.copyL />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Options */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Svgs.MuteNotificationL />
          <Text style={styles.optionTextWithTheme(theme)}>
            {t('Mute Notification')}
          </Text>
          <View style={styles.flex1} />
          <CustomSwitch
            value={MuteNotification}
            onValueChange={setMuteNotification}
          />
        </View>

        <View style={styles.rowWithMarginTop}>
          <Svgs.galleryBlack />
          <Text style={styles.optionTextWithTheme(theme)}>{t('Media')}</Text>
          <View style={styles.flex1} />
          <Text style={styles.countTextWithTheme(theme)}>152</Text>
        </View>

        {/* Media Grid */}
        <Text style={styles.sectionTitleWithTheme(theme, 'secondryTextColor')}>
          {t('Today')}
        </Text>
        <FlatList
          horizontal
          data={mediaData.today}
          keyExtractor={(_, index) => 'today-' + index}
          renderItem={({item}) => (
            <Image source={{uri: item}} style={styles.mediaImage} />
          )}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={styles.sectionTitleWithTheme(theme, 'secondryTextColor')}>
          {t('Yesterday')}
        </Text>
        <FlatList
          horizontal
          data={mediaData.yesterday}
          keyExtractor={(_, index) => 'yesterday-' + index}
          renderItem={({item}) => (
            <Image source={{uri: item}} style={styles.mediaImage} />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      {isGroup && (
        <View style={styles.card}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupMembersTitle(theme)}>
              {t('Group Members')}
            </Text>
            <Svgs.ChevronDownFilled />
          </View>
          <View>
            {departmentMembers.map((item, index) => (
              <DepartmentMemberCard item={item} key={index} showDots={true} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const dynamicStyles = (isDarkMode,Colors) => {
  const base = {
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerStyle: {
      paddingTop: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsMedium,
    },
    profileCard: {
      borderRadius: wp(3),
      alignItems: 'center',
      paddingVertical: hp(3),
      marginBottom: hp(2.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      margin: wp(4),
    },
    avatar: {
      width: wp(27),
      height: wp(35),
    },
    avatarPlaceholder: {
      width: wp(35),
      height: wp(35),
      borderRadius: wp(100),
      backgroundColor: '#D9D9D9',
      marginBottom: hp(1.5),
      alignItems: 'center',
    },
    nameText: {
      fontSize: RFPercentage(pxToPercentage(22)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(0.5),
    },
    emailText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsRegular,
    },
    emailCopyBtn: {
      marginLeft: wp(2),
    },
    card: {
      borderRadius: wp(3),
      padding: wp(4),
      margin: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowWithMarginTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(2),
    },
    optionText: {
      fontSize: RFPercentage(pxToPercentage(17)),
      fontFamily: Fonts.PoppinsMedium,
      marginLeft: wp(2),
    },
    countText: {
      fontSize: RFPercentage(pxToPercentage(17)),
      fontFamily: Fonts.PoppinsMedium,
    },
    sectionTitle: {
      fontSize: RFPercentage(pxToPercentage(15)),
      fontFamily: Fonts.PoppinsMedium,
      marginTop: hp(2),
      marginBottom: hp(1),
    },
    mediaImage: {
      width: wp(18),
      height: wp(18),
      borderRadius: wp(2),
      marginRight: wp(2),
    },
    flex1: {
      flex: 1,
    },
    groupHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  };
  // Dynamic style helpers for theme colors
  return {
    ...base,
    nameTextWithTheme: theme => [
      base.nameText,
      {color: theme.primaryTextColor},
    ],
    emailTextWithTheme: theme => [
      base.emailText,
      {color: theme.secondryTextColor},
    ],
    optionTextWithTheme: theme => [
      base.optionText,
      {color: theme.primaryTextColor},
    ],
    countTextWithTheme: theme => [
      base.countText,
      {color: theme.primaryTextColor},
    ],
    sectionTitleWithTheme: (theme, colorKey) => [
      base.sectionTitle,
      {color: theme[colorKey]},
    ],
    groupMembersTitle: theme => [
      base.sectionTitle,
      {
        color: theme.primaryTextColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: RFPercentage(pxToPercentage(16)),
      },
    ],
  };
};

export default ChatProfileScreen;
