import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Svgs } from '@assets/Svgs/Svgs';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import logger from '@utils/logger';
import { t } from 'i18next';


const { width: screenWidth } = Dimensions.get('window');

const TaskCalendar = ({onCalenderIconPress}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode,Colors);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025
  const [tasks, setTasks] = useState([
    { id: 1, code: 'TK-02-123', date: new Date(2025, 4, 1), isAllDay: true },
    { id: 2, code: 'TK-02-123', date: new Date(2025, 4, 4), isAllDay: true },
    { id: 3, code: 'TK-02-123', date: new Date(2025, 4, 6), isAllDay: false, startTime: '12:00 PM', endTime: '5:00 PM' },
    { id: 4, code: 'TK-02-123', date: new Date(2025, 4, 12), isAllDay: true },
    { id: 5, code: 'TK-02-123', date: new Date(2025, 4, 13), isAllDay: true },
  ]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ 
    code: '', 
    date: '', 
    isAllDay: true, 
    startTime: '', 
    endTime: '' 
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const dayNamesLong = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

    const days = [];
    
    // Add previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day)
      });
    }
    
    // Add next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day)
      });
    }
    
    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };

  const getTasksForCurrentMonth = () => {
    return tasks.filter(task => 
      task.date.getMonth() === currentDate.getMonth() &&
      task.date.getFullYear() === currentDate.getFullYear()
    );
  };


  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const hasTaskOnDate = (date) => {
    return tasks.some(task => 
      task.date.toDateString() === date.toDateString()
    );
  };

  const addTask = () => {
    if (newTask.code && newTask.date) {
      const taskDate = new Date(newTask.date);
      const task = {
        id: tasks.length + 1,
        code: newTask.code,
        date: taskDate,
        isAllDay: newTask.isAllDay,
        startTime: newTask.startTime,
        endTime: newTask.endTime
      };
      setTasks([...tasks, task]);
      setNewTask({ code: '', date: '', isAllDay: true, startTime: '', endTime: '' });
      setShowAddTask(false);
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setTasks(tasks.filter(task => task.id !== taskId));
        }}
      ]
    );
  };

  const getDayName = (date) => {
    return dayNamesLong[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  const weeks = getDaysInMonth(currentDate);
  const today = new Date();
  console.log(tasks)


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>
            <View style={styles.monthContainer}>
              <Text style={styles.monthText}>{months[currentDate.getMonth()]}</Text>
              <Text style={styles.yearText}>{currentDate.getFullYear()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth(1)}
            >
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View
                  style={{
                    flexDirection: 'row',
                    gap: wp(4),
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => setShowAddTask(true)}>
                    {isDarkMode ? (
                      <Svgs.whitePlus />
                    ) : (
                      <Svgs.plusBlack />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onCalenderIconPress}>
                    {isDarkMode ? (
                      <Svgs.calenderYearlyView />
                    ) : (
                      <Svgs.calenderYearlyView />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity>
                    {isDarkMode ? <Svgs.searchD /> : <Svgs.SearchL />}
                  </TouchableOpacity>
                </View>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Calendar weeks - horizontal scrollable */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.weeksScrollView}
        >
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekContainer}>
              {/* Day headers for this week */}
              <View style={styles.weekDayHeaders}>
                {week.map((day, dayIndex) => (
                  <Text key={`header-${weekIndex}-${dayIndex}`} style={styles.dayHeader}>
                    {dayNames[dayIndex]}
                  </Text>
                ))}
              </View>
              
              {/* Days for this week */}
              <View style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <View key={`${weekIndex}-${dayIndex}`} style={styles.dayContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dayButton,
                        !day.isCurrentMonth && styles.dayButtonInactive,
                        day.fullDate.toDateString() === today.toDateString() && styles.dayButtonToday,
                        hasTaskOnDate(day.fullDate) && day.fullDate.toDateString() !== today.toDateString() && styles.dayButtonHasTask
                      ]}
                    >
                      <Text style={[
                        styles.dayText,
                        !day.isCurrentMonth && styles.dayTextInactive,
                        day.fullDate.toDateString() === today.toDateString() && styles.dayTextToday
                      ]}>
                        {day.date}
                      </Text>
                    </TouchableOpacity>
                    {hasTaskOnDate(day.fullDate) && (
                      <View style={styles.taskDot} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList}>
        {getTasksForCurrentMonth()
          .sort((a, b) => a.date - b.date)
          .map(task => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskLeft}>
                <Text style={styles.taskDate}>{task.date.getDate()}</Text>
                <Text style={styles.taskDay}>{getDayName(task.date).substring(0, 3)}</Text>
              </View>
              <View style={styles.taskRight}>
                <Text style={styles.taskCode}>{task.code}</Text>
                <Text style={styles.taskTime}>
                  {task.isAllDay ? 'All day' : `${task.startTime} - ${task.endTime}`}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                {isDarkMode ? <Svgs.Delete /> : <Svgs.Delete />}
              </TouchableOpacity>
            </View>
          ))}
        
        {getTasksForCurrentMonth().length === 0 && (
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>{t("No tasks for this month")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Button */}
      

      {/* Add Task Modal */}
      <Modal
        visible={showAddTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTask(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddTask(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Task Code (e.g., TK-02-123)"
              value={newTask.code}
              onChangeText={(text) => setNewTask({...newTask, code: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={newTask.date}
              onChangeText={(text) => setNewTask({...newTask, date: text})}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>All Day</Text>
              <Switch
                value={newTask.isAllDay}
                onValueChange={(value) => setNewTask({...newTask, isAllDay: value})}
              />
            </View>
            
            {!newTask.isAllDay && (
              <View style={styles.timeInputs}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="Start Time"
                  value={newTask.startTime}
                  onChangeText={(text) => setNewTask({...newTask, startTime: text})}
                />
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  placeholder="End Time"
                  value={newTask.endTime}
                  onChangeText={(text) => setNewTask({...newTask, endTime: text})}
                />
              </View>
            )}
            
            <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
              <Text style={styles.addTaskButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const dynamicStyles = (isDarkMode,Colors) =>
    StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.backgroundColor,
  },
  header: {
    backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.backgroundColor,
    // paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthContainer: {
    alignItems: 'center',
    marginHorizontal: wp(2),
  },
  navButton: {
    // padding: 8, 
    // borderRadius: 8,
  },
  monthText: {
    fontSize: RFPercentage(pxToPercentage(23)),
    color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
    fontFamily: Fonts.PoppinsSemiBold,
    
  },
  yearText: {
    fontSize: RFPercentage(pxToPercentage(16)),
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    fontFamily: Fonts.PoppinsRegular,
    marginTop: hp(1),
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
        // padding: 8,
        // borderRadius: 8,
  },
  calendarContainer: {
    backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.backgroundColor,
    padding: wp(3)
  },

  weekDayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: RFPercentage(pxToPercentage(14)),
    fontWeight: '500',
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    width: wp(10),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  weeksScrollView: {
    flex: 1,
  },
  weekContainer: {
    width: screenWidth - wp(3),
    paddingHorizontal: wp(3),
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayContainer: {
    width: wp(10),
    height: hp(5),
    alignItems: 'center',
    marginBottom: hp(1),
  },
  dayButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonInactive: {
    // No specific styling for inactive days
  },
  dayButtonToday: {
    backgroundColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
  },
  dayButtonHasTask: {
    backgroundColor: '#f5f5f5',
  },
  dayText: {
    fontSize: RFPercentage(pxToPercentage(14)),
    color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  dayTextInactive: {
    color: '#ccc',
  },
  dayTextToday: {
    color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.darkTheme.primaryTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginTop: 2,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.backgroundColor,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  taskDate: {
    fontSize: RFPercentage(pxToPercentage(18)),
    fontFamily: Fonts.PoppinsSemiBold,
    color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
  },
  taskDay: {
    fontSize: RFPercentage(pxToPercentage(12)),
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    marginTop: hp(1),
  },
  taskRight: {
    flex: 1,
  },
  taskCode: {
    fontSize: RFPercentage(pxToPercentage(16)),
    fontFamily: Fonts.PoppinsSemiBold,
    color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
  },
  taskTime: {
    fontSize: RFPercentage(pxToPercentage(14)),
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    marginTop: hp(1),
  },
  deleteButton: {
    padding: 8,
  },
 
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  addTaskButton: {
    backgroundColor: isDarkMode? Colors.darkTheme.primaryBtn.BtnColor: Colors.lightTheme.primaryBtn.BtnColor,
    padding: wp(3),
    borderRadius: wp(12),
    alignItems: 'center',
    marginTop: hp(1),
  },
  addTaskButtonText: {
    color: isDarkMode? Colors.darkTheme.primaryBtn.TextColor: Colors.lightTheme.primaryBtn.TextColor,
    fontSize: RFPercentage(pxToPercentage(16)),
    fontFamily: Fonts.PoppinsSemiBold,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTasksText: {
    fontSize: RFPercentage(pxToPercentage(14)),
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    fontFamily: Fonts.PoppinsRegular,
  },
});

export default TaskCalendar;