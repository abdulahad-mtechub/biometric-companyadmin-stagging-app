import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import TxtInput from '@components/TextInput/Txtinput';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const UploadPolicy = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode,Colors);
  const [docName, setDocName] = useState('');
  const [customize, setCustomize] = useState('');
  const [version, setVersion] = useState('');
  const [version2, setVersion2] = useState('');
  const [description, setDescription] = useState('');
  const [document, setDocument] = useState('');
  const [isCustomize, setIsCustomize] = useState(false);
  const checkBox = [
    {
      label: 'HODs',
      value: 'HODs',
    },
    {
      label: 'Team Leads',
      value: 'Team Leads',
    },
    {
      label: 'Employees',
      value: 'Employees',
    },
    {
      label: 'All',
      value: 'All',
    },
  ];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode
          ? Colors.darkTheme.backgroundColor
          : Colors.lightTheme.backgroundColor,
      }}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingBottom: hp(25)}}
        style={styles.container}>
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

          <Text style={[styles.header]}>{t('Upload Policy')}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.heading}>{t('Policy Details')}</Text>
          <Text style={[styles.label]}>
            {t('Name')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TxtInput
            value={docName}
            containerStyle={styles.inputt}
            placeholder={'Eg. Missed Punch'}
            onChangeText={setDocName}
          />
        
          <Text style={[styles.label]}>
            {t('Version')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TxtInput
            value={version2}
            containerStyle={styles.inputt}
            placeholder={'E.g. V1'}
            onChangeText={setVersion2}
          />
          <Text style={[styles.label]}>
            {t('Description')}
            <Text style={{color: 'red'}}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.comments]}
            placeholder={t('Describe your request')}
            placeholderTextColor="#A0A0A0"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <View style={{marginVertical: hp(1)}}>
            <Text style={styles.label}>
              {t('Document')}
              <Text style={{color: Colors.error}}> *</Text>
            </Text>
            <Text
              style={[
                styles.label,
                {
                  color: isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor,
                  fontFamily: Fonts.PoppinsRegular,
                },
              ]}>
              {t('Document in PDF Format')}
            </Text>
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                style={{
                  padding: wp(4),
                  backgroundColor: isDarkMode
                    ? Colors.darkTheme.backgroundColor
                    : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.whitePlus />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.heading}>
            {t('Permissions')}
            <Text style={{color: Colors.error}}> *</Text>
          </Text>
          <Text style={[styles.label]}>{t('Viewable To')}</Text>
          <View style={styles.checkBoxContainer}>
            {checkBox.map((item, index) => (
              <View key={index} style={styles.checkBox}>
                <MaterialIcons
                  name="radio-button-off"
                  size={24}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.iconColor
                      : Colors.lightTheme.iconColor
                  }
                />

                <Text style={styles.checkBoxText}>{t(item.label)}</Text>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: hp(2),
            }}>
            <Text style={[styles.label]}>{t('Customize')}</Text>
            {isCustomize ? (
              <TouchableOpacity onPress={() => setIsCustomize(!isCustomize)}>
                <Svgs.checked
                  height={hp(2.5)}
                  width={hp(2.5)}
                  style={{marginTop: hp(0.6)}}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsCustomize(!isCustomize)}>
                {isDarkMode ? (
                  <Svgs.UncheckBoxD
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                ) : (
                  <Svgs.check
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
          <CustomDropDown
            data={[
              {label: 'HODs', value: 'HODs'},
              {label: 'Team Leads', value: 'Team Leads'},
              {label: 'Employees', value: 'Employees'},
              {label: 'All', value: 'All'},
            ]}
            selectedValue={customize}
            onValueChange={setCustomize}
            placeholder="Select"
            width={'100%'}
          />
          <Text style={[styles.label]}>{t('Editable To')}</Text>
          <View style={styles.checkBoxContainer}>
            {checkBox.map((item, index) => (
              <View key={index} style={styles.checkBox}>
                <MaterialIcons
                  name="radio-button-off"
                  size={24}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.iconColor
                      : Colors.lightTheme.iconColor
                  }
                />

                <Text style={styles.checkBoxText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: hp(2),
            }}>
            <Text style={[styles.label]}>{t('Customize')}</Text>
            {isCustomize ? (
              <TouchableOpacity onPress={() => setIsCustomize(!isCustomize)}>
                <Svgs.checked
                  height={hp(2.5)}
                  width={hp(2.5)}
                  style={{marginTop: hp(0.6)}}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsCustomize(!isCustomize)}>
                {isDarkMode ? (
                  <Svgs.UncheckBoxD
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                ) : (
                  <Svgs.check
                    height={hp(2.5)}
                    width={hp(2.5)}
                    style={{marginTop: hp(0.6)}}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          <CustomDropDown
            data={[
              {label: 'HODs', value: 'HODs'},
              {label: 'Team Leads', value: 'Team Leads'},
              {label: 'Employees', value: 'Employees'},
              {label: 'All', value: 'All'},
            ]}
            selectedValue={customize}
            onValueChange={setCustomize}
            placeholder="Select"
            width={'100%'}
          />
        </View>
      </ScrollView>
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Send'}
          onPress={() => {}}
          textStyle={styles.continueButtonText}
          containerStyle={[styles.continueButton]}
        />
      </View>
    </View>
  );
};

export default UploadPolicy;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
      paddingTop: hp(2),
    },
    backArrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      paddingHorizontal: wp(2),
      marginBottom: hp(2),
    },
    header: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
      width: wp(80),
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsMedium,
    },
    contentContainer: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    heading: {
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    label: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
      fontSize: RFPercentage(1.8),
    },
    comments: {
      height: hp(40),
      textAlignVertical: 'top',
    },
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
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
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      // marginTop: hp(2),
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
    checkBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: hp(2),
      overflow: 'hidden',
      flexWrap: 'wrap',
    },
    checkBox: {
      borderRadius: wp(2),
      padding: wp(2),
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkBoxText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.NunitoRegular,
      // marginLeft: wp(1),
    },
    inputt: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
      marginBottom: hp(2),
    },
  });
