import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import { MyLoanDetailsData } from '@constants/DummyData';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';

const transactions = [
  {
    id: '1',
    title: 'Stripe',
    desc: 'Loan Approved',
    date: '4 Apr, 2025 • 12:24 PM',
    amount: '+ $300',
    color: '#0CC25F',
    balance: '$800',
  },
  {
    id: '2',
    title: 'PayPal',
    desc: 'Instalment Paid',
    date: '4 Apr, 2025 • 12:24 PM',
    amount: '- $100',
    color: '#F75555',
    balance: '$500',
  },
  {
    id: '3',
    title: 'PayPal',
    desc: 'Instalment Payment',
    date: '4 Apr, 2025 • 12:24 PM',
    amount: 'Error',
    color: '#F75555',
    balance: '$500',
  },
  {
    id: '4',
    title: 'Cash',
    desc: 'Instalment Paid',
    date: '4 Apr, 2025 • 12:24 PM',
    amount: '- $400',
    color: '#F75555',
    balance: '$600',
  },
  {
    id: '5',
    title: 'PayPal',
    desc: 'Loan Approved',
    date: '4 Apr, 2025 • 12:24 PM',
    amount: '+ $1,000',
    color: '#0CC25F',
    balance: '$1,000',
  },
];

const MyLoanDetails = ({navigation}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const colors = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();
  const [selectedTab, setSelectedTab] = useState('Transaction History');
  const [search, setSearch] = useState('');

  const renderItem = ({item}) => (
    <View style={[styles.transactionItem]}>
      <View style={{flex: 1}}>
        <Text style={[styles.title, {color: colors.primaryTextColor}]}>
          {item.title}
        </Text>
        <Text style={[styles.desc, {color: colors.secondryTextColor}]}>
          {item.desc} | {item.date}
        </Text>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text
          style={{
            color: item.color,
            fontSize: RFPercentage(pxToPercentage(18)),
            fontFamily: Fonts.PoppinsMedium,
          }}>
          {item.amount}
        </Text>
        <Text style={[styles.balance, {color: colors.secondryTextColor}]}>
          {item.balance}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      {/* Header */}
      <View style={{paddingHorizontal: wp(4)}}>
        <View style={styles.header}>
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
          <Text style={[styles.headerTitle, {color: colors.primaryTextColor}]}>
            {t('Car Loan')}
          </Text>
        </View>
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryTop}>
            <Text style={[styles.loanTitle, {color: colors.primaryTextColor}]}>
              Car Loan
            </Text>
            <View>
              <Text
                style={[styles.loanAmount, {color: colors.primaryTextColor}]}>
                $800
              </Text>
              <Text
                style={[styles.loanSubAmount, {color: colors.secondryTextColor}]}>
                $12,300
              </Text>
            </View>
          </View>
          <Text
            style={[styles.remainingText, {color: colors.secondryTextColor}]}>
            {t('You have')} “
            <Text style={{fontFamily: Fonts.PoppinsSemiBold}}>$11,500</Text>”
            {t('more to Pay')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, {width: `${65}%`}]} />
            </View>
            <Text
              style={[styles.progressText, {color: colors.secondryTextColor}]}>
              65%
            </Text>
          </View>
        </View>
      </View>

      <TabSelector
        tabs={['Transaction History', 'Loan Borrower']}
        selectedTab={selectedTab}
        onTabPress={value => setSelectedTab(value)}
      />

      {selectedTab === 'Transaction History' ? (
        <View>
          {/* Transaction History */}
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, {color: '#fff'}]}>
              {t('Transaction History')}
            </Text>
          </View>
          <View style={{paddingHorizontal: wp(4)}}>
            <FlatList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: hp(10)}}
            />
          </View>
        </View>
      ) : (
        <View style={{paddingHorizontal: wp(4)}}>
          <View style={[styles.summaryTop, {marginVertical: hp(2)}]}>
            <Text
              style={[styles.availedWorker, {color: colors.primaryTextColor}]}>
              {t('Availed Employee')}
            </Text>
            <Text
              style={[
                styles.availedWorker,
                {
                  color: Colors.darkTheme.primaryTextColor,
                  backgroundColor: colors.primaryColor,
                  paddingHorizontal: wp(1),
                  borderRadius: wp(1),
                },
              ]}>
              18
            </Text>
          </View>

          <TxtInput
            placeholder={'Search'}
            svg={
              isDarkMode ? (
                <Svgs.searchD height={hp(2.5)} width={hp(2.5)} />
              ) : (
                <Svgs.SearchL height={hp(2.5)} width={hp(2.5)} />
              )
            }
            onChangeText={searchQuery => setSearch(searchQuery)}
            rightIcon={search.length > 0 && 'close-circle-outline'}
            rightIconSize={wp(6)}
            rightBtnStyle={{width: wp(8), backgroundColor: 'transparent'}}
            rightIconPress={() => setSearch('')}
            value={search}
            containerStyle={{
              backgroundColor: isDarkMode
                ? Colors.darkTheme.input
                : Colors.lightTheme.input,
            }}
          />
          <View style={[styles.summaryTop, {marginVertical: hp(2)}]}>
            <Text
              style={[styles.listHeading, {color: colors.primaryTextColor}]}>
              {t('Name')}
            </Text>
            <Text
              style={[styles.listHeading, {color: colors.primaryTextColor}]}>
              {t('Time')}
            </Text>
          </View>

          {MyLoanDetailsData.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => {}}>
              <View style={styles.textWrapper}>
                <View style={{flexDirection: 'row'}}>
                  <Image source={item.avatar} style={styles.avatar} />

                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.dateText}>{item.timestamp}</Text>
              </View>
              <Icon
                name="chevron-right"
                size={RFPercentage(2.6)}
                color={
                  isDarkMode
                    ? Colors.darkTheme.iconColor
                    : Colors.lightTheme.iconColor
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Floating Button */}
      {/* <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primaryColor}]}>
        <Svgs.euro height={wp(9)} width={wp(9)} />
      </TouchableOpacity> */}
    </View>
  );
};

