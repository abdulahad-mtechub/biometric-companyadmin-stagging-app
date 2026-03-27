import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { Svgs } from '@assets/Svgs/Svgs';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import { truncateText } from '@utils/Helpers';
import logger from '@utils/logger';
export default function Step1() {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const {t} = useTranslation();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [name, setname] = useState('');

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = date => {
    setSelectedDate(date.toLocaleDateString());
    hideDatePicker();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{t('Punch Details')}</Text>

      <Label text="Date" required isDarkMode={isDarkMode} />
      <TouchableOpacity onPress={showDatePicker} style={styles.input}>
        <Text style={styles.dateText}>{selectedDate || 'MM/DD/YYYY'}</Text>
        <View style={styles.iconRight}>{<Svgs.calenderL />}</View>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.half}>
          <Label text="Clock-In" required isDarkMode={isDarkMode} />
          <TimeInput placeholder="Clock-In" isDarkMode={isDarkMode} />
        </View>
        <View style={styles.half}>
          <Label text="Clock-Out" required isDarkMode={isDarkMode} />
          <TimeInput placeholder="Clock-Out" isDarkMode={isDarkMode} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Label text="Break Start" required isDarkMode={isDarkMode} />
          <TimeInput placeholder="Starting Time" isDarkMode={isDarkMode} />
        </View>
        <View style={styles.half}>
          <Label text="Break End" required isDarkMode={isDarkMode} />
          <TimeInput placeholder="Ending Time" isDarkMode={isDarkMode} />
        </View>
      </View>

      <Label text="Comments" isDarkMode={isDarkMode} />
      <TextInput
        style={[styles.input, styles.comments]}
        placeholder={t('Add admin comment')}
        placeholderTextColor="#A0A0A0"
        multiline
      />
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onClose={() => setDatePickerVisible(false)}
        onConfirm={date => {
          const formatted = moment(date).format('YYYY-MM-DD');
          setSelectedDate(formatted);
          setDatePickerVisible(false);
        }}
      />
    </ScrollView>
  );
}

const Label = ({text, required, isDarkMode}) => {
  const {t} = useTranslation();

  return (
    <Text style={[dynamicStyles(isDarkMode).label]}>
      {t(text)}
      {required && <Text style={{color: 'red'}}> *</Text>}
    </Text>
  );
};

const TimeInput = ({placeholder, isDarkMode}) => {
  const {t} = useTranslation();
  const {language} = useSelector(store => store.auth);

  return (
    <View style={[dynamicStyles(isDarkMode).input]}>
      <Text style={[dynamicStyles(isDarkMode).dateText, language.value === 'es' && {fontSize: RFPercentage(1.5)}]}>{truncateText(t(placeholder), 14)}</Text>
      <View style={dynamicStyles(isDarkMode).iconRight}>
        {<Svgs.ClockL height={wp(6)} />}
      </View>
    </View>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    container: {
      padding: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    header: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    label: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      width: wp(80),
      marginBottom: hp(0.5),
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
        flexWrap: 'wrap'
    },
    comments: {
      height: hp(30),
      textAlignVertical: 'top',
    },
    dateText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.7),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    iconRight: {
      marginLeft: wp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    half: {
      width: '48%',
    },
  });
