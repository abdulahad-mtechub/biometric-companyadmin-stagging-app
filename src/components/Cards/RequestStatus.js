import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import logger from '@utils/logger';


const statusStyles = {
  Processing: { backgroundColor: '#579DFF', color: '#ffffff', icon: <Svgs.Processing height={hp(2)} /> },
  Approved: { backgroundColor: '#34D399', color: '#ffffff', icon: <Svgs.CheckOutline height={hp(2)}/> },
  'Requested': { backgroundColor: '#F5CD47', color: '#000000', icon: <Svgs.halfLeave height={hp(2)}/> },
};

export default function RequestStatus({ name, status }) {
  const style = statusStyles[status];
    const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.statusBox, { backgroundColor: style.backgroundColor }]}>
        {style.icon}
        <Text style={[styles.statusText, { color: style.color }]}>
           {status}
        </Text>
      </View>
    </View>
  );
}

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
     row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.5),
  },
  name: {
    fontSize: RFPercentage(1.8),
    color: isDarkMode? Colors.darkTheme.QuaternaryText : Colors.lightTheme.QuaternaryText,
    fontFamily: Fonts.PoppinsRegular
  },
  statusBox: {
    borderRadius: wp(1),
    paddingHorizontal: wp(2.5),
    paddingVertical: wp(1),
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
  },
  statusText: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    textAlignVertical: 'center',
    marginLeft: wp(1),
  },
});
