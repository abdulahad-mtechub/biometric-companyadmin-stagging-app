import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import logger from '@utils/logger';



const statusStyles = {
  Leave: { backgroundColor: '#60A5FA', color: '#ffffff', icon: <Svgs.mailL height={hp(2)} /> },
  Invited: { backgroundColor: '#60A5FA', color: '#ffffff', icon: <Svgs.mailL height={hp(2)} /> },
  Present: { backgroundColor: '#34D399', color: '#ffffff', icon: <Svgs.CheckOutline height={hp(2)}/> },
  Active: { backgroundColor: '#34D399', color: '#ffffff', icon: <Svgs.CheckOutline height={hp(2)}/> },
  Absent: { backgroundColor: '#F87171', color: '#ffffff', icon: <Svgs.CheckOutline height={hp(2)}/> },
  Inactive: { backgroundColor: '#F87171', color: '#ffffff', icon: <Svgs.inActiveWhite height={hp(2)}/> },
  'Early Out': { backgroundColor: '#A78BFA', color: '#ffffff', icon: <Svgs.CheckOutline height={hp(2)}/> },
  'Late Clock In': { backgroundColor: '#FB923C', color: '#000000', icon: <Svgs.CheckOutlineBlack height={hp(2)}/> },
  'Half Leave': { backgroundColor: '#FACC15', color: '#000000', icon: <Svgs.halfLeave height={hp(2)}/> },
  Request: { backgroundColor: '#FACC15', color: '#000000', icon: <Svgs.halfLeave height={hp(2)}/> },
};

export default function WorkerScreenWorkerCard({ name, status }) {
  
  const style = statusStyles[status];
    const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
    
      <View style={[styles.statusBox, { backgroundColor: style.backgroundColor },(status !== 'Invited' && status !== 'Request') && { paddingVertical: wp(1) }]}>
        {style.icon}
        <Text style={[styles.statusText, { color: style.color }]}>
           {status}
        </Text>
        {
         ( status === 'Invited' || status === "Request") && <MaterialCommunityIcons
                        name={"chevron-down"}
                        size={RFPercentage(3)}
                        color={
                          status === 'Invited' ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor
                          
                        }
                      />
        }

       
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
    paddingVertical: hp(1.5),
    borderBottomColor: isDarkMode? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    borderBottomWidth: 1,
    // paddingBottom: hp(1),
  },
  name: {
    fontSize: RFPercentage(1.9),
    color: isDarkMode? Colors.darkTheme.secondryTextColor : Colors.lightTheme.QuaternaryText,
    fontFamily: Fonts.PoppinsRegular,
    textAlignVertical : 'center'
  },
  statusBox: {
    borderRadius: wp(1),
    paddingHorizontal: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    paddingVertical: wp(0.5),
  },
  statusText: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    textAlignVertical: 'center',
    marginLeft: wp(1),
    color: Colors.lightTheme.primaryTextColor
  },
});
