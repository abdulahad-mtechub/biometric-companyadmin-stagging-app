import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import {RFPercentage} from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import logger from '@utils/logger';

const AccountSelectionBottomSheet = ({
  refRBSheet,
  height = 320,
  accounts = [],
  selectedEmail,
  onSelectAccount,
  onAddAccount,
  onAddSelected,
  bgColor,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const backgroundColor =
    bgColor ||
    (isDarkMode
      ? Colors.darkTheme.backgroundColor
      : Colors.lightTheme.backgroundColor);

  return (
    <RBSheet
      ref={refRBSheet}
      height={360}
      draggable={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor,
        },
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={{paddingLeft: wp(5),paddingRight: wp(5), paddingTop: hp(2)}}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>{t("Select An Account")}</Text>
            <TouchableOpacity style={{zIndex: 1000}}  onPress={() => refRBSheet.current?.close()} >
              {isDarkMode ? (
                <Svgs.WhiteCross />
              ) : (
                <Svgs.Cross height={hp(1.8)} width={hp(1.8)} />
              )}
            </TouchableOpacity>
          </View>

          {accounts.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectAccount(item)}
              style={styles.addAccItemContainer}>
              <Svgs.addAccImagePlaceHolder height={hp(6)} width={hp(6)} />
              <View style={styles.accountInfo}>
                <Text style={styles.label}>{item.name}</Text>
                <Text
                  style={[
                    styles.label,
                    {
                      fontFamily: Fonts.PoppinsRegular,
                      color: Colors.lightTheme.secondryTextColor,
                      marginBottom: 0,
                    },
                  ]}>
                  {item.email}
                </Text>
              </View>
              {item.email === selectedEmail && <Svgs.successAlert height={hp(4)} width={ hp(4)} />}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity onPress={onAddAccount} style={styles.addAccItemContainer}>
            <Svgs.addCircled height={hp(6)} width={hp(6)} />
            <View style={[styles.accountInfo, {marginLeft: wp(7)}]}>
              <Text style={styles.label}>{t("Add Account")}</Text>
              <Text style={[
                    styles.label,
                    {
                      fontFamily: Fonts.PoppinsRegular,
                      color: Colors.lightTheme.secondryTextColor,
                      marginBottom: 0,
                    },
                  ]}>{t("Add new account")}</Text>
            </View>
          </TouchableOpacity>

          <CustomButton
            text={t("Add Selected")}
            onPress={onAddSelected}
            textStyle={styles.btnText}
            containerStyle={[styles.btn, {marginVertical: hp(1)}]}
          />
        </View>
      </ScrollView>
    </RBSheet>
  );
};

export default AccountSelectionBottomSheet;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      //   marginBottom: hp(2),
    },
    heading: {
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    addAccItemContainer: {
      flexDirection: 'row',
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      alignItems: 'center',
      paddingBottom: hp(2),
      paddingTop: hp(1),
      justifyContent: 'space-between',

      

    },
    label: {
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'left',
      textAlignVertical: 'center',
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(0.5),
      width: wp(90),


    },
    accountInfo: {
      flex: 1,
      marginLeft: wp(4),
    },

    btn: {
      paddingVertical: hp(1.2),
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: 16,
    },
  });
