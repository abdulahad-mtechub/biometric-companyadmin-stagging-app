// screens/WorkerSetting.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

  // === TASK SETTINGS STATES ===
  const [hodCanAssignTaskToTeams, setHodCanAssignTaskToTeams] = useState(true);
  const [hodCanAssignTaskToSingleWorker, setHodCanAssignTaskToSingleWorker] =
    useState(true);
  const [hodCanCreateTeams, setHodCanCreateTeams] = useState(true);
  const [teamLeadCanCreateTask, setTeamLeadCanCreateTask] = useState(true);

  // === PROFILE VERIFICATION STATES ===
  const [locationVerification, setLocationVerification] = useState(true);
  const [faceScanning, setFaceScanning] = useState(true);

  const sections = [
    {
      title: null, // Task Settings section without explicit title
      data: [
        {
          label: t('HOD can assign task to teams'),
          value: hodCanAssignTaskToTeams,
          onToggle: () => setHodCanAssignTaskToTeams(!hodCanAssignTaskToTeams),
          type: 'switch',
        },
        {
          label: t('HOD can assign task to single employee'),
          value: hodCanAssignTaskToSingleWorker,
          onToggle: () =>
            setHodCanAssignTaskToSingleWorker(!hodCanAssignTaskToSingleWorker),
          type: 'switch',
        },
        {
          label: t('HOD can create the teams'),
          value: hodCanCreateTeams,
          onToggle: () => setHodCanCreateTeams(!hodCanCreateTeams),
          type: 'switch',
        },
        {
          label: t('Team lead can create task'),
          value: teamLeadCanCreateTask,
          onToggle: () => setTeamLeadCanCreateTask(!teamLeadCanCreateTask),
          type: 'switch',
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
          type: 'switch',
        },
        {
          label: t('Face Scanning'),
          value: faceScanning,
          onToggle: () => setFaceScanning(!faceScanning),
          type: 'switch',
        },
      ],
    },
  ];

  const addButtonSections = [
    {
      title: t('Task Priority'),
      onPress: () => logger.log('Add Task Priority'),
    },
    {
      title: t('Task Status'),
      onPress: () => logger.log('Add Task Status'),
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
    <TouchableOpacity style={styles.addButtonContainer} onPress={item.onPress}>
      <Text style={styles.addButtonText}>{item.title}</Text>
      <Svgs.addCircled height={hp(4)} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Task Settings')}
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

      borderRadius: 12,
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
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
