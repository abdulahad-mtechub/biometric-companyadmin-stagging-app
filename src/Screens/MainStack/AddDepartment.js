import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import TxtInput from '@components/TextInput/Txtinput';
import { Fonts } from '@constants/Fonts';
import { useAlert } from '@providers/AlertContext';
import logger from '@utils/logger';

const AddDepartment = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const [departmentName, setDepartmentName] = useState('');
  const [Hod, setHod] = useState('');
  const [Members, setMembers] = useState('');
  const {t} = useTranslation();
  const {showAlert} = useAlert();

  const underDevelopment = () => {
    showAlert('Under Development', 'error');
    navigation.goBack();
  };

  const handleAdd = () => {};
  return (
    <View style={styles.contianer}>
      <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
        <View style={{paddingHorizontal: wp(5), flex: 3}}>
          <View style={styles.backArrowContainer}>
            <MaterialCommunityIcons
              name={'close'}
              size={RFPercentage(4)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.iconColor
              }
              onPress={() => {
                navigation.goBack();
              }}
            />

            <Text style={[styles.heading]}>{t('Add Department')}</Text>
          </View>
          <Text
            style={[
              styles.heading,
              {textAlign: 'left', fontFamily: Fonts.PoppinsSemiBold},
            ]}>
            {t('Department Details')}
          </Text>

          <Text style={styles.label}>
            {t('Name')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>

          <TxtInput
            value={departmentName}
            containerStyle={styles.inputField}
            placeholder="E.g. Design Department"
            onChangeText={setDepartmentName}
          />

          <Text style={styles.label}>
            {t('Head of Department (HOD)')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>

          <CustomDropDown
            data={[{label: 'John Doe', value: 'John Doe'}]}
            selectedValue={Hod}
            onValueChange={setHod}
            placeholder="Select"
            width={'100%'}
            astrik={true}
          />

          <Text style={styles.label}>
            {t('Add Members')} <Text style={{color: Colors.error}}> *</Text>
          </Text>

          <CustomDropDown
            data={[{label: 'John Doe', value: 'John Doe'}]}
            selectedValue={Members}
            onValueChange={setMembers}
            placeholder="Select"
            width={'100%'}
            astrik={true}
          />
          {/* </View> */}
          <View
            style={{
              flexDirection: 'row',
              marginVertical: hp(1),
              flexWrap: 'wrap',
            }}>
            <Text style={styles.selectedZone}>John Doe ╳</Text>
            <Text style={styles.selectedZone}>Michelle Mikal ╳</Text>
            <Text style={styles.selectedZone}>Daniel Doe ╳</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Save'}
          onPress={underDevelopment}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>
    </View>
  );
};

export default AddDepartment;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    contianer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    backArrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: hp(2),
    },
    heading: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsMedium,
      textAlign: 'center',
      width: wp(80),
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      //   width: wp(80),
      marginBottom: hp(0.5),
      marginTop: hp(2),
    },

    selectedZone: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      backgroundColor: '#579DFF',
      paddingVertical: hp(1),
      paddingHorizontal: wp(2),
      borderRadius: wp(1),
      marginRight: wp(2),
      marginBottom: hp(1),
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      // flex: 0.2,
      //   position: "absolute",
      //   bottom: hp(2.5),
      //   left: wp(0),
      //   right: wp(0),
      paddingVertical: wp(4),
      paddingHorizontal: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      // marginBottom: hp(2),
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
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
