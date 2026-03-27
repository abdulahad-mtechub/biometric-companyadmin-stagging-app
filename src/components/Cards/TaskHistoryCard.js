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
import {pxToPercentage} from '@utils/responsive';

const TaskHistoryCard = ({item, onPress, containerStyle}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  const taskName = item?.title || '--';
  const employeeName = item?.worker?.name || '--';
  const employeeEmail = item?.worker?.email || '--';
  const status = item?.task_status || 'N/A';
  const priority = item?.priority || '--';
  const createdAt = item?.task_date
    ? moment(item.task_date).format('DD MMM YYYY - h:mma')
    : '--';
  const actualStart = item?.actual.started_at
    ? moment(item.item?.actual.started_at).format('DD MMM YYYY - h:mma')
    : '--';
  const actualEnd = item?.actual.ended_at
    ? moment(item.item?.actual.started_at).format('DD MMM YYYY - h:mma')
    : '--';

  const deadline = item?.end_at
    ? moment(item.end_at).format('DD MMM YYYY - h:mma')
    : '--';

  const statusStyle =
    statusStyles[
      status === 'in_progress' ? 'In Progress' : capitalize(status)
    ] || {};

  const statusColors = {
    on_time: {
      backgroundColor: '#00C48C',
      color: '#FFFFFF',
      label: 'On Time',
    }, // Green
    late: {
      backgroundColor: '#FF974A',
      color: '#FFFFFF',
      label: 'Late',
    }, // Orange
    assigned: {
      backgroundColor: '#8F00FF',
      color: '#FFFFFF',
      label: 'Assigned',
    }, // Purple
    in_progress: {
      backgroundColor: '#8E65E9',
      color: '#FFFFFF',
      label: 'In Progress',
    }, // Light Purple
    completed: {
      backgroundColor: '#00C48C',
      color: '#FFFFFF',
      label: 'Completed',
    }, // Green
    delayed: {
      backgroundColor: '#FF974A',
      color: '#FFFFFF',
      label: 'Delayed',
    }, // Orange
    not_done: {
      backgroundColor: '#FF647C',
      color: '#FFFFFF',
      label: 'Not Done',
    }, // Red
    cancelled: {
      backgroundColor: '#9F4BFF',
      color: '#FFFFFF',
      label: 'Cancelled',
    }, // Purple
    not_started: {
      backgroundColor: '#9F4BFF',
      color: '#FFFFFF',
      label: 'Not Started',
    }, // Purple
    not_ended: {
      backgroundColor: '#FFDC60',
      color: '#000000',
      label: 'Not Ended',
    }, // Yellow
  };

  return (
    <TouchableOpacity
      
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
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Task Location')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {capitalize(item?.location?.address)}
            </Text>
            <Text
              style={[styles.detailValue, {fontStyle: 'italic'}]}
              numberOfLines={1}>
              {item.requirements?.location_required
                ? 'Required'
                : 'Not Required'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Actual Start')}:</Text>
            <Text style={styles.detailValue}>{actualStart}</Text>
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Start Status')}:</Text>
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    statusColors[item?.attendance?.start_status]
                      ?.backgroundColor,
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {color: statusColors[item?.attendance?.start_status]?.color},
                ]}
                numberOfLines={1}>
                {t(statusColors[item?.attendance?.start_status]?.label)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Start Delay')}:</Text>
            <Text style={[styles.detailValue]} numberOfLines={1}>
              {item?.attendance?.start_delay_minutes === 0
                ? '--'
                : item?.attendance?.start_delay_minutes}
            </Text>
          </View>
        </View>
        {/* Row 4 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('End Status')}:</Text>
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    statusColors[item?.attendance?.end_status]?.backgroundColor,
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {color: statusColors[item?.attendance?.end_status]?.color},
                ]}
                numberOfLines={1}>
                {t(statusColors[item?.attendance?.end_status]?.label)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('End Delay')}:</Text>
            <Text style={[styles.detailValue]} numberOfLines={1}>
              {item?.attendance?.start_delay_minutes === 0
                ? '--'
                : item?.attendance?.end_delay_minutes}
            </Text>
          </View>
        </View>
        {/* Row 5 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Actual End')}:</Text>
            <Text style={styles.detailValue}>{actualEnd}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Created At')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {createdAt}
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Scheduled Start')}:</Text>
            <Text style={styles.detailValue}>
              {moment(item?.scheduled?.start_at).format('hh:mm A')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('Scheduled End')}:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {moment(item?.scheduled?.end_at).format('hh:mm A')}
            </Text>
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
    statusBox: {
      borderRadius: wp(1),
      paddingHorizontal: wp(2.5),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: wp(0.5),
    },
    statusText: {
      fontSize: RFPercentage(pxToPercentage(14)),
      textAlign: 'center',
      marginLeft: wp(1),
      color: Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
  });

export default TaskHistoryCard;
