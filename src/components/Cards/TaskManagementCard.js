import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import {capitalize} from '@utils/Helpers';
import {statusStyles} from '@constants/DummyData';
import StatusBox from './StatusBox';
import moment from 'moment';

const TaskManagementCard = ({item, onPress, containerStyle}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();


  const taskName = item?.title || '--';
  const employeeName = item?.assigned_workers?.[0]?.worker_name || '--';
  const employeeEmail = item?.assigned_workers?.[0]?.worker_email || '--';
  const status = item?.status || 'N/A';
  const priority = item?.priority || '--';
  const createdAt = item?.created_at
    ? moment(item.created_at).format('DD MMM YYYY - h:mma')
    : '--';
  const deadline = item?.end_at
    ? moment(item.end_at).format('DD MMM YYYY - h:mma')
    : '--';

  const statusStyle = statusStyles[status === 'in_progress' ? 'In Progress' : capitalize(status)] || {};


  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[styles.container, containerStyle]}>
      <View style={styles.detailsGrid}>
        {/* Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Task Name')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {capitalize(taskName)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Employee Name')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {employeeName}
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Employee Email')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {employeeEmail}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Status')}:</Text>
            <StatusBox
              status={
                status === 'initiated'
                  ? 'Processing'
                  : capitalize(status?.replace(/_/g, ' '))
              }
              backgroundColor={statusStyle?.backgroundColor}
              color={statusStyle?.color}
              icon={statusStyle?.icon}
            />
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Priority')}:</Text>
            <Text style={styles.detailValue}>{capitalize(priority)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Created At')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {createdAt}
            </Text>
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.detailRow}>
          <View style={[styles.detailItem, {flex: 1}]}>
            <Text style={styles.detailLabel}>{t('Deadline')}:</Text>
            <Text style={styles.detailValue}>{deadline}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(4),
      padding: wp(4),
      marginBottom: hp(1.5),
      elevation: 2,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    detailsGrid: {
      gap: hp(1.5),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(3),
    },
    detailItem: {
      flex: 1,
    },
    detailLabel: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(0.3),
    },
    detailValue: {
      fontSize: RFPercentage(1.5),
      fontFamily: Fonts.NunitoRegular,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

export default TaskManagementCard;
