import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-big-calendar';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import {SCREENS} from '@constants/Screens';
import {useAlert} from '@providers/AlertContext';
import {t} from 'i18next';
import logger from '@utils/logger';
import {capitalize} from '@utils/Helpers';

export default function TaskCalendar({
  showDailyView = true,
  updateDateRange,
  data,
  dateRange,
  currentDate,
  setCurrentDate,
  home = false,
}) {
  const [calendarMode, setCalendarMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const navigation = useNavigation();
  const viewOptions = ['month', 'Daily'];
  const {isDarkMode, Colors} = useSelector(store => store?.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const features = useSelector(store => store.subscription?.features);
  const hasTaskFeature = features?.includes('tasks');
  const formatMonthYear = date =>
    date.toLocaleString('default', {month: 'long', year: 'numeric'});
  const {showAlert} = useAlert();

  const fetchDailyTasks = async date => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];

      const transformedTasks = transformData(data, 'Daily', dateStr);
      setDailyTasks(transformedTasks);
    } catch (error) {
      logger.error('Error fetching daily tasks:', error, { context:'TaskCalender' });
      setDailyTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (Data, mode, specificDate = null) => {
    const tasksByDate = {};

    // Process flat array data structure from API
    if (Array.isArray(Data)) {
      Data.forEach(task => {
        if (!task.start_at || !task.end_at) return;

        const taskDate = new Date(task.start_at).toDateString();

        if (specificDate) {
          const filterDate = new Date(specificDate).toDateString();
          if (taskDate !== filterDate) return;
        }

        // Determine color based on priority
        const getPriorityColor = priority => {
          if (priority === 'urgent' || priority === 'high') return '#DC143C';
          if (priority === 'medium') return '#FF8C00';
          return '#32CD32'; // low or default
        };

        // Get assignment status from first worker if available
        const assignmentStatus = task.assigned_workers?.[0]?.assignment_status || null;

        const taskObj = {
          id: task.id.toString(),
          title: task.title,
          description: task.description || task.title,
          taskNo: `T-${task.id.toString().padStart(3, '0')}`,
          start: new Date(task.start_at),
          end: new Date(task.end_at),
          color: getPriorityColor(task.priority),
          priority: task.priority,
          status: task.status === 'in_progress'
            ? t('In Progress')
            : task.status === 'not_done'
            ? t('Not Done')
            : t(capitalize(task.status)),
          my_status: assignmentStatus,
          location: task.location_address || t('Location not specified'),
          face_required: task.face_required || false,
          location_required: task.location_required || false,
          evidence_required: task.evidence_required || false,
          originalTask: task, // Keep reference to original task for navigation
        };

        if (!tasksByDate[taskDate]) {
          tasksByDate[taskDate] = [];
        }
        tasksByDate[taskDate].push(taskObj);
      });
    }

    const calendarEvents = [];
    Object.entries(tasksByDate).forEach(([date, tasks]) => {
      if (showDailyView && mode === 'month') {
        const firstTask = tasks[0];
        calendarEvents.push({
          id: `dot_${date}`,
          title: '',
          start: firstTask.start,
          end: firstTask.end,
          color: 'transparent',
          isDot: true,
          taskCount: tasks.length,
          tasks: tasks,
          date: date,
        });
      } else if (mode === 'Daily' || tasks.length === 1) {
        tasks.forEach(task => {
          calendarEvents.push(task);
        });
      } else {
        const firstTask = tasks[0];
        calendarEvents.push({
          id: `group_${date}`,
          title: `${tasks.length} Tasks`,
          description: `${tasks.length} tasks scheduled`,
          start: firstTask.start,
          end: firstTask.end,
          color: '#4A90E2',
          isGroup: true,
          tasks: tasks,
          date: date,
        });
      }
    });

    return calendarEvents;
  };

  useFocusEffect(
    useCallback(() => {
      const transformedTasks = transformData(data, calendarMode);
      setTasks(transformedTasks);
    }, [data, currentDate, calendarMode]),
  );

  const goToNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
    updateDateRange(next);
  };

  const goToPrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
    updateDateRange(prev);
  };

  const handlePressEvent = event => {
    logger.log(event, { context:'TaskCalender' });

    if (showDailyView && event.isDot) {
      const eventDate = new Date(event.date);
      handleDatePress(eventDate);
      return;
    }
    // if (event.isGroup) {
    // } else {
    // }
  };

  const handleDatePress = date => {
    if (showDailyView && hasTaskFeature !== false) {
      setSelectedDate(date);
      fetchDailyTasks(date);
    } else {
      showAlert(
        'You do not have access to the Tasks feature. Please upgrade your subscription to access this feature.',
        'error',
      );
    }
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const goToPrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const renderDailyTasksSection = () => {
    if (!showDailyView || !selectedDate) return null;

    // Generate 24-hour timeline
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = {
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        displayTime: new Date(2023, 0, 1, hour, 0).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        tasks: dailyTasks.filter(task => {
          const taskHour = task.start.getHours();
          return taskHour === hour;
        }),
      };
      timeSlots.push(timeSlot);
    }

    return (
      <View style={styles.dailySection}>
        <View style={styles.dailySectionHeader}>
          <Text style={styles.dailySectionTitle}>
            {t('Timeline for')} {selectedDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.closeDailyButton}
            onPress={() => setSelectedDate(null)}>
            <Text style={styles.closeDailyButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.timelineContainer}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.timelineContent}>
          {loading ? (
            <Text style={styles.loadingText}>{t('Loading timeline...')}</Text>
          ) : (
            timeSlots.map((slot, index) => (
              <View key={slot.hour} style={styles.timeSlot}>
                <View style={styles.timeSlotHeader}>
                  <Text style={styles.timeSlotTime}>{slot.displayTime}</Text>
                  <View style={styles.timeSlotLine} />
                </View>
                <View style={styles.timeSlotContent}>
                  {slot.tasks.length === 0 ? (
                    <View style={styles.emptyTimeSlot}>
                      <Text style={styles.emptyTimeSlotText}>
                        {t('No tasks')}
                      </Text>
                    </View>
                  ) : (
                    slot.tasks.map((task, taskIndex) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          styles.timelineTaskItem,
                          {borderLeftColor: task.color},
                        ]}
                        onPress={() =>
                          navigation.navigate(SCREENS.TASKDETAILS, {item: task.originalTask || task})
                        }>
                        <View style={styles.timelineTaskContent}>
                          <View style={styles.timelineTaskHeader}>
                            <Text
                              style={styles.timelineTaskTitle}
                              numberOfLines={2}>
                              {task.title}
                            </Text>
                            <View
                              style={[
                                styles.timelinePriorityBadge,
                                {backgroundColor: task.color},
                              ]}>
                              <Text style={styles.timelinePriorityText}>
                                {task.priority?.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.timelineTaskTime}>
                            {task.start.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {task.end.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          {task.location && (
                            <Text
                              style={styles.timelineTaskLocation}
                              numberOfLines={1}>
                              📍 {task.location}
                            </Text>
                          )}
                          <View style={styles.timelineTaskStatus}>
                            <Text style={styles.timelineTaskStatusText}>
                              {t('Status:')} {task.status || 'Pending'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {!home && <Text style={styles.title}>{t('Task Calendar')}</Text>}
        {!showDailyView && (
          <CustomDropDown
            data={viewOptions}
            selectedValue={calendarMode}
            onValueChange={setCalendarMode}
            placeholder="Select view"
            width={wp(30)}
            zIndex={1000}
          />
        )}
      </View>
      {(calendarMode === 'month' || showDailyView) && (
        <View style={styles.monthNav}>
          {updateDateRange && (
            <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
              <Text style={styles.navButtonText}>◀</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.monthLabel}>{formatMonthYear(currentDate)}</Text>
          {updateDateRange && (
            <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
              <Text style={styles.navButtonText}>▶</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {calendarMode === 'Daily' && !showDailyView && (
        <View style={styles.dayNav}>
          <TouchableOpacity style={styles.navButton} onPress={goToPrevDay}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.dayLabel}>{currentDate.toDateString()}</Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}

      <Calendar
        events={tasks}
        height={hp(45)}
        mode={
          showDailyView ? 'month' : calendarMode === 'month' ? 'month' : 'day'
        }
        date={currentDate}
        // onPressEvent={handlePressEvent}
        onPressCell={handleDatePress}
        eventCellStyle={event => ({
          backgroundColor: event.isDot ? 'transparent' : event.color,
          borderRadius: 5,
          borderWidth: event.isDot ? 0 : 1,
          borderColor: '#fff',
          padding: event.isDot ? 0 : hp(1.3),
        })}
        swipeEnabled={false}
        headerStyle={
          calendarMode === 'Daily' && !showDailyView
            ? {height: 0, display: 'none'}
            : styles.calendarHeader
        }
        dayHeaderStyle={styles.dayHeader}
        showTime={!showDailyView}
        // onPressEvent={handlePressEvent}
        
        renderEvent={event => {
          if (event.isDot) {
            return (
              <View style={styles.dotContainer} pointerEvents="none">
                {/* <View style={[styles.taskDot, {backgroundColor: '#4A90E2'}]} /> */}
                {event.taskCount && (
                  <Text style={styles.dotCount}>{event.taskCount}</Text>
                )}
              </View>
            );
          }
          return (
            <View style={styles.eventWrapper} pointerEvents="none">
              <View
                style={[styles.eventContainer, {backgroundColor: event.color}]}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                {event.isGroup && (
                  <Text style={styles.groupIndicator}>
                    {expandedDate === event.date ? '▲' : '▼'}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />

      {renderDailyTasksSection()}
    </ScrollView>
  );
}

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      padding: wp(2),
      borderRadius: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
      paddingHorizontal: wp(2),
    },
    title: {
      fontSize: RFPercentage(2.5),
      fontWeight: 'bold',
      color: '#333',
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
      paddingHorizontal: wp(2),
    },
    monthLabel: {
      fontSize: RFPercentage(2.2),
      fontWeight: '600',
      color: '#333',
    },
    dayNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
      paddingHorizontal: wp(2),
    },
    navButton: {
      padding: 8,
      backgroundColor: '#006EC2',
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    dayLabel: {
      fontSize: RFPercentage(2),
      fontWeight: '600',
      color: '#333',
    },
    calendarHeader: {
      backgroundColor: '#f0f0f0',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    dayHeader: {
      backgroundColor: '#a0a0a0',
      color: '#333',
      fontWeight: '600',
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '85%',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      padding: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    colorIndicator: {
      height: 5,
      width: '100%',
      borderRadius: 2.5,
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: RFPercentage(2.2),
      fontWeight: 'bold',
      marginBottom: 15,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'flex-start',
    },
    detailLabel: {
      fontWeight: '600',
      width: wp(25),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    detailValue: {
      flex: 1,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : '#333',
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: '#006EC2',
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    eventContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 5,
      padding: hp(1),
      marginBottom: 2,
    },
    eventTitle: {
      color: '#fff',
      fontWeight: '600',
      flex: 1,
      fontSize: RFPercentage(1.6),
    },
    groupIndicator: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: RFPercentage(1.4),
    },
    eventWrapper: {
      position: 'relative',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(4),
    },
    dropdownContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 20,
      width: wp(90),
      maxWidth: wp(95),
      maxHeight: hp(70),
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      paddingVertical: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.05)',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    modalHeaderTitle: {
      fontSize: RFPercentage(2.2),
      fontWeight: '700',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
    },
    closeButton: {
      width: hp(4),
      height: hp(4),
      borderRadius: hp(2),
      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(2),
    },
    closeButtonText: {
      fontSize: RFPercentage(2),
      fontWeight: '600',
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
    },
    tasksDropdown: {
      maxHeight: hp(55),
      paddingHorizontal: wp(1),
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      borderLeftWidth: 4,
      marginHorizontal: wp(1),
      marginVertical: hp(0.5),
      borderRadius: 8,
    },
    taskContent: {
      flex: 1,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1),
    },
    taskTitle: {
      fontSize: RFPercentage(1.8),
      fontWeight: '600',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
      marginRight: wp(2),
      lineHeight: RFPercentage(2.2),
    },
    priorityBadge: {
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: 12,
      minWidth: wp(16),
      alignItems: 'center',
    },
    priorityText: {
      fontSize: RFPercentage(1.1),
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
    },
    taskDetails: {
      gap: hp(0.5),
    },
    taskTime: {
      fontSize: RFPercentage(1.4),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
      fontWeight: '500',
    },
    taskLocation: {
      fontSize: RFPercentage(1.3),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#888',
      fontStyle: 'italic',
    },
    taskArrow: {
      fontSize: RFPercentage(2.5),
      color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      fontWeight: '300',
      marginLeft: wp(2),
    },
    dotContainer: {
      position: 'absolute',
      top: 2,
      right: 2,
      alignItems: 'center',
    },
    taskDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 1,
    },
    dotCount: {
      fontSize: RFPercentage(1.5),
      color: '#4A90E2',
      fontWeight: 'bold',
      minWidth: 12,
      textAlign: 'center',
    },
    dailySection: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      height: hp(50),
      flex: 1,
    },
    dailySectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: wp(4),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.1)',
    },
    dailySectionTitle: {
      fontSize: RFPercentage(2),
      fontWeight: '600',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    closeDailyButton: {
      width: hp(3),
      height: hp(3),
      borderRadius: hp(1.5),
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeDailyButtonText: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
    },
    dailyTasksList: {
      flex: 1,
      paddingHorizontal: wp(2),
      paddingVertical: wp(1),
    },
    dailyTaskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      padding: wp(3),
      marginVertical: hp(0.5),
      borderRadius: 8,
      borderLeftWidth: 4,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    dailyTaskContent: {
      flex: 1,
    },
    dailyTaskTitle: {
      fontSize: RFPercentage(1.7),
      fontWeight: '600',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    dailyTaskTime: {
      fontSize: RFPercentage(1.4),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
      marginBottom: hp(0.3),
    },
    dailyTaskLocation: {
      fontSize: RFPercentage(1.3),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#888',
      fontStyle: 'italic',
    },
    dailyTaskPriority: {
      width: hp(3),
      height: hp(3),
      borderRadius: hp(1.5),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(2),
    },
    dailyTaskPriorityText: {
      fontSize: RFPercentage(1.2),
      fontWeight: 'bold',
      color: '#fff',
    },
    loadingText: {
      textAlign: 'center',
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
      fontSize: RFPercentage(1.6),
      padding: wp(4),
    },
    noTasksText: {
      textAlign: 'center',
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
      fontSize: RFPercentage(1.6),
      padding: wp(4),
      fontStyle: 'italic',
    },
    timelineContainer: {
      flex: 1,
    },
    timelineContent: {
      paddingHorizontal: wp(2),
      paddingBottom: hp(2),
    },
    timeSlot: {
      marginBottom: hp(1),
    },
    timeSlotHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(0.5),
      paddingHorizontal: wp(2),
    },
    timeSlotTime: {
      fontSize: RFPercentage(1.8),
      fontWeight: '600',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      minWidth: wp(20),
    },
    timeSlotLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      marginLeft: wp(2),
    },
    timeSlotContent: {
      minHeight: hp(6),
      paddingLeft: wp(22),
      paddingRight: wp(2),
    },
    emptyTimeSlot: {
      height: hp(6),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.02)'
        : 'rgba(0,0,0,0.02)',
      borderRadius: 8,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    emptyTimeSlotText: {
      fontSize: RFPercentage(1.4),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#999',
      fontStyle: 'italic',
    },
    timelineTaskItem: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: 10,
      borderLeftWidth: 5,
      marginBottom: hp(1),
      padding: wp(3),
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    timelineTaskContent: {
      flex: 1,
    },
    timelineTaskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1),
    },
    timelineTaskTitle: {
      fontSize: RFPercentage(1.8),
      fontWeight: '600',
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      flex: 1,
      marginRight: wp(2),
      lineHeight: RFPercentage(2.2),
    },
    timelinePriorityBadge: {
      width: hp(3),
      height: hp(3),
      borderRadius: hp(1.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    timelinePriorityText: {
      fontSize: RFPercentage(1.2),
      fontWeight: 'bold',
      color: '#fff',
    },
    timelineTaskTime: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
      fontWeight: '500',
      marginBottom: hp(0.5),
    },
    timelineTaskLocation: {
      fontSize: RFPercentage(1.4),
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#888',
      fontStyle: 'italic',
      marginBottom: hp(0.5),
    },
    timelineTaskStatus: {
      paddingTop: hp(0.5),
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    timelineTaskStatusText: {
      fontSize: RFPercentage(1.3),
      fontWeight: '500',
      color: isDarkMode ? Colors.darkTheme.secondaryTextColor : '#666',
    },
  });
