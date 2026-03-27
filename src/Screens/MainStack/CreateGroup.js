import { t } from 'i18next';
import React, { useState } from 'react';
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

const CreateGroup = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const [TeamName, setTeamName] = useState('');
  const [lead, setlead] = useState('');
  const [Members, setMembers] = useState('');

  const {showAlert} = useAlert();

  const handleAdd = () => {
    showAlert('Under Development', 'success');
    navigation.goBack();
  };
  return (
    <View style={styles.contianer}>
      <ScrollView style={{flex: 1}}>
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

            <Text style={[styles.heading]}>{t('Create Group')}</Text>
          </View>
          <Text
            style={[
              styles.heading,
              {textAlign: 'left', fontFamily: Fonts.PoppinsSemiBold},
            ]}>
            {t('Group Details')}
          </Text>

          <Text style={styles.label}>
            {t('Name')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>

          <TxtInput
            value={TeamName}
            containerStyle={styles.inputField}
            placeholder="E.g. Team # 1"
            onChangeText={setTeamName}
          />

          <Text style={styles.label}>
            {t('Group Admin')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>

          <CustomDropDown
            data={[{label: 'John Doe', value: 'John Doe'}]}
            selectedValue={lead}
            onValueChange={setlead}
            placeholder="Select"
            width={'100%'}
            astrik={true}
            zIndex={2000}
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
          onPress={handleAdd}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>
    </View>
  );
};

export default CreateGroup;

const dynamicStyles = (isDarkMode, Colors) =>
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
      paddingVertical: wp(4),
      paddingHorizontal: wp(3),
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
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
