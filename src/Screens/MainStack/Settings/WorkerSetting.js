// screens/WorkerSetting.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import LabeledSwitch from '@components/Buttons/LabeledSwitch';
import LabeledCheckbox from '@components/CheckBox/LabeledCheckBox';
import StackHeader from '@components/Header/StackHeader';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const WorkerSetting = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  // === WORKER PERMISSIONS STATES ===
  const [canEditEmploymentDetails, setCanEditEmploymentDetails] = useState(false);
  const [canEditPersonalDetails, setCanEditPersonalDetails] = useState(true);
  const [canChangeAddress, setCanChangeAddress] = useState(true);
  const [canChangeVerificationImage, setCanChangeVerificationImage] = useState(true);

  // === REQUIRED PERSONAL DETAILS STATES ===
  const [fullNameRequired, setFullNameRequired] = useState(true);
  const [dobRequired, setDobRequired] = useState(false);
  const [phoneNumberRequired, setPhoneNumberRequired] = useState(false);

  // === REQUIRED EMPLOYMENT DETAILS STATES ===
  const [workingIdRequired, setWorkingIdRequired] = useState(false);
  const [departmentRequired, setDepartmentRequired] = useState(true);
  const [designationRequired, setDesignationRequired] = useState(true);
  const [employmentTypeRequired, setEmploymentTypeRequired] = useState(true);
  const [salaryRequired, setSalaryRequired] = useState(false);
  const [hiringDateRequired, setHiringDateRequired] = useState(true);
  const [shiftScheduleRequired, setShiftScheduleRequired] = useState(false);

  // === REGION/ZONE DETAILS STATES ===
  const [regionZoneDetailsEnabled, setRegionZoneDetailsEnabled] = useState(true);
  const [requiredZone, setRequiredZone] = useState(false);
  const [requiredCountries, setRequiredCountries] = useState(true);
  const [requiredCities, setRequiredCities] = useState(true);

  // === PROFILE VERIFICATION STATES ===
  const [locationVerification, setLocationVerification] = useState(true);
  const [faceScanning, setFaceScanning] = useState(true);

  const sections = [
    {
      title: null, // First section without title
      data: [
        {
          label: t('Can edit employment details'),
          value: canEditEmploymentDetails,
          onToggle: () => setCanEditEmploymentDetails(!canEditEmploymentDetails),
          type: 'switch'
        },
        {
          label: t('Can edit personal details'),
          value: canEditPersonalDetails,
          onToggle: () => setCanEditPersonalDetails(!canEditPersonalDetails),
          type: 'switch'
        },
        {
          label: t('Can change address'),
          value: canChangeAddress,
          onToggle: () => setCanChangeAddress(!canChangeAddress),
          type: 'switch'
        },
        {
          label: t('Can change verification image'),
          value: canChangeVerificationImage,
          onToggle: () => setCanChangeVerificationImage(!canChangeVerificationImage),
          type: 'switch'
        },
      ],
    },
    {
      title: t('Required Personal Details'),
      data: [
        {
          label: t('Full Name'),
          value: fullNameRequired,
          onToggle: () => setFullNameRequired(!fullNameRequired),
          type: 'switch'
        },
        {
          label: t('Date of Birth (DOB)'),
          value: dobRequired,
          onToggle: () => setDobRequired(!dobRequired),
          type: 'switch'
        },
        {
          label: t('Phone Number'),
          value: phoneNumberRequired,
          onToggle: () => setPhoneNumberRequired(!phoneNumberRequired),
          type: 'switch'
        },
      ],
    },
    {
      title: t('Required Employment Details'),
      data: [
        {
          label: t('Working ID'),
          value: workingIdRequired,
          onToggle: () => setWorkingIdRequired(!workingIdRequired),
          type: 'switch'
        },
        {
          label: t('Department'),
          value: departmentRequired,
          onToggle: () => setDepartmentRequired(!departmentRequired),
          type: 'switch'
        },
        {
          label: t('Designation'),
          value: designationRequired,
          onToggle: () => setDesignationRequired(!designationRequired),
          type: 'switch'
        },
        {
          label: t('Employment Type'),
          value: employmentTypeRequired,
          onToggle: () => setEmploymentTypeRequired(!employmentTypeRequired),
          type: 'switch'
        },
        {
          label: t('Salary'),
          value: salaryRequired,
          onToggle: () => setSalaryRequired(!salaryRequired),
          type: 'switch'
        },
        {
          label: t('Hiring Date'),
          value: hiringDateRequired,
          onToggle: () => setHiringDateRequired(!hiringDateRequired),
          type: 'switch'
        },
        {
          label: t('Shift Schedule'),
          value: shiftScheduleRequired,
          onToggle: () => setShiftScheduleRequired(!shiftScheduleRequired),
          type: 'switch'
        },
      ],
    },
    {
      title: t('Region/Zone Details'),
      titleType: 'checkbox',
      titleValue: regionZoneDetailsEnabled,
      titleOnToggle: () => setRegionZoneDetailsEnabled(!regionZoneDetailsEnabled),
      data: [
        {
          label: t('Required Zone'),
          value: requiredZone,
          onToggle: () => setRequiredZone(!requiredZone),
          type: 'switch'
        },
        {
          label: t('Required Countries'),
          value: requiredCountries,
          onToggle: () => setRequiredCountries(!requiredCountries),
          type: 'switch'
        },
        {
          label: t('Required Cities'),
          value: requiredCities,
          onToggle: () => setRequiredCities(!requiredCities),
          type: 'switch'
        },
      ],
    },
    {
      title: t('Profile Verification'),
      data: [
        {
          label: t('Location Verification'),
          value: locationVerification,
          onToggle: () => setLocationVerification(!locationVerification),
          type: 'switch'
        },
        {
          label: t('Face Scanning'),
          value: faceScanning,
          onToggle: () => setFaceScanning(!faceScanning),
          type: 'switch'
        },
      ],
    },
  ];

  const addButtonSections = [
    {
      title: t('Designation'),
      onPress: () => logger.log('Add Designation'),
    },
    {
      title: t('Employment Type'),
      onPress: () => logger.log('Add Employment Type'),
    },
  ];

  const SectionTitle = ({section}) => {
    if (!section.title) return null;
    
    if (section.titleType === 'checkbox') {
      return (
        <View style={styles.checkboxTitleContainer}>
          <LabeledCheckbox
            title={section.title}
            value={section.titleValue}
            onToggle={section.titleOnToggle}
            containerStyle={styles.sectionTitleCheckbox}
          />
        </View>
      );
    }
    
    return <Text style={styles.sectionTitle}>{section.title}</Text>;
  };

  const SettingsSection = ({section}) => (
    <View style={styles.sectionWrapper}>
      <SectionTitle section={section} />
      <View style={styles.sectionContainer}>
        {section.data.map((item, index) => (
          <LabeledSwitch
            key={index}
            title={item.label}
            value={item.value}
            onValueChange={item.onToggle}
            containerStyle={styles.switchContainer}
          />
        ))}
      </View>
    </View>
  );

  const AddButtonSection = ({item}) => (
    <TouchableOpacity 
      style={styles.addButtonContainer}
      onPress={item.onPress}
    >
      <Text style={styles.addButtonText}>{item.title}</Text>
       <Svgs.addCircled height={hp(4)} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Employee Settings')}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(2.5),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={{
          paddingVertical: hp(2), 
          backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.backgroundColor
        }}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: hp(5)}}>
        
        {sections.map((section, index) => (
          <SettingsSection key={index} section={section} />
        ))}

        {addButtonSections.map((item, index) => (
          <AddButtonSection key={index} item={item} />
        ))}
        
      </ScrollView>
    </View>
  );
};

export default WorkerSetting;

const dynamicStyles = (isDarkMode,Colors) =>
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
      marginTop: hp(1),
    },
    sectionWrapper: {
      marginBottom: hp(2),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
      marginTop: hp(1),
    },
    checkboxTitleContainer: {
      marginBottom: hp(1),
      marginTop: hp(1),
    },
    sectionTitleCheckbox: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
    },
    sectionContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 12,
      paddingHorizontal: wp(2),
      paddingVertical: hp(1),
    },
    switchContainer: {
      marginVertical: hp(0.2),
    },
    addButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // backgroundColor: isDarkMode
      //   ? Colors.darkTheme.secondryColor
      //   : Colors.lightTheme.backgroundColor,
      borderRadius: 12,
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      // marginBottom: hp(2),
    },
    addButtonText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    addIconContainer: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor + '20'
        : Colors.lightTheme.primaryBtn.BtnColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });