import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import CustomButton from '@components/Buttons/customButton';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TabSelector from '@components/TabSelector/TabSelector';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {setPlanDetails, setTrail} from '@redux/Slices/authSlice';
import {fetchApis} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const Subscription = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const [plans, setPlans] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const {token, plan} = useSelector(store => store.auth);
  const isLogin = route?.params?.isLogin;
  const [btnLoading, setBtnLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [subcribedPlan, setSubcribedPlan] = useState(plan);
  const getCurrentSubstribtionStatusURL = `${baseUrl}/company-admins/trial-status`;
  const dispatch = useDispatch();
  const [isSubscribed, setIsSubscribed] = useState(
    currentPlan?.plan_id === subcribedPlan?.plan_id,
  );
  const confirmationBottomSheetRef = useRef(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  useEffect(() => {
    const selected = plans?.find(plan => plan?.name === selectedTab);
    setCurrentPlan(selected);

    if (
      selected?.plan_id &&
      subcribedPlan?.plan_id &&
      selected.plan_id === subcribedPlan.plan_id
    ) {
      setIsSubscribed(true);
    } else {
      setIsSubscribed(false);
    }
  }, [selectedTab, plans, subcribedPlan]);

  const subcriptionUrl = `${baseUrl}/payments/company-admin/generate-payment-link?plan_id=${currentPlan?.plan_id}`;

  const getCurrentSubstribtionStatus = async () => {
    try {
      const {ok, data} = await fetchApis(
        getCurrentSubstribtionStatusURL,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok) {
        showAlert(data?.message || 'Something went wrong.', 'error');
        return;
      }

      if (data?.data?.subscription_info) {
        setSubcribedPlan(data?.data?.subscription_info);
        dispatch(setPlanDetails(data?.data?.subscription_info));
      } else {
        dispatch(setTrail(data?.data?.trial_info));
      }
    } catch (error) {
      showAlert('Error fetching plans', 'error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      getCurrentSubstribtionStatus();
    }, []),
  );

  const getSubscriptionPlans = async () => {
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/payments/plans`,
        'GET',
        setPlansLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok) {
        showAlert(data?.message || 'Something went wrong.', 'error');
        return;
      }

      showAlert(data?.message || 'Plans retrieved.', 'success');
      const plansList = data?.data?.plans || [];
      setPlans(plansList);
      if (plansList.length > 0) {
        setSelectedTab(plansList[0].name); // select first plan by default
      }
    } catch (error) {
      showAlert('Error fetching plans', 'error');
    }
  };

  useEffect(() => {
    getSubscriptionPlans();
  }, []);

  const handleSubscribe = async () => {
    try {
      const {ok, data} = await fetchApis(
        subcriptionUrl,
        'GET',
        setBtnLoading,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok) {
        showAlert(data?.message || 'Something went wrong.', 'error');
        return;
      } else {
        confirmationBottomSheetRef.current.close();

        navigation.navigate(SCREENS.PAYPALWEBVIEW, {
          url: data?.data.paypal_url,
          order_id: data?.data.order_id,
        });
      }
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Billing and Subscription')}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(pxToPercentage(20)),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={{
          backgroundColor: isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.backgroundColor,
        }}
        onBackPress={() => navigation.goBack()}
      />

      {plansLoading ? (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Loader size={wp(10)} />
        </View>
      ) : (
        <View style={{flex: 1}}>
          {/* Dynamic Tab Names */}
          {plans.length > 0 && (
            <TabSelector
              tabs={plans.map(plan => plan.name)}
              selectedTab={selectedTab}
              onTabPress={setSelectedTab}
              isScrollable
            />
          )}
          <ScrollView
            style={[{flex: 1}]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              {flexGrow: 1},
              // selectedTab !== '' && {paddingBottom: hp(5)},
            ]}>
            {/* Plan Details */}
            {currentPlan ? (
              <View style={styles.planContent}>
                <Svgs.subcription />
                <Text style={styles.planName}>{t(currentPlan.name)}</Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>${currentPlan.amount}</Text>
                  {/* <View style={{marginLeft: wp(2)}}>
                <Text style={styles.priceMain}>${currentPlan.amount}</Text>
                <Text style={styles.priceSub}>{t('per user/per month')}</Text>
              </View> */}
                </View>

                <Text style={styles.planDesc}>{currentPlan.description}</Text>

                <View style={styles.divider} />

                <Text style={styles.includesTitle}>{t('Includes')} :</Text>

                {(currentPlan?.features ?? []).length > 0 ? (
                  currentPlan?.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Svgs.radioChecked />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.featureText}>
                    {t('No features listed for this plan.')}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.planDesc}>{t('No plan selected')}</Text>
            )}

            {/* Subscribe Button */}
          </ScrollView>

          {currentPlan && (
            <View style={styles.subscribeBtnContainer}>
              <CustomButton
                text={t(isSubscribed ? 'Cancel Subscription' : 'Subscribe Now')}
                textStyle={styles.subscribeText}
                containerStyle={styles.subscribeButton}
                onPress={() => {
                  if (isLogin) {
                    navigation.reset({
                      index: 0,
                      routes: [{name: SCREENS.LOGIN}],
                    });
                  } else {
                    confirmationBottomSheetRef.current?.open();
                  }
                }}
                isLoading={btnLoading}
                loaderColor={'#fff'}
                LoaderSize={25}
              />
            </View>
          )}
        </View>
      )}

      <ConfirmationBottomSheet
        ref={confirmationBottomSheetRef}
        icon={<Svgs.dollarGreenBG height={hp(10)} />}
        title={
          isSubscribed ? 'Unsubscribe from Premium?' : 'Upgrade Your Experience'
        }
        description={
          isSubscribed
            ? 'Once unsubscribed, your premium perks will be disabled immediately.'
            : 'Upgrade now and make the most of your experience.'
        }
        onConfirm={() => {
          if (isSubscribed) {
            confirmationBottomSheetRef.current?.close();
          } else {
            handleSubscribe();
          }
        }}
        onCancel={() => confirmationBottomSheetRef.current?.close()}
        confirmText={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        cancelText="Cancel"
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      paddingTop: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      flex: 1,
    },
    planContent: {
      flex: 1,
      paddingLeft: wp(10),
      paddingVertical: hp(2),
    },
    planName: {
      fontSize: RFPercentage(2.5),
      marginTop: hp(1),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    price: {
      fontSize: RFPercentage(5),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    priceMain: {
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoBold,
      textDecorationLine: 'line-through',
    },
    priceSub: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginLeft: wp(2),
      marginBottom: hp(0.5),
    },
    planDesc: {
      textAlign: 'left',
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontSize: RFPercentage(pxToPercentage(15)),
      marginTop: hp(0.5),
      fontFamily: Fonts.NunitoRegular,
      width: wp(80),
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginVertical: hp(3),
    },
    includesTitle: {
      fontSize: RFPercentage(2),
      marginBottom: hp(1),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    featureText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginLeft: wp(3),
    },
    linkText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      fontSize: RFPercentage(1.9),
      marginTop: hp(1),
      textDecorationLine: 'underline',
      fontFamily: Fonts.PoppinsRegular,
    },
    subscribeButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginTop: hp(1),
    },
    subscribeText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
    },
    subscribeBtnContainer: {
      paddingHorizontal: wp(4),
      // paddingTop: hp(1),
      borderTopWidth: wp(0.5),
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
  });

export default Subscription;
