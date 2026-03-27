import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import StatusBox from './StatusBox';
import {useTranslation} from 'react-i18next';
import {pxToPercentage} from '@utils/responsive';
import moment from 'moment';
import logger from '@utils/logger';

export default function WorkerStatus({
  name,
  status,
  nameTextStyle,
  email,
  showIcon,
  Dep,
  onPress,
  time,
  text,
  isSpanish,
}) {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View>
        {name && (
          <Text
            style={[
              styles.name,
              nameTextStyle,
              isSpanish && {fontSize: RFPercentage(1.5)},
            ]}>
            {t(name)}
          </Text>
        )}
        {Dep && <Text style={[styles.name]}>{t(Dep)}</Text>}
        {email && <Text style={[styles.email]}>{t(email)}</Text>}
      </View>

      <View style={[{alignItems: 'center', justifyContent: 'center'}]}>
        {status ? (
          <StatusBox status={status} showIcon={showIcon} />
        ) : (
          <Text style={[styles.statusText]}>{t(text)}</Text>
        )}

        {time && (
          <Text style={[styles.name, {width: '100%', textAlign: 'right'}]}>
            {t(moment(time).format('hh:mm A'))}
          </Text>
        )}
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
      paddingVertical: hp(0.5),
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
      // paddingBottom: hp(1),
    },
    name: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
    },
    email: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.NunitoMedium,
    },
    statusText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.NunitoMedium,
    },
  });
