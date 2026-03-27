import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import moment from 'moment';
import StatusBox from '@components/Cards/StatusBox'; // optional if you want to show status badge
import {capitalize} from '@utils/Helpers';
import {Svgs} from '@assets/Svgs/Svgs';
import Loader from '@components/Loaders/loader';
import {useTranslation} from 'react-i18next';
import logger from '@utils/logger';

const AbscenceCard = ({onEditPress, item, loading}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.card}>
      
      <View style={styles.headerRow}>
        <Text style={styles.idText}>#{item?.id}</Text>
        {loading ? (
          <Loader size={wp(6)} />
        ) : (
          <TouchableOpacity onPress={() => onEditPress?.()}>
            <Svgs.edit height={hp(3)} />
          </TouchableOpacity>
        )}
      </View>

      
      <View style={styles.divider} />

      
      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Employee')}:</Text>
        <Text style={styles.value}>
          {capitalize(item?.worker?.name) || 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Department')}:</Text>
        <Text style={styles.value}>{item?.worker?.department || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Type')}:</Text>
        <Text style={styles.value}>{item?.absence?.type?.name || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Comments')}:</Text>
        <Text style={[styles.value]} numberOfLines={2} ellipsizeMode="tail">
          {item?.absence?.comment || 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Start Date')}:</Text>
        <Text style={styles.value}>
          {item?.absence?.startDate
            ? moment(item?.absence?.startDate).format('DD MMM YYYY')
            : 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('End Date')}:</Text>
        <Text style={styles.value}>
          {item?.absence?.endDate
            ? moment(item?.absence?.endDate).format('DD MMM YYYY')
            : 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('Source')}:</Text>
        <Text style={styles.value}>
          {item?.absence?.source === 'manual_admin'
            ? 'Manual Admin'
            : item?.absence?.source === 'approved_leave'
            ? 'Approved Leave'
            : item?.absence?.source === 'no_show'
            ? 'No Show'
            : item?.absence?.source || 'N/A'}
        </Text>
      </View>
    </View>
  );
};

export default AbscenceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.lightTheme.secondryColor,
    borderRadius: wp(3),
    marginVertical: hp(1),
    padding: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  idText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: RFPercentage(2),
    color: Colors.lightTheme.primaryColor,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: hp(1),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(0.3),
  },
  label: {
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.lightTheme.secondryTextColor,
    fontSize: RFPercentage(1.8),
  },
  value: {
    fontFamily: Fonts.PoppinsRegular,
    color: Colors.lightTheme.primaryTextColor,
    fontSize: RFPercentage(1.8),
    maxWidth: wp(50),
    textAlign: 'right',
  },
});