export default MyLoanDetails;

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      height: hp(8),
      gap: wp(2),
    },
    headerTitle: {
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    summaryContainer: {
      marginVertical: hp(2),
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    loanTitle: {
      fontSize: RFPercentage(pxToPercentage(24)),
      fontFamily: Fonts.PoppinsBold,
    },
    loanAmount: {
      fontSize: RFPercentage(pxToPercentage(24)),
      fontFamily: Fonts.PoppinsBold,
    },
    loanSubAmount: {
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsMedium,
    },
    remainingText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      marginVertical: hp(1),
      fontFamily: Fonts.PoppinsRegular,
    },
    progressBarContainer: {
      height: hp(1),
      backgroundColor: '#ccc',
      borderRadius: 50,
      overflow: 'hidden',
      marginTop: hp(1),
    },
    progressBar: {
      height: hp(1),
      borderRadius: 50,
    },
    progressText: {
      //   alignSelf: 'flex-end',
      //   marginTop: hp(0.5),
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsMedium,
    },
    historyHeader: {
      backgroundColor: '#003149',
      padding: hp(0.6),
      marginVertical: hp(1.5),
    },
    historyTitle: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.PoppinsSemiBold,
      textAlign: 'center',
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsMedium,
    },
    desc: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsRegular,
      marginTop: hp(0.5),
    },
    balance: {
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsRegular,
      marginTop: hp(0.5),
    },
    fab: {
      position: 'absolute',
      bottom: hp(3),
      right: wp(5),
      width: wp(14),
      height: wp(14),
      borderRadius: wp(7),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    progressBackground: {
      height: hp(1),
      backgroundColor: '#ddd',
      borderRadius: 4,
      width: '80%',
      overflow: 'hidden',
      marginRight: hp(2),
    },
    progressFill: {
      height: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },
    availedWorker: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    listHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('1.5%'),
      borderBottomWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    avatar: {
      height: wp('6%'),
      width: wp('6%'),
      borderRadius: wp('5%'),
      marginRight: wp('3%'),
    },
    textWrapper: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    name: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    dateText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginTop: hp('0.3%'),
    },
  });
