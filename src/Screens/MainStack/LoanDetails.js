import React from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const LoanDetails = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);

  const RequestDetails = [
    {label: 'Paid Amount', value: '$120'},
    {label: 'Remaining Amount', value: '$0'},
    {label: 'Method', value: 'Cheque'},
    {
      label: 'Description',
      value: [
        'Salary was handover using Cheque as there were an bank issue due to which salary was delaying.',
      ],
    },
  ];

  const Row = ({label, value, containerStyle, valueTextStyle}) => (
    <View style={[styles.row, containerStyle]}>
      <Text style={styles.label}>{t(label)}</Text>
      <Text style={[styles.valueText, valueTextStyle]}>{t(value)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StackHeader
        title={'House Loan'}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
      />

      <View style={styles.statusContainer}>
        <WorkerStatus
          name={'Status'}
          status={'Paid'}
          nameTextStyle={styles.statusText}
        />
        <View style={styles.rowSb}>
          <Text style={[styles.statusText]}>{t('Paid On')}</Text>
          <Text
            style={[
              styles.statusText,
              {
                fontFamily: Fonts.PoppinsRegular,
                fontSize: RFPercentage(pxToPercentage(14)),
              },
            ]}>
            {'12 May, 2025'}
          </Text>
        </View>
      </View>

      <RequestDetailsCard
        details={RequestDetails}
        headerTitle={'Payment Details'}
        imageLabel={'To'}
        showFrom={true}
      />

      <View style={styles.sectionBox}>
        <View style={styles.receiptHeader}>
          <Text style={styles.sectionTitle}>{t('Supporting Proof')}</Text>
          <Svgs.ChevronDownFilled height={hp(3)} width={hp(3)} />
        </View>
        <View style={styles.receiptHeader}>
          <Text style={styles.sectionTitle}>{t('Image')}</Text>
          <Svgs.imgDownload height={hp(3)} width={hp(3)} />
        </View>

        <View style={styles.ReciptContainer}>
          <Row
            label={t('Transaction ID')}
            value={'13345126230'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Transaction Date & Time')}
            value={'1/13/2025 7:31:31 PM'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Transaction Amount')}
            value={'$120'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('From Account Title')}
            value={'***'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Beneficiary Name')}
            value={'***'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Beneficiary Account/ IBAN')}
            value={'*1234'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Comments')}
            value={'Miscellaneous'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
          <Row
            label={t('Channel')}
            value={'via IBFT'}
            containerStyle={{flexDirection: 'column'}}
            valueTextStyle={styles.receiptValue}
          />
        </View>
      </View>
    </ScrollView>
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
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
      marginBottom: hp(1.5),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginLeft: wp(4),
    },
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(1.9),
    },
    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(0.4),
    },
    label: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      width: '50%',
    },
    valueText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      width: '50%',
      textAlign: 'right',
    },
    receiptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    receiptImage: {
      width: '100%',
      height: hp(20),
      resizeMode: 'contain',
      marginBottom: hp(2),
    },
    sectionBox: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      marginTop: hp(2),
      borderRadius: wp(2),
      padding: wp(4),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1.5),
    },
    ReciptContainer: {
      backgroundColor: '#f6f6f6',
      paddingLeft: wp(9),
      paddingVertical: wp(3),
    },
    receiptValue: {
      textAlign: 'left',
      color: '#007860',
    },
  });
export default LoanDetails;
