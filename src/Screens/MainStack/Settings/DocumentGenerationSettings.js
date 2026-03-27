// screens/DocumentGenerationSettings.js
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import StackHeader from '@components/Header/StackHeader';
import LabeledSwitch from '@components/Buttons/LabeledSwitch';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import CustomSwitch from '@components/Buttons/CustomSwitch';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import CustomButton from '@components/Buttons/customButton';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';
import {Svgs} from '@assets/Svgs/Svgs';
import logger from '@utils/logger';



const getSettingsURL = `${baseUrl}/documents/automated/settings`;
const DocumentGenerationSettings = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const styles = dynamicStyles(isDarkMode, Colors);
  const confirmationSheetRef = useRef(null);
  const {t} = useTranslation();
  const {showAlert} = useAlert();
  const [loading, setLoading] = useState({
    employmentLoading: false,
    paySlip: false,
    automationEnable: false,
  });

  // Global Automation Enable

  const checkConnectivity = async () => {
    try {
      const connected = await isConnected();
      return connected;
    } catch (error) {
      logger.log('Connectivity check failed:', error, { context: 'DocumentGenerationSettings' });
      return false;
    }
  };
  const [automationEnabled, setAutomationEnabled] = useState(false);

  const [employmentCertificateTrigger, setEmploymentCertificateTrigger] =
    useState('manaual');

  const [payslipTrigger, setPayslipTrigger] = useState('monthly');

  const updateEmploymentCertificateSettings = async loadingState => {
    if (loadingState === 'automationEnabled') {
      setLoading(prev => ({...prev, automationEnable: true}));
    } else {
      setLoading(prev => ({...prev, employmentLoading: true}));
    }
    const payload = {
      document_type: 'employment_certificate', //employment_certificate or payslip
      automation_enabled: automationEnabled,
      auto_send_enabled: automationEnabled,
      trigger_event: employmentCertificateTrigger,
    };
    const {ok, data} = await fetchApis(
      `${baseUrl}/documents/automated/settings`,
      'PUT',
      null,
      payload,
      null,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    );
    ApiResponse(showAlert, data, language);

    if (ok) {
      setLoading(prev => ({
        ...prev,
        automationEnable: false,
        employmentLoading: false,
      }));
    } else {
      return;
    }
  };

  const updatePayslipSettings = async loadingState => {
    if (loadingState === 'automationEnabled') {
      setLoading(prev => ({...prev, automationEnable: true}));
    } else {
      setLoading(prev => ({...prev, paySlip: true}));
    }

    const payload = {
      document_type: 'payslip', //employment_certificate or payslip
      automation_enabled: automationEnabled,
      auto_send_enabled: automationEnabled,
      trigger_event: payslipTrigger,
    };

    const {ok, data} = await fetchApis(
      `${baseUrl}/documents/automated/settings`,
      'PUT',
      null,
      payload,
      null,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    );
    ApiResponse(showAlert, data, language);

    if (ok) {
    } else {
    }
    setLoading(prev => ({...prev, paySlip: false, employmentLoading: false}));
  };

  const getSettings = async () => {
    const connected = await checkConnectivity();
    if (!connected) {
      showAlert('Please Check Your Internet Connection', 'error');
      navigation.goBack();
      return;
    }
    const {ok, data} = await fetchApis(
      getSettingsURL,
      'GET',
      null,
      null,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
    );

    if (ok) {
      setAutomationEnabled(
        data?.data?.settings?.some(item => item?.auto_send_enabled === true) ||
          false,
      );
      setEmploymentCertificateTrigger(data?.data?.settings[0]?.trigger_event);
      setPayslipTrigger(data?.data?.settings[1]?.trigger_event);
    } else {
      ApiResponse(showAlert, data, language);
    }
  };
  useEffect(() => {
    getSettings();
  }, []);
  const onConfirm = () => {
    setAutomationEnabled(!automationEnabled);
    setLoading(prev => ({...prev, automationEnable: true}));
    confirmationSheetRef.current?.close();
    updateEmploymentCertificateSettings('automationEnabled');
    updatePayslipSettings('automationEnabled');
  };

  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Automation Enable')}
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

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Master Automation Switch */}
        <View style={styles.topSwitchWrapper}>
          <LabeledSwitch
            title={t('Automation Enable')}
            value={automationEnabled}
            onValueChange={() => {
              confirmationSheetRef.current?.open();
            }}
            titleTextStyle={[styles.subLabel, {marginBottom: 0}]}
            loading={loading.automationEnable}
          />
        </View>

        {/* Employment Certificate Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Employment Certificate')}</Text>

          <Text style={styles.subLabel}>{t('Event Trigger')}</Text>

          <View style={styles.SwitchContainer}>
            <Text
              style={[
                styles.toggleTitle,
                {
                  color: isDarkMode
                    ? Colors.lightTheme.secondryTextColor
                    : Colors.darkTheme.secondryTextColor,
                },
              ]}>
              {t('Manual')}
            </Text>
            <CustomSwitch
              value={employmentCertificateTrigger === 'on_approval'}
              onValueChange={() => {
                if (employmentCertificateTrigger === 'on_approval') {
                  setEmploymentCertificateTrigger('manaual');
                } else {
                  setEmploymentCertificateTrigger('on_approval');
                }
              }}
            />
            <Text
              style={[
                styles.toggleTitle,
                {
                  color: isDarkMode
                    ? Colors.lightTheme.primaryColor
                    : Colors.darkTheme.primaryColor,
                },
              ]}>
              {t('On-Approval')}
            </Text>
          </View>

          <CustomButton
            containerStyle={styles.saveButton}
            textStyle={styles.saveButtonText}
            text={t('Save Settings')}
            onPress={() => updateEmploymentCertificateSettings()}
            isLoading={loading.employmentLoading}
          />
        </View>

        {/* Payslip Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('Payslip')}</Text>

          <Text style={styles.subLabel}>{t('Event Trigger')}</Text>
          <View style={styles.SwitchContainer}>
            <Text
              style={[
                styles.toggleTitle,
                {
                  color: isDarkMode
                    ? Colors.lightTheme.secondryTextColor
                    : Colors.darkTheme.secondryTextColor,
                },
              ]}>
              {t('Monthly')}
            </Text>
            <CustomSwitch
              value={payslipTrigger === 'on_approval'}
              onValueChange={() => {
                if (payslipTrigger === 'on_approval') {
                  setPayslipTrigger('monthly');
                } else {
                  setPayslipTrigger('on_approval');
                }
              }}
            />
            <Text
              style={[
                styles.toggleTitle,
                {
                  color: isDarkMode
                    ? Colors.lightTheme.primaryColor
                    : Colors.darkTheme.primaryColor,
                },
              ]}>
              {t('On-Approval')}
            </Text>
          </View>

          <CustomButton
            containerStyle={styles.saveButton}
            textStyle={styles.saveButtonText}
            text={t('Save Settings')}
            onPress={() => updatePayslipSettings()}
            isLoading={loading.paySlip}
          />
        </View>
      </ScrollView>

      <ConfirmationBottomSheet
        ref={confirmationSheetRef}
        icon={<Svgs.autoL height={hp(10)} width={wp(30)} />}
        title="Automation Enable"
        description="Are you sure you want to enable automation?"
        onConfirm={onConfirm}
        onCancel={() => confirmationSheetRef.current?.close()}
        confirmText="Enable"
        cancelText="Cancel"
      />
    </View>
  );
};

export default DocumentGenerationSettings;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    scrollContainer: {
      paddingHorizontal: wp(5),
    },
    topSwitchWrapper: {
      marginTop: hp(2),
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(4),
      borderRadius: 10,
    },
    card: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 12,
      padding: wp(4),
      marginBottom: hp(2),
    },
    cardTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.3),
      marginBottom: hp(1.5),
      color: Colors.primaryText,
    },
    subLabel: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.9),
      marginBottom: hp(1),
      color: Colors.secondaryText,
    },
    segmentToggle: {
      flexDirection: 'row',
      backgroundColor: Colors.borderColor + '30',
      borderRadius: 10,
      marginBottom: hp(2),
    },
    segmentOption: {
      flex: 1,
      paddingVertical: hp(1.2),
      alignItems: 'center',
      borderRadius: 10,
    },
    segmentSelected: {
      backgroundColor: Colors.darkTheme.primaryBtn?.BtnColor,
    },
    segmentText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.9),
    },
    saveButton: {
      backgroundColor: Colors.darkTheme.primaryBtn?.BtnColor,
      paddingVertical: hp(1.2),
      borderRadius: 10,
      alignItems: 'center',
    },
    saveButtonText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: Colors.darkTheme.primaryBtn?.TextColor,
      fontSize: RFPercentage(2),
    },
    toggleTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors?.darkTheme?.primaryTextColor
        : Colors?.lightTheme?.primaryTextColor,
    },
    SwitchContainer: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      gap: wp(2),
      marginBottom: hp(2),
    },
  });
