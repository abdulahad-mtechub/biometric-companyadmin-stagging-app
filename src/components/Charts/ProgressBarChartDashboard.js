import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const ProgressBarChart = ({data}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);

  const renderItem = ({item}) => (
    <View style={styles.barContainer}>
      <View style={styles.barWrapper}>
          <Text style={styles.cityText}>{item.country}</Text>
          <Text style={{marginRight: wp(2)}}>{item.flag}</Text>
        <View
          style={[styles.bar, {width: `${(item.value / data[0].value) * 65}%`}]}
        />
        <Text style={styles.valueText}>{item.value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
        paddingLeft: wp(0),
      //   backgroundColor: isDarkMode
      //     ? Colors.darkTheme.backgroundColor
      //     : Colors.lightTheme.secondryColor,
    },
    barContainer: {
      marginVertical: wp(1),
    },
    cityText: {
      fontFamily: Fonts.NunitoMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(14)),
      width: '15%',
      // backgroundColor: 'blue',
      //   marginRight: wp(4),
    },
    barWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bar: {
      height: wp(2),
      backgroundColor: '#5EA0F3',
      borderRadius: wp(2),
    },
    valueText: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(12)),
      marginLeft: wp(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

export default ProgressBarChart;
