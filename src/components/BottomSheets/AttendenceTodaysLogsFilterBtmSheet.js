import React, {
  useState,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import moment from 'moment';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import {useAlert} from '@providers/AlertContext';
import logger from '@utils/logger';

const AttendenceTodaysLogsFilterBtmSheet = forwardRef(
  ({onApplyFilters, height = hp(45)}, ref) => {
    const {isDarkMode, Colors} = useSelector(store => store.theme);
    const {t} = useTranslation();

    const [selectedStatus, setSelectedStatus] = useState(null);

    const styles = useMemo(
      () => dynamicStyles(isDarkMode, Colors),
      [isDarkMode, Colors],
    );

    const refRBSheet = useRef(null);

    const handleApplyFilters = useCallback(() => {
      onApplyFilters({
        status: selectedStatus?.value || null,
      });

      refRBSheet.current.close();
    }, [onApplyFilters, refRBSheet, selectedStatus]);

    const clearFilters = useCallback(() => {
      setSelectedStatus(null);

      refRBSheet.current.close();
    }, []);

    const statusOptions = [
      {label: 'Clock In', value: 'check_in'},
      {label: 'On Time Clock In', value: 'onTimeClockIn'},
      {label: 'Late Clock In', value: 'lateClockIn'},
      {label: 'On Break', value: 'breakStart'},
      {label: 'Back From Break', value: 'breakEnd'},
      {label: 'Clock Out', value: 'clockout'},
      {label: 'On Leave', value: 'leave'},
      {label: 'Half Leave', value: 'half_leave'},
      {label: 'Late Clock Out', value: 'lateClockOut'},
      // {label: 'Absent', value: 'absent'},
      // {label: 'Early Out', value: 'early_out'},
      // {label: 'Break End', value: 'end_break'},
      // {label: 'Active Employees', value: 'active_employee'},
    ];

    useImperativeHandle(
      ref,
      () => ({
        open: () => refRBSheet.current?.open(),
        close: () => refRBSheet.current?.close(),
        clearFilters: () => clearFilters(),
      }),
      [clearFilters],
    );

    return (
      <RBSheet
        ref={refRBSheet}
        height={height}
        openDuration={300}
        draggable={true}
        closeOnPressMask
        customStyles={{
          container: {
            borderTopLeftRadius: wp(5),
            borderTopRightRadius: wp(5),
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
            padding: wp(4),
          },
        }}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Select Status')}</Text>
          <CustomDropDown
            data={statusOptions}
            selectedValue={selectedStatus}
            onValueChange={value => {
              setSelectedStatus(value);
            }}
            placeholder={t(`Select Status`)}
            search={false}
          />
        </View>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
          <Text style={styles.applyText}>{t('Apply')}</Text>
        </TouchableOpacity>
      </RBSheet>
    );
  },
);

const createStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginBottom: hp(2),
    },
    title: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    scrollView: {},
    section: {
      marginBottom: hp(1),
      flex: 0.9,
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      marginBottom: hp(0.5),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
    },
    dateInput: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: hp(5.5),
      paddingHorizontal: wp(4),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },
    dateText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    dashText: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    applyBtn: {
      backgroundColor: Colors.lightTheme.primaryColor,
      borderRadius: wp(4),
      alignItems: 'center',
      paddingVertical: hp(1.3),
      marginBottom: hp(1),
    },
    applyText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: '#fff',
    },
    ResetBtn: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.8),
      borderRadius: wp(5),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      alignSelf: 'flex-end',
    },
    resetText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.6),
      color: Colors.darkTheme.primaryColor,
    },
  });

const dynamicStyles = (isDarkMode, Colors) => {
  return createStyles(isDarkMode, Colors);
};

export default AttendenceTodaysLogsFilterBtmSheet;
