// components/WorkerLimitAlert/WorkerLimitAlert.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import logger from '@utils/logger';

const WorkerLimitAlert = ({onUpgradePress, planDetails, totalWorkers}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const maxWorkers = planDetails?.subscription_status?.status === 'trial' ? 5 : planDetails?.company_info?.max_employees_limit;
  const currentWorkersCount = planDetails?.company_info?.current_workers_count;
  const isAtWorkerLimit = currentWorkersCount >= maxWorkers;

  if (!isAtWorkerLimit) return null;
  


  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('Employee Limit Reached')}</Text>
          <Text style={styles.description}>
            {t('You have reached your Employee limit')} ({totalWorkers}/
            {maxWorkers}). {t('Upgrade your plan to add more Employees')}.
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onUpgradePress}>
          <Text style={styles.buttonText}>{t('Upgrade Plan')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#331515' : '#FFE8E8',
      marginHorizontal: wp(4),
      marginVertical: hp(1),
      borderRadius: hp(1),
      //   borderLeftWidth: 4,
      //   borderLeftColor: '#FF4444',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: hp(2),
    },
    textContainer: {
      flex: 1,
      marginRight: hp(1),
    },
    title: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.8),
      color: isDarkMode ? '#FF6B6B' : '#D32F2F',
      marginBottom: hp(0.5),
    },
    description: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      color: isDarkMode ? '#FFA8A8' : '#B71C1C',
      lineHeight: hp(2.2),
    },
    button: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: hp(1.5),
      paddingVertical: hp(1),
      borderRadius: hp(0.8),
      minWidth: hp(12),
    },
    buttonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

export default WorkerLimitAlert;
