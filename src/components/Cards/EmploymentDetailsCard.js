import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import logger from '@utils/logger';

const EmploymentDetailsCard = ({data}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = createStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('Employment Details')}</Text>

      {[
        [t('Department'), data.department],
        [t('Designation'), data.designation],
        [t('Employment Type'), data.employmentType],
        [t('Hiring Date'), data.hiringDate],
        [t('Shift Schedule'), data.shift],
        [t('Assigned Region'), data.assignRegion],
        [t('Assigned Zone'), data.assignZone],
        [t('Assigned Location'), data.WorkLocation],
      ]
        .filter(([_, value]) => value && value !== '')
        .map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}

      {data.startTime != null && (
        <Text style={styles.sectionTitle}>{t('Shift Schedule')}</Text>
      )}

      {[
        [
          t('Start Time'),
          data.startTime && data.startTime !== 'Add'
            ? moment(data.startTime, 'HH:mm:ss').format('h:mm A')
            : null,
        ],
        [
          t('End Time'),
          data.endTime && data.endTime !== 'Add'
            ? moment(data.endTime, 'HH:mm:ss').format('h:mm A')
            : null,
        ],
        [
          t('Daily Hours'),
          data.dailyHours && data.dailyHours !== 'Add' ? data.dailyHours : null,
        ],
        [
          t('Break Time'),
          data.breakTime && data.breakTime !== 'Add' ? data.breakTime : null,
        ],
        [
          t('Grace Time'),
          data.graceMinutes && data.graceMinutes !== 'Add'
            ? data.graceMinutes
            : null,
        ],
        [
          t('Assigned Zone'),
          data.assignZone && data.assignZone !== 'Add' ? data.assignZone : null,
        ],
      ]
        .filter(([_, value]) => value) // remove empty/null
        .map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}

      {data?.workingDays?.length > 0 && (
        <Row
          label={t('Working Days')}
          valueComponent={<Tags tags={data?.workingDays} />}
        />
      )}

     
    </View>
  );
};

const Row = ({label, value, valueComponent}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);

  const styles = rowStyles(isDarkMode, Colors);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {valueComponent ? (
        <View style={styles.value}>{valueComponent}</View>
      ) : (
        <Text style={styles.valueText}>{value}</Text>
      )}
    </View>
  );
};

const Tags = ({tags}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = tagStyles(isDarkMode, Colors);
  return (
    <View style={styles.container}>
      {tags.map((tag, index) => (
        <View style={styles.tag} key={index}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(2),
      padding: wp(3),
      marginVertical: wp(1.5),
      marginHorizontal: wp(4),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsBold,
      fontSize: RFPercentage(2),
      marginVertical: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

const rowStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginVertical: hp(0.3),
      flexWrap: 'wrap',
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,

      //   width: "40%",
    },
    valueText: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    value: {
      width: '67%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
  });

const tagStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',

      // gap: wp(1.5),
    },
    tag: {
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : '#579DFF',
      borderRadius: wp(1),
      paddingHorizontal: wp(1.5),
      paddingVertical: hp(1),
      margin: wp(0.5),
    },
    tagText: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(1.6),
      color: Colors.darkTheme.primaryTextColor,
    },
  });

export default EmploymentDetailsCard;
