import React, {useState} from 'react';
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
import LabeledSwitch from '@components/Buttons/LabeledSwitch';
import LabeledDropdown from '@components/DropDown/LabeledDropdown';
import StackHeader from '@components/Header/StackHeader';
import NumericStepper from '@components/Stepper/NumericStepper';
import {useTranslation} from 'react-i18next';
import {Svgs} from '@assets/Svgs/Svgs';
import LabeledCheckbox from '@components/CheckBox/LabeledCheckBox';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const AttendanceSettingsScreen = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const {t} = useTranslation();

  const [graceTimeEnabled, setGraceTimeEnabled] = useState(true);
  const [graceTimeValue, setGraceTimeValue] = useState(5);
  const [graceTimeUnit, setGraceTimeUnit] = useState('Mins');

  const [autoAbsentEnabled, setAutoAbsentEnabled] = useState(true);
  const [absentAfterValue, setAbsentAfterValue] = useState(1);
  const [absentAfterUnit, setAbsentAfterUnit] = useState('Hour');

  const [earlyArrivalEnabled, setEarlyArrivalEnabled] = useState(true);
  const [earlyArrivalValue, setEarlyArrivalValue] = useState(30);

  const [earlyOutEnabled, setEarlyOutEnabled] = useState(true);
  const [earlyOutValue, setEarlyOutValue] = useState(30);

  const [locationVerification, setLocationVerification] = useState(true);
  const [faceScanning, setFaceScanning] = useState(true);

  const styles = dynamicStyles(isDarkMode, Colors);

  const addButtonSections = [
    {
      title: t('Shift Schedule'),
      onPress: () => logger.log('Add Designation'),
    },
    {
      title: t('Leaves Types'),
      onPress: () => logger.log('Add Employment Type'),
    },
    {
      title: t('Attendance Status'),
      onPress: () => logger.log('Add Employment Type'),
    },
  ];

  const AddButtonSection = ({item}) => (
    <TouchableOpacity style={styles.addButtonContainer} onPress={item.onPress}>
      <Text style={styles.addButtonText}>{item.title}</Text>
      <Svgs.addCircled height={hp(4)} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StackHeader
        title="Attendance Settings"
        headerTxtStyle={styles.headerTxtStyle}
        headerStyle={styles.headerStyle(isDarkMode)}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Allow Grace Time */}

        <View
          style={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            paddingHorizontal: wp(4),
            paddingVertical: hp(1),
            borderRadius: 12,
          }}>
          <View style={styles.section}>
            <LabeledCheckbox
              title={t('Allow grace time')}
              value={graceTimeEnabled}
              onToggle={() => setGraceTimeEnabled(!graceTimeEnabled)}
              containerStyle={styles.checkboxStyle}
            />
            <View style={styles.inlineRow}>
              <Text style={styles.label}>{t('Late arrival after')}</Text>
              <NumericStepper
                value={graceTimeValue}
                setValue={setGraceTimeValue}
                min={0}
                max={60}
                containerStyle={{width: wp(18)}}
              />
              <LabeledDropdown
                data={[{label: 'Mins', value: 'Mins'}]}
                value={graceTimeUnit}
                onChange={item => setGraceTimeUnit(item.value)}
                width={wp(22)}
              />
              <Text style={styles.label}>{t('of shift.')}</Text>
            </View>
          </View>

          {/* Auto Mark Absent */}
          <View style={styles.section}>
            <LabeledCheckbox
              title={t('Auto mark absent')}
              value={autoAbsentEnabled}
              onToggle={() => setAutoAbsentEnabled(!autoAbsentEnabled)}
              containerStyle={styles.checkboxStyle}
            />

            <View style={styles.inlineRow}>
              <Text style={styles.label}>{t('After')}</Text>
              <NumericStepper
                value={absentAfterValue}
                setValue={setAbsentAfterValue}
                min={0}
                max={12}
                containerStyle={{width: wp(18)}}
              />
              <LabeledDropdown
                data={[{label: 'Hour', value: 'Hour'}]}
                value={absentAfterUnit}
                onChange={item => setAbsentAfterUnit(item.value)}
                width={wp(25)}
              />
              <Text style={styles.label}>{t('of actual shift.')}</Text>
            </View>
          </View>

          {/* Early Arrival */}
          <View style={styles.section}>
          
            <LabeledCheckbox
              title={t('Count early arrival')}
              value={earlyArrivalEnabled}
              onToggle={() => setEarlyArrivalEnabled(!earlyArrivalEnabled)}
              containerStyle={styles.checkboxStyle}
            />
            <View style={styles.inlineRow}>
              <NumericStepper
                value={earlyArrivalValue}
                setValue={setEarlyArrivalValue}
                min={0}
                max={120}
                containerStyle={{width: wp(18)}}
              />
              <LabeledDropdown
                data={[{label: 'Hour', value: 'Hour'}]}
                value={absentAfterUnit}
                onChange={item => setAbsentAfterUnit(item.value)}
                width={wp(25)}
              />
              <Text style={styles.label}>{t('Before of actual shift.')}</Text>
            </View>
          </View>

          {/* Early Out */}
          <View style={styles.section}>
            {/* <LabeledSwitch
              title="Count early out"
              value={earlyOutEnabled}
              onValueChange={setEarlyOutEnabled}
            /> */}
            <LabeledCheckbox
              title={t('Count early out')}
              value={earlyOutEnabled}
              onToggle={() => setEarlyOutEnabled(!earlyOutEnabled)}
              containerStyle={styles.checkboxStyle}
            />
            <View style={styles.inlineRow}>
              <NumericStepper
                value={earlyOutValue}
                setValue={setEarlyOutValue}
                min={0}
                max={120}
                containerStyle={{width: wp(18)}}
              />
              <LabeledDropdown
                data={[{label: 'Hour', value: 'Hour'}]}
                value={absentAfterUnit}
                onChange={item => setAbsentAfterUnit(item.value)}
                width={wp(25)}
              />
              <Text style={styles.label}>{t('Before of actual shift.')}</Text>
            </View>
          </View>
        </View>

        {/* Profile Verification */}
        <View
          style={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            paddingHorizontal: wp(4),
            borderRadius: 12,
            marginTop: hp(2),
            paddingVertical: hp(1),
          }}>
          <Text style={styles.sectionTitle}>{t('Profile Verification')}</Text>
          <View style={styles.section}>
            <LabeledSwitch
              title="Location Verification"
              value={locationVerification}
              onValueChange={setLocationVerification}
            />
            <LabeledSwitch
              title="Face Scanning"
              value={faceScanning}
              onValueChange={setFaceScanning}
            />
          </View>
        </View>

        {addButtonSections.map((item, index) => (
          <AddButtonSection key={index} item={item} />
        ))}

       
      </ScrollView>
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
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    headerStyle: isDark => ({
      paddingVertical: hp(2),
      backgroundColor: isDark
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    }),
    content: {
      paddingVertical: wp(5),
      paddingHorizontal: wp(3),
    },
    section: {
      marginBottom: hp(2),
    },
    sectionTitle: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(1),
    },
    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      marginTop: hp(1),
      flexWrap: 'wrap',
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
  });

export default AttendanceSettingsScreen;
