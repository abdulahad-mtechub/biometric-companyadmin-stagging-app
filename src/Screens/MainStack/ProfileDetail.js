import React, {useCallback, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import AdminInfoCard from '@components/Cards/AdminInfoCard';
import CompanyDetailsCard from '@components/Cards/CompanyDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';

import {useTranslation} from 'react-i18next';

import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {useAlert} from '@providers/AlertContext';
import {capitalize} from '@utils/Helpers';
import {useProfile} from '@utils/Hooks/Hooks';
import {pxToPercentage} from '@utils/responsive';
import {setColors} from '@redux/Slices/Theme';
import logger from '@utils/logger';

const ProfileDetail = ({navigation, route}) => {
  const {t} = useTranslation();
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const dispatch = useDispatch();
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, User} = useSelector(store => store.auth);
  const {ProfileDetails, isLoading, getProfile} = useProfile();

  const status = capitalize(User?.status?.status);

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <StackHeader
          title={'Company Profile'}
          headerTxtStyle={{textAlign: 'left'}}
          onBackPress={() => navigation.goBack()}
          headerStyle={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.backgroundColor
              : Colors.lightTheme.backgroundColor,
            paddingTop: 10,
          }}
        />

        <View style={styles.statusContainer}>
          <WorkerStatus
            name={t('Status')}
            status={status}
            nameTextStyle={styles.statusText}
            containerStyle={{borderBottomWidth: 0}}
          />

          <View style={[styles.rowViewSB, {marginTop: hp(0.5)}]}>
            <Text style={styles.statusText}>{t('Registered')}</Text>

            <Text style={styles.value}>
              {moment(User?.user?.created_at).format('DD MMM, YYYY')}
            </Text>
          </View>
        </View>
        <AdminInfoCard
          user={{
            fullName: User?.user?.full_name || 'N/A',
            email: User?.user?.email || 'N/A',
            phone: User?.user?.phone_number || 'N/A',
            Designation: User?.user?.designation || 'N/A',
            profileImage: User?.user?.profile_picture || 'N/A',
            dob: User?.user?.dob
              ? moment(User?.user?.dob).format('YYYY-MM-DD')
              : 'N/A',
            administrator_type: User?.user?.administrator_type
              ? User?.user?.administrator_type
              : 'N/A',
            admin_document_url: User?.user?.admin_document_url
              ? User?.user?.admin_document_url
              : null,
          }}
        />
        <CompanyDetailsCard
          data={{
            logo: User?.company?.logo,
            legalName: User?.company?.legal_name || 'N/A',
            businessSector: User?.company?.business_sector || 'N/A',
            tradeName: User?.company?.trade_name || 'N/A',
            registrationNumber:
              User?.company?.company_registration_number || 'N/A',
            phone: User?.company?.business_phone || 'N/A',
            email: User?.company?.business_email || 'N/A',
            country: User?.location?.country || 'N/A',
            province: User?.location?.province || 'N/A',
            city: User?.location?.city || 'N/A',
            postalCode: User?.location?.postal_code || 'N/A',
            street: User?.location?.street_address || 'N/A',
            subscriptionStatus: User?.company?.subscription_status || 'N/A',
            subscription: User?.company?.subscription_plan,
            Region_Code: User?.location?.region_code || 'N/A',
            zones: User?.territory_zone?.territory_zone || [],
            countries: User?.territory_zone?.territory_countries || [],
            cities: User?.territory_zone?.territory_cities || [],
            business_activity: User?.user?.business_activity || 'N/A',
            company_document_url: User?.company?.company_document_url || null,
            execEmail: User?.account_executive?.email || 'N/A',
            name: User?.account_executive?.name || 'N/A',
            primary_color: User?.user?.primary_color,
            secondary_color: User?.user?.secondary_color,
          }}
        />
      </ScrollView>
    </View>
  );
};

export default ProfileDetail;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      padding: wp(2),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(15)),
    },
    value: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(0.5),
    },
    listContainer: {
      paddingHorizontal: wp(5),
    },

    tabsContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginBottom: hp(2),
      borderTopLeftRadius: wp(2),
      borderTopRightRadius: wp(2),
    },
    TabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(2),
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginBottom: hp(2),
    },
    symbolRow: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      height: hp(2),
      width: hp(2),
      borderRadius: hp(2.25),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
    },

    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      //   position: "absolute",
      //   bottom: hp(2.5),
      //   left: wp(0),
      //   right: wp(0),
      paddingVertical: wp(4),
      paddingHorizontal: wp(5),
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
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    cancelBtn: {
      backgroundColor: isDarkMode ? Colors.error : Colors.error,
    },
    cardContainer: {
      padding: wp(4),
      borderRadius: wp(3),
      borderWidth: 1,
      marginVertical: wp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    reportHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      width: '70%',
      marginBottom: hp(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    profileImage: {
      width: wp(5),
      height: wp(5),
      borderRadius: wp(5),
      marginRight: wp(2),
    },
  });
