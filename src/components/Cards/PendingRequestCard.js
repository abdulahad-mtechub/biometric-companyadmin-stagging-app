import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {Colors} from '@constants/themeColors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {useTranslation} from 'react-i18next';
import {Svgs} from '@assets/Svgs/Svgs';
import { capitalize } from '@utils/Helpers';
import moment from 'moment';
import logger from '@utils/logger';

const PendingRequestCard = ({type, data, onCancelPress, onSyncPress}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode);
  const {t} = useTranslation();




  return (
    <View style={styles.container}>
      {type === 'worker' ? (
        <View>
          <View style={[styles.rowView, {justifyContent: 'space-between'}]}>
            <View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Employee Name:')}</Text>
                <Text style={styles.name}>
                  {' '}
                  {`${data.first_name} ${data.last_name}`}
                </Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Email: ')}</Text>
                <Text style={styles.name}> {data.email}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Employement Type:')}</Text>
                <Text style={styles.name}> {data.employee_type}</Text>
              </View>
            </View>

            <View style={[styles.rowView, {justifyContent: 'flex-end'}]}>
              <TouchableOpacity onPress={() => onCancelPress(data.id)}>
                <Svgs.crossRed />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSyncPress(data)}>
                <Svgs.retry height={hp(5)} width={hp(5)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : type === 'department' ? (
        <View>
          <View style={[styles.rowView, {justifyContent: 'space-between'}]}>
            <View style={{width: '70%'}}>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Department name: ')}</Text>
                <Text style={styles.name}>{`${data.name}`}</Text>
              </View>
            </View>

            <View style={[styles.rowView, {justifyContent: 'flex-end'}]}>
              <TouchableOpacity onPress={() => onCancelPress(data.id)}>
                <Svgs.crossRed />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSyncPress(data)}>
                <Svgs.retry height={hp(5)} width={hp(5)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : type === 'EDIT_PROFILE' ? (
        <View>
          <View style={[styles.rowView, {justifyContent: 'space-between'}]}>
            <View style={{width: '70%'}}>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Full Name: ')}</Text>
                <Text style={styles.name}>{data.middle_name? `${data.first_name} ${data.middle_name} ${data.last_name}` : `${data.first_name} ${data.last_name}`}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Phone Number: ')}</Text>
                <Text style={styles.name}>{data?.phone_number}</Text>
              </View>
            </View>

            <View style={[styles.rowView, {justifyContent: 'flex-end'}]}>
              <TouchableOpacity onPress={() => onCancelPress(data.id)}>
                <Svgs.crossRed />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSyncPress(data)}>
                <Svgs.retry height={hp(5)} width={hp(5)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) :type === 'CREATE_TASK' ? (
        <View>
          <View style={[styles.rowView, {justifyContent: 'space-between'}]}>
            <View style={{width: '70%'}}>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Task Name')}:</Text>
                <Text style={styles.name}> {capitalize(data.title)}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Description')}:</Text>
                <Text style={styles.name}> {capitalize(data?.description)}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Start Date')}:</Text>
                <Text style={styles.name}> {moment(data.start_at).format('YYYY-MM-DD')}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('End Date')}:</Text>
                <Text style={styles.name}> {moment(data.end_at).format('YYYY-MM-DD')}</Text>
              </View>
            </View>

            <View style={[styles.rowView, {justifyContent: 'flex-end'}]}>
              <TouchableOpacity onPress={() => onCancelPress(data.id)}>
                <Svgs.crossRed />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSyncPress(data)}>
                <Svgs.retry height={hp(5)} width={hp(5)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ):type === 'ADD_ABSCENCE' ? (
        <View>
          <View style={[styles.rowView, {justifyContent: 'space-between'}]}>
            <View style={{width: '70%'}}>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Comment')}:</Text>
                <Text style={styles.name}> {capitalize(data?.comment)}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('Start Date')}:</Text>
                <Text style={styles.name}> {moment(data.start_at).format('YYYY-MM-DD')}</Text>
              </View>
              <View style={styles.rowView}>
                <Text style={styles.Heading}>{t('End Date')}:</Text>
                <Text style={styles.name}> {moment(data.end_at).format('YYYY-MM-DD')}</Text>
              </View>
            </View>

            <View style={[styles.rowView, {justifyContent: 'flex-end'}]}>
              <TouchableOpacity onPress={() => onCancelPress(data.id)}>
                <Svgs.crossRed />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSyncPress(data)}>
                <Svgs.retry height={hp(5)} width={hp(5)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ): null}
    </View>
  );
};

export default PendingRequestCard;

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(2),
      paddingTop: hp(2),
      paddingBottom: hp(2),
      borderRadius: wp(2),
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      justifyContent: 'center',
      marginBottom: hp(1),
    },
    Heading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    name: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
  });
