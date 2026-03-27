import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { loanData } from '@constants/DummyData';
import { Fonts } from '@constants/Fonts';
import { SCREENS } from '@constants/Screens';
import LoanCard from '@components/Cards/LoanCard';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const MyLoans = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const [search, setSearch] = useState('');
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  const filteredData = loanData.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.rowView}>
        <MaterialCommunityIcons
          onPress={() => navigation.goBack()}
          name={'chevron-left'}
          size={RFPercentage(4)}
          color={
             isDarkMode
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor
          }
        />
        <Text style={styles.title}>{t('My Loans')}</Text>
      </View>
      
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{paddingHorizontal: wp(6)}}
        keyboardShouldPersistTaps='handled'
        renderItem={({ item }) => (
          <LoanCard
            title={item.title}
            date={item.date}
            amount={item.amount}
            installment={item.installment}
            onPress={() => navigation.navigate(SCREENS.MYLOANSDETAILS, {item})}
          />
        )}
      />
    </View>
  );
};

export default MyLoans;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,

    },

    title: {
      fontSize: RFPercentage(pxToPercentage(20)),
      fontFamily: Fonts.NunitoBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(6),
    },
  }); 