import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import StackHeader from '@components/Header/StackHeader';
import {useTranslation} from 'react-i18next';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from '@components/DateTimeModal/CustomDateTimePicker';
import moment from 'moment';
import {ApiResponse, fetchApis, isConnected} from '@utils/Helpers';
import TxtInput from '@components/TextInput/Txtinput';
import {pxToPercentage} from '@utils/responsive';
import CustomButton from '@components/Buttons/customButton';
import { savePendingAction } from '@utils/sqlite';
import logger from '@utils/logger';

const AddAbscence = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const {workers, absenceTypes} = useSelector(store => store.states);
  const {t} = useTranslation();
  const [comment, setComment] = useState('');
  const styles = dynamicStyles(isDarkMode, Colors);

  const [selectedWroker, setSelectedWroker] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isPartial, setIsPartial] = useState(false);

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [timeFrom, setTimeFrom] = useState(null);
  const [timeTo, setTimeTo] = useState(null);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'
  const [pickerType, setPickerType] = useState(null); // 'start' | 'end'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    comment: '',
    worker: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
  });
  const [isConnectedState, setIsConnectedState] = useState(false);
 

  const renderOfflineBanner = () => {
    if (isConnectedState) return null;

    return (
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>
          {t('You are offline. Please check your internet connection.')}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkConnectivity}>
          <Text style={styles.retryButtonText}>{t('Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const checkConnectivity = async (showFeedback = true) => {
    try {
      const connected = await isConnected();
      setIsConnectedState(connected);

    
      return connected;
    } catch (error) {
      logger.error('Connectivity check failed:', error, { context:'AddAbscence' });
      setIsConnectedState(false);
      return false;
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);
  const openPicker = (type, mode) => {
    setPickerType(type); // start | end
    setPickerMode(mode); // date | time
    setIsDatePickerVisible(true);
  };
  const onConfirmPicker = selected => {
    if (pickerMode === 'date') {
      const formatted = moment(selected).format('YYYY-MM-DD');

      if (pickerType === 'start') {
        setDateFrom(formatted);
        // auto-correct end date if wrong
        if (dateTo && moment(formatted).isAfter(moment(dateTo))) {
          setDateTo(null);
        }
      } else {
        if (dateFrom && moment(selected).isBefore(moment(dateFrom))) {
          showAlert('End date cannot be before start date', 'error');
          setIsDatePickerVisible(false);
          return;
        }
        setDateTo(formatted);
      }
    }

    if (pickerMode === 'time') {
      const formatted = moment(selected).format('HH:mm');

      if (pickerType === 'start') {
        setTimeFrom(formatted);
        if (
          timeTo &&
          moment(formatted, 'HH:mm').isAfter(moment(timeTo, 'HH:mm'))
        ) {
          setTimeTo(null);
        }
      } else {
        if (
          timeFrom &&
          moment(selected, 'HH:mm').isBefore(moment(timeFrom, 'HH:mm'))
        ) {
          showAlert('End time cannot be before start time', 'error');
          setIsDatePickerVisible(false);
          return;
        }
        setTimeTo(formatted);
      }
    }

    setIsDatePickerVisible(false);
  };

  const validateAbsence = () => {
    let temp = {
      comment: '',
      worker: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
    };

    let isValid = true;

    // COMMENT
    if (!comment?.trim()) {
      temp.comment = 'Comment is required';
      isValid = false;
    }

    // WORKER
    if (!selectedWroker) {
      temp.worker = 'Please select a employee';
      isValid = false;
    }

    // TYPE
    if (!selectedType) {
      temp.type = 'Please select absence type';
      isValid = false;
    }

    // IF FULL DAY
    if (!dateFrom) {
      temp.dateFrom = 'Start date required';
      isValid = false;
    }
    if (!dateTo) {
      temp.dateTo = 'End date required';
      isValid = false;
    }
    if (dateFrom && dateTo) {
      if (moment(dateTo).isBefore(moment(dateFrom))) {
        temp.dateTo = 'End date cannot be before start date';
        isValid = false;
      }
    }

    // IF HALF DAY
    if (isPartial) {
      if (!timeFrom) {
        temp.timeFrom = 'Start time required';
        isValid = false;
      }

      if (!timeTo) {
        temp.timeTo = 'End time required';
        isValid = false;
      }

      if (timeFrom && timeTo) {
        if (moment(timeTo, 'HH:mm').isBefore(moment(timeFrom, 'HH:mm'))) {
          temp.timeTo = 'End time cannot be before start time';
          isValid = false;
        }
      }
    }

    setErrors(temp);
    logger.log(temp, { context:'AddAbscence' });
    return isValid;
  };
  const onSubmit = async () => {
    try {
      if (!validateAbsence()) return;

      const connected = await checkConnectivity(false);

      const payload = {
        worker_id: selectedWroker?.value,
        absence_type_id: selectedType?.value,
        start_date: dateFrom,
        end_date: dateTo,
        comment: comment,
        is_partial: isPartial,
        partial_start_time: timeFrom,
        partial_end_time: timeTo,
      };

      if (!connected) {
        const result = await savePendingAction('ADD_ABSCENCE', {
          url:  `${baseUrl}/absences/admin/absences`,
          data: payload,
          token,
          type: 'ADD_ABSCENCE',
        });


        if (result?.rowsAffected > 0 || result?.insertId) {
          showAlert(
            'You are offline. The request has been queued and will sync automatically.',
            'success',
          );


          navigation.goBack()

        } else {
          showAlert(
            'Could not save offline request. Please try again.',
            'error',
          );
        }
        return;

      } else {
        const {ok, data} = await fetchApis(
          `${baseUrl}/absences/admin/absences`,
          'POST',
          setLoading,
          payload,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );

        // Always display API response
        ApiResponse(showAlert, data, language);

        // Success handling
        if (ok && !data?.error) {
          setTimeout(() => {
            navigation.goBack();
          }, 2000);

          logger.log(data, { context:'AddAbscence' });
        }
      }
    } catch (error) {
      logger.log('Absence Submit Error:', error, { context:'AddAbscence' });
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      // Ensure loading stops even if error occurs
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {renderOfflineBanner()}
      <StackHeader
        title={t('Add Absence')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        style={{paddingHorizontal: wp(4), flex: 1}}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Comment')}</Text>
          <TxtInput
            placeholder={t('Comment')}
            value={comment}
            onChangeText={value => {
              setComment(value);
              setErrors({...errors, comment: ''});
            }}
            error={errors.comment}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Employees')}</Text>
          <CustomDropDown
            data={workers}
            selectedValue={selectedWroker}
            onValueChange={value => {
              setSelectedWroker(value);
              setErrors({...errors, worker: ''});
            }}
            placeholder={t(`Worker`)}
            error={errors.worker}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Abscence Type')}</Text>
          <CustomDropDown
            data={absenceTypes}
            selectedValue={selectedType}
            onValueChange={value => {
              setSelectedType(value);
              setErrors({...errors, type: ''});
            }}
            placeholder={t(`Type`)}
            error={errors.type}
          />
        </View>

        <View style={styles.section}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.sectionTitle}>{t('Set the date range')}</Text>
            <Text style={styles.errorText}>
              {errors.dateFrom ? errors.dateFrom : errors.dateTo}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openPicker('start', 'date')}>
              <Text style={styles.dateText}>{dateFrom || t('Date From')}</Text>
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
              onPress={() => openPicker('end', 'date')}>
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

        <View
          style={[
            styles.section,
            {
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginBottom: hp(1.5),
            },
          ]}>
          <Text style={[styles.sectionTitle, {marginBottom: 0}]}>
            {t('Half Day')}
          </Text>
          <TouchableOpacity
            style={{justifyContent: 'center'}}
            onPress={() => setIsPartial(!isPartial)}>
            {isPartial ? (
              <MaterialCommunityIcons
                name="checkbox-marked"
                size={RFPercentage(2.5)}
                color={Colors.lightTheme.primaryColor}
              />
            ) : (
              <MaterialCommunityIcons
                name="checkbox-blank-outline"
                size={RFPercentage(2.5)}
                color="#C4C4C4"
              />
            )}
          </TouchableOpacity>
        </View>

        {isPartial && (
          <View style={styles.section}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.sectionTitle}>{t('Set the time range')}</Text>
              <Text style={styles.errorText}>
                {errors.timeFrom ? errors.timeFrom : errors.timeTo}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => openPicker('start', 'time')}>
                <Text style={styles.dateText}>
                  {timeFrom || t('Start Time')}
                </Text>
                <MaterialCommunityIcons name="clock" size={RFPercentage(2.5)} />
              </TouchableOpacity>

              <Text style={styles.dashText}>–</Text>

              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => openPicker('end', 'time')}>
                <Text style={styles.dateText}>{timeTo || t('End Time')}</Text>
                <MaterialCommunityIcons name="clock" size={RFPercentage(2.5)} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Apply Button */}
      </ScrollView>
      <View style={styles.btnContainer}>
        <CustomButton
          text={'Add'}
          containerStyle={styles.applyBtn}
          onPress={onSubmit}
          textStyle={styles.applyText}
          isLoading={loading}
        />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={pickerMode} // <── dynamic mode
        onClose={() => setIsDatePickerVisible(false)}
        onConfirm={onConfirmPicker}
      />
    </View>
  );
};

export default AddAbscence;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
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
      marginTop: hp(2),
    },
    applyText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: '#fff',
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      paddingLeft: wp('2%'),
      marginTop: hp(0.5),
      marginBottom: hp(0.5),
      width: '60%',
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: wp(4),
      paddingHorizontal: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    offlineBanner: {
      backgroundColor: '#ff6b6b',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    offlineText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      flex: 1,
    },
    retryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: 5,
    },
    retryButtonText: {
      color: 'white',
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.2),
    },
  });
