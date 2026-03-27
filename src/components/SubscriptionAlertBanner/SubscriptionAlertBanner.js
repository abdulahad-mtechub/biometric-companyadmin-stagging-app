import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import {Fonts} from '@constants/Fonts';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {setFeatures} from '@redux/Slices/subscriptionSlice';
import {usePlanDetails} from '@utils/Hooks/Hooks';
import logger from '@utils/logger';

const SubscriptionAlertBanner = ({onPress, planData}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const {planDetails, loading, refetch} = usePlanDetails();
  const dispatch = useDispatch();
  const styles = dynamicStyles(isDarkMode, Colors);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const shake = useSharedValue(0);
  const pulse = useSharedValue(1);

  const [features, setFeaturess] = useState([]);
const allFeatures = ['attendance', 'tasks', 'requests', 'documents', 'payments','reports']
  const getFeatures = plan_id => {
    switch (plan_id) {
      case 'full_monthly':
        return allFeatures;
      case 'full_yearly':
        return allFeatures;
      case 'attendance_monthly':
        return ['attendance'];
      case 'attendance_yearly':
        return ['attendance'];
      default:
        return [];
    }
  };

  useEffect(() => {
    if (!planDetails) return;

    const subscriptionStatus = planDetails.subscription_status;
    const currentPlanData = planDetails.current_plan;
    const apiFeatures = currentPlanData?.features || [];

    const isTrial = currentPlanData?.trial_period === true;
    const isBlocked = subscriptionStatus?.detailed_status === 'blocked';

    const featuresToDispatch =
      isTrial || isBlocked
        ? allFeatures
        : getFeatures(currentPlanData?.plan_id);

    if (featuresToDispatch.length) {
      dispatch(setFeatures(featuresToDispatch));
    } else {
    }
  }, [planDetails, dispatch]);

  const getAlertInfo = () => {
    if (!planDetails) return null;

    const {subscription_status, trial_info} = planDetails;

    if (!subscription_status) return null;

    const {detailed_status, days_remaining, subscription_type} =
      subscription_status;

    const type =
      trial_info?.trial_status === 'active' ? 'trial' : 'subscription';

    // Show alerts only for these statuses
    const alertStatuses = [
      'payment_overdue',
      'warning',
      'critical',
      'expired',
      'blocked',
      'upgrade_required',
      // 'inactive',
    ];

    if (
      !alertStatuses.includes(
        planDetails?.upgrade_info?.upgrade_required
          ? 'upgrade_required'
          : detailed_status,
      )
    ) {
      return null;
    }

    return {
      status: 'upgrade_required',
      days: days_remaining || 0,
      type: type,
      subscriptionType: subscription_type,
    };
  };

  const alertInfo = getAlertInfo();

  React.useEffect(() => {
    if (alertInfo) {
      scale.value = withSpring(1, {damping: 12, stiffness: 200});
      opacity.value = withTiming(1, {duration: 300});
      translateY.value = withSpring(0, {damping: 12, stiffness: 200});

      // Urgent shake animation for critical statuses
      const urgentStatuses = [
        'payment_overdue',
        'critical',
        'expired',
        'blocked',
      ];
      if (urgentStatuses.includes(alertInfo.status)) {
        shake.value = withDelay(
          500,
          withSequence(
            withTiming(-5, {duration: 50}),
            withTiming(5, {duration: 50}),
            withTiming(-5, {duration: 50}),
            withTiming(5, {duration: 50}),
            withTiming(0, {duration: 50}),
          ),
        );
      }

      // Pulse animation for warnings
      if (alertInfo.status === 'warning') {
        pulse.value = withSequence(
          withTiming(1.02, {duration: 1000}),
          withTiming(1, {duration: 1000}),
        );
      }
    } else {
      scale.value = withSpring(0.8, {damping: 12, stiffness: 200});
      opacity.value = withTiming(0, {duration: 300});
      translateY.value = withSpring(-20, {damping: 12, stiffness: 200});
    }
  }, [alertInfo]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: scale.value},
        {translateY: translateY.value},
        {translateX: shake.value},
      ],
      opacity: opacity.value,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: pulse.value}],
    };
  });

  const iconAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate:
            shake.value !== 0
              ? withSequence(
                  withTiming('-5deg', {duration: 50}),
                  withTiming('5deg', {duration: 50}),
                  withTiming('-5deg', {duration: 50}),
                  withTiming('5deg', {duration: 50}),
                  withTiming('0deg', {duration: 50}),
                )
              : '0deg',
        },
      ],
    };
  });

  if (loading) {
    return null;
  }

  if (!alertInfo) {
    return null; // Comment this out temporarily
    console.log('🚨 AlertInfo is null - planDetails:', planDetails); // Add debug
    // return null; // Comment this out
  }

  const getAlertMessage = () => {
    const {status, days, type} = alertInfo;

    const typeLabel = type === 'trial' ? 'free trial' : 'subscription';

    switch (status) {
      case 'payment_overdue':
        return t('Payment overdue! Update payment method to continue service.');

      case 'warning':
        if (days === 1) {
          return t(
            `Your ${typeLabel} expires in 1 day. Renew soon to avoid interruption.`,
          );
        }
        return t(
          `Your ${typeLabel} expires in {{days}} days. Renew soon to avoid interruption.`,
          {days},
        );

      case 'critical':
        if (days === 1) {
          return t(`Your ${typeLabel} expires in 1 day! Renew now.`);
        }
        return t(`Your ${typeLabel} expires in {{days}} days! Renew now.`, {
          days,
        });

      case 'expired':
        return t(
          `Your ${typeLabel} has expired! Renew immediately to restore access.`,
        );

      case 'blocked':
        return t(
          `Your account is blocked due to expired ${typeLabel}. Contact support or renew.`,
        );

      case 'inactive':
        return t('No active subscription. Upgrade to unlock all features.');
      case 'upgrade_required':
        return t('You need to upgrade your plan.');

      default:
        return t('Subscription alert');
    }
  };

  const getAlertType = () => {
    const {status} = alertInfo;

    // Urgent statuses
    const urgentStatuses = [
      'payment_overdue',
      'expired',
      'blocked',
      'critical',
    ];
    if (urgentStatuses.includes(status)) {
      return 'urgent';
    }

    // Warning status
    if (status === 'warning') {
      return 'warning';
    }

    // Info status
    if (status === 'inactive') {
      return 'info';
    }

    return 'info';
  };

  const alertType = getAlertType();

  // Status-based gradients matching exact hex codes
  const gradients = {
    payment_overdue: ['#F59E0B', '#FB923C'], // Amber
    warning: ['#EAB308', '#FCD34D'], // Yellow
    critical: ['#DC2626', '#EF4444'], // Red
    expired: ['#B91C1C', '#DC2626'], // Dark Red
    blocked: ['#7F1D1D', '#991B1B'], // Grayish Red
    inactive: ['#6B7280', '#9CA3AF'], // Neutral Gray
  };

  const currentGradient = gradients[alertInfo.status] || gradients.inactive;

  const iconName =
    alertType === 'urgent'
      ? 'alert-circle'
      : alertType === 'warning'
      ? 'alert-triangle'
      : 'info';

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, {damping: 12, stiffness: 200}),
      withSpring(1, {damping: 12, stiffness: 200}),
    );

    refetch();
    setTimeout(() => {
      onPress?.();
    }, 150);
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          marginHorizontal: wp(4),
          marginVertical: hp(1),
          // paddingHorizontal: wp(3),
          // height: hp(11),
          // overflow:'hidden'
        },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        {/* <Animated.View style={pulseStyle}> */}
        <LinearGradient
          colors={currentGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[
            styles.bannerContainer,
            // {height: alertInfo.status === 'critical' ? hp(10) : hp(13)},
          ]}>
          <View style={styles.iconWrapper}>
            <Animated.View style={[styles.iconContainer, iconAnimation]}>
              <Feather name={iconName} size={hp(3)} color="#000" />
            </Animated.View>
          </View>
          <Text style={styles.alertText}>{getAlertMessage()}</Text>
          <Feather name="chevron-right" size={hp(3)} color="#FFF" />
        </LinearGradient>
        {/* </Animated.View> */}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SubscriptionAlertBanner;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    bannerContainer: {
      borderRadius: wp(4),
      // paddingVertical: hp(1.5),
      // paddingHorizontal: wp(4),
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
      backgroundColor: 'green',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: hp(7),
    },

    iconWrapper: {
      marginRight: wp(3),
    },
    iconContainer: {
      width: hp(5),
      height: hp(5),
      borderRadius: hp(2.5),
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
      marginLeft: wp(2),
    },
    alertText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.7),
      color: '#fff',
      textAlign: 'left',
      // flexWrap:'wrap',
      width: wp(70),
    },
    chevronContainer: {
      marginLeft: wp(2),
    },
  });
