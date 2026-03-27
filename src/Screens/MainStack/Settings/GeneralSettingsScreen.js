import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '@components/Buttons/customButton';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import {setLanguage} from '@redux/Slices/authSlice';
import i18n from '@translations/i18n';
import {pxToPercentage} from '@utils/responsive';
import {useAlert} from '@providers/AlertContext';
import logger from '@utils/logger';

const GeneralSettingsScreen = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {language} = useSelector(store => store?.auth);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const {showAlert} = useAlert();
  const styles = dynamicStyles(isDarkMode, Colors);
  const languageOptions = [
    {label: 'English', value: 'en'},
    {label: 'Español', value: 'es'},
  ];

  const onUpdateSettings = () => {
    dispatch(setLanguage(selectedLanguage));
    showAlert(`App language has been changed`, 'success');

    if (selectedLanguage === 'English') {
      i18n.changeLanguage('en');
    } else if (selectedLanguage === 'Español') {
      i18n.changeLanguage('es');
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StackHeader
        title={t('Change Language')}
        headerTxtStyle={styles.headerTxtStyle}
        headerStyle={styles.headerStyle(isDarkMode)}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: hp(4)}}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Language')}</Text>
            <CustomDropDown
              data={languageOptions}
              selectedValue={selectedLanguage}
              onValueChange={setSelectedLanguage}
              placeholder={t('Language')}
              containerStyle={[styles.dropdownContainer, {marginBottom: hp(4)}]}
              width={'100%'}
              btnStyle={{paddingVertical: hp(1.4), paddingHorizontal: hp(2)}}
              zIndex={3000}
              search={false}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          text={t('Update')}
          onPress={onUpdateSettings}
          textStyle={styles.continueButtonText}
          containerStyle={styles.continueButton}
        />
      </View>
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
    scrollContainer: {
      flex: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
    },
    content: {
      borderRadius: 10,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(4),
      paddingTop: hp(1),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
      marginTop: hp(1),
    },
    rowView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonContainer: {
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderTopWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
    },
    continueButtonText: {
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });

export default GeneralSettingsScreen;
