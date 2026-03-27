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

const AttendenceFilterBtmSheet = forwardRef(
  (
    {onApplyFilters, showDropDown = false, height = hp(45), workers = [], statusOptions = []},
    ref,
  ) => {
    const {isDarkMode, Colors} = useSelector(store => store.theme);
    const {t} = useTranslation();

    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [datePickerType, setDatePickerType] = useState(null);
    const [selectedWroker, setSelectedWroker] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const {showAlert} = useAlert();

    const styles = useMemo(
      () => dynamicStyles(isDarkMode, Colors),
      [isDarkMode, Colors],
    );
    const refRBSheet = useRef(null);

    const handleApplyFilters = useCallback(() => {
      // Validate date range
      // if (dateFrom && dateTo) {
      //     refRBSheet.current.close();
      //     return;
      //   }
      // }
      if (dateFrom && dateTo) {
        if (!moment(dateFrom).isBefore(moment(dateTo))) {
          showAlert('Start date must be smaller than end date.', 'error');
          refRBSheet.current.close();
          return;
        }
      }

      if (!dateFrom && dateTo) {
        showAlert('Please select a start date first.', 'error');
        refRBSheet.current.close();
        return;
      }

      onApplyFilters({
        date_from: dateFrom,
        date_to: dateTo,
        workerId: selectedWroker?.value || null,
        status: selectedStatus?.value || null,
      });

      refRBSheet.current.close();
    }, [
      dateFrom,
      dateTo,
      onApplyFilters,
      refRBSheet,
      selectedStatus,
      selectedWroker,
    ]);

    const clearFilters = useCallback(() => {
      setDateFrom(null);
      setDateTo(null);
      setSelectedWroker(null);
      setSelectedStatus(null);

      refRBSheet.current.close();
    }, []);



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

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          {showDropDown && (
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
              <Text style={styles.sectionTitle}>{t('Select Employee')}</Text>
              <CustomDropDown
                data={workers}
                selectedValue={selectedWroker}
                onValueChange={value => {
                  setSelectedWroker(value);
                }}
                placeholder={t(`Select Employee`)}

              />
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Set the date range')}</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('start');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>
                  {dateFrom || t('Date From')}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>

              <Text style={styles.dashText}>–</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('end');
                  setIsDatePickerVisible(true);
                }}>
                <Text style={styles.dateText}>{dateTo || t('Date To')}</Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={RFPercentage(2.5)}
                  color={
                    isDarkMode
                      ? Colors.darkTheme.secondryTextColor
                      : Colors.lightTheme.secondryTextColor
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApplyFilters}>
            <Text style={styles.applyText}>{t('Apply')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onClose={() => setIsDatePickerVisible(false)}
          onConfirm={date => {
            const formatted = moment(date).format('YYYY-MM-DD');
            if (datePickerType === 'start') {
              setDateFrom(formatted);
            } else if (datePickerType === 'end') {
              setDateTo(formatted);
            }
            setIsDatePickerVisible(false);
          }}
        />
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
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: hp(1),
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

export default AttendenceFilterBtmSheet;
