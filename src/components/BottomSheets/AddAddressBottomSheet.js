import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import TxtInput from '@components/TextInput/Txtinput';
import CustomButton from '@components/Buttons/customButton';
import logger from '@utils/logger';

const AddAddressBottomSheet = ({
  refRBSheet,
  height,
  bgColor,
  sheetTitle = 'Select Location',
  name,
  setName,
  onSubmit,
  address,
  setAddress,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const backgroundColor = bgColor
    ? bgColor
    : isDarkMode
    ? Colors.darkTheme.secondryColor
    : Colors.lightTheme.backgroundColor;

  const styles = dynamicStyles(isDarkMode, Colors);

  return (
    <RBSheet
      ref={refRBSheet}
      height={height ? height : hp('28%')}
      openDuration={300}
      draggable={false}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopLeftRadius: wp('6%'),
          borderTopRightRadius: wp('6%'),
          backgroundColor: backgroundColor,
          paddingHorizontal: wp('5%'),
          paddingTop: hp('2%'),
        },
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t(sheetTitle)}</Text>
          <TouchableOpacity onPress={() => refRBSheet.current.close()}>
            <Icon
              name="x"
              size={RFPercentage(3)}
              color={
                isDarkMode
                  ? Colors.darkTheme.secondryTextColor
                  : Colors.lightTheme.secondryTextColor
              }
            />
          </TouchableOpacity>
        </View>

        <View>
      
          <TxtInput
            value={address}
            containerStyle={{marginBottom: hp(2)}}
            placeholder="Address"
            onChangeText={setAddress}
            multiline={true}
          />
          <CustomButton
            containerStyle={styles.btn}
            text={t('Add Address')}
            textStyle={styles.btnText}
            onPress={() => {
              refRBSheet.current.close();
              onSubmit();
            }}
          />
        </View>
      </ScrollView>
    </RBSheet>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('1%'),
    },
    title: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp('90%'),
      alignSelf: 'center',
      marginBottom: hp(5),
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
    },
  });

export default AddAddressBottomSheet;
