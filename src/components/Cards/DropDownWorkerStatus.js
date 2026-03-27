import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import StatusBox from './StatusBox';
import {useTranslation} from 'react-i18next';
import {statusStyles, statusStyles2} from '@constants/DummyData';
import {pxToPercentage} from '@utils/responsive';
import CustomStatusDropDown from '@components/DropDown/CustomStatusDropDown';
import logger from '@utils/logger';

export default function DropDownWorkerStatus({
  name,
  status,
  nameTextStyle,
  Dep,
  onPress,
  containerStyle,
  statusStyle2,
  onValueChange,
  statusArray,
  VerifyStatusArray,
  onVerifyValueChange,
  verifyStatus,
  onDeletePress,
  onEditPress
}) {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  const style = statusStyle2
    ? statusStyles2[status] || statusStyles2.Absent
    : statusStyles[status] || {};


  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, containerStyle]}>
      <View>
        <Text style={[styles.name, nameTextStyle]}>{t(name)}</Text>
        {Dep && <Text style={[styles.name]}>{t(Dep)}</Text>}
      </View>

      <View style={{flexDirection: 'row', alignItems: 'center', gap: wp(2)}}>
        {onEditPress && (
          <TouchableOpacity onPress={onEditPress} >
            <Svgs.edit width={wp(5)} height={wp(5)} />
          </TouchableOpacity>
        )}

        {
          onDeletePress && (
            <TouchableOpacity onPress={onDeletePress} >
            <Svgs.deleteOutline width={wp(5)} height={wp(5)} />
          </TouchableOpacity>
          )

        }

       

        <View style={{gap: wp(2)}}>
          {statusArray && (
            <CustomStatusDropDown
              data={statusArray}
              selectedValue={status}
              onValueChange={value => {
                onValueChange(value);
              }}
              placeholder={t(`${status}`)}
              containerStyle={styles.dropdownContainer}
              width={wp(35)}
              backgroundColor={style?.backgroundColor}
              icon={style?.icon}
              dropdownContainerStyle={{
                position: 'absolute',
                zIndex: 10000,
                top: hp(6),
              }}
            />
          )}

          {VerifyStatusArray && (
            <CustomStatusDropDown
              data={VerifyStatusArray}
              selectedValue={verifyStatus}
              onValueChange={onVerifyValueChange}
              placeholder={t(`${verifyStatus}`)}
              containerStyle={styles.dropdownContainer}
              width={wp(35)}
              dropdownContainerStyle={{
                position: 'absolute',
                zIndex: 10000,
                top: hp(6),
              }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1),
      // marginBottom: hp(1),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      zIndex: 10000,
    },
    name: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.NunitoMedium,
    },

    statusText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      textAlign: 'center',
      textAlignVertical: 'center',
      marginLeft: wp(1),
      color: Colors.lightTheme.primaryTextColor,
    },
    dropdownContainer: {
      alignSelf: 'flex-end',
      zIndex: 1000,
    },
  });
