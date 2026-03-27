import React, {useCallback, useRef, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SCREENS} from '@constants/Screens';
import CustomBottomTabBar from '@components/CustomBottomTabBar';
import {Svgs} from '@assets/Svgs/Svgs';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Home from '@screens/BottomTabs/Home';
import {useDispatch, useSelector} from 'react-redux';
import Menu from '@screens/BottomTabs/Menu';
import Worker from '@screens/BottomTabs/Worker';
import Attendance from '@screens/BottomTabs/Attendence/Attendance';
import logger from '@utils/logger';
import {useFocusEffect} from '@react-navigation/native';
import {ImgURL, baseUrl} from '@constants/urls';
import {io} from 'socket.io-client';
import TaskManagement from '@screens/BottomTabs/TaskManagement';
import { setTotalCount } from '../redux/Slices/messageSlice';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {token} = useSelector(store => store.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const refetchTimerRef = useRef(null);
  const dispatch = useDispatch();

  const onTotalUpdated = data => {
    const total = data?.totalUnread ?? data?.total_unread_count ?? data?.count;
    if (typeof total === 'number') {
      dispatch(setTotalCount(total));
    }
  };

  const fetchUnreadCounts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/messages/unread-counts/detailed`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.error) return;

      const raw = data.data || data;
      const total = raw.total ?? raw.totalUnread;

      if (typeof total === 'number') {
      console.log(total, 'Fetched total unread count');
        dispatch(setTotalCount(total));
      }
    } catch (err) {
      console.warn('fetchUnreadCounts failed:', err);
    }
  };

  const scheduleRefetch = () => {
    if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(fetchUnreadCounts, 500);
  };
  useFocusEffect(
    useCallback(() => {
      socketRef.current = io(ImgURL, {
        auth: {token},
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10, // Increased attempts
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Socket connection events
      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current.id);

        // Authenticate first
        socketRef.current.emit('authenticate', {token});
        socketRef.current.on('total_unread_count_updated', onTotalUpdated);
        socketRef.current.on('unread_count_updated', scheduleRefetch);
        socketRef.current.on('new_message', scheduleRefetch);
        socketRef.current.on('messages_read', scheduleRefetch);

        // Initial fetch on connect
        fetchUnreadCounts();
      });

      return () => {
        if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        if (socketRef.current) {
          socketRef.current.off('total_unread_count_updated', onTotalUpdated);
          socketRef.current.off('unread_count_updated', scheduleRefetch);
          socketRef.current.off('new_message', scheduleRefetch);
          socketRef.current.off('messages_read', scheduleRefetch);
          socketRef.current.disconnect();
        }
      };
    }, []),
  );

  const icons = [
    isDarkMode ? (
      <Svgs.HomeD height={wp(6)} width={wp(6)} />
    ) : (
      <Svgs.HomeL height={wp(6)} width={wp(6)} />
    ),
    isDarkMode ? (
      <Svgs.workerWhite height={wp(6)} width={wp(6)} />
    ) : (
      <Svgs.workerL height={wp(6)} width={wp(6)} />
    ),
    isDarkMode ? (
      <Svgs.ClockD height={wp(6)} width={wp(6)} />
    ) : (
      <Svgs.ClockL height={wp(6)} width={wp(6)} />
    ),
    isDarkMode ? (
      <Svgs.task height={wp(6)} width={wp(6)} />
    ) : (
      <Svgs.taskBlack height={wp(6)} width={wp(6)} />
    ),
    isDarkMode ? (
      <Svgs.moreD height={wp(6)} width={wp(6)} />
    ) : (
      <Svgs.moreL height={wp(6)} width={wp(6)} />
    ),
  ];
  const FocusedIcons = [
    <Svgs.HomeActive height={wp(6)} width={wp(6)} />,
    <Svgs.WorkerActive height={wp(6)} width={wp(6)} />,
    <Svgs.ClockActive height={wp(6)} width={wp(6)} />,
    <Svgs.createTask height={wp(6)} width={wp(6)} />,
    <Svgs.moreActive height={wp(6)} width={wp(6)} />,
  ];
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false, tabBarHideOnKeyboard: true}}
      tabBar={props => (
        <CustomBottomTabBar
          {...props}
          icons={icons}
          FocusedIcons={FocusedIcons}
        />
      )}>
      <Tab.Screen
        name={SCREENS.HOME}
        component={Home}
        options={{
          headerShown: false,
          title: 'Home',
        }}
      />
      <Tab.Screen
        name={SCREENS.WORKER}
        component={Worker}
        options={{
          headerShown: false,
          title: 'Employees',
        }}
      />
      <Tab.Screen
        name={SCREENS.ATTENDANCE}
        component={Attendance}
        options={{
          headerShown: false,
          title: 'Attendance',
        }}
      />
      <Tab.Screen
        name={SCREENS.TASKMANAGEMENT}
        component={TaskManagement}
        options={{
          headerShown: false,
          title: 'Task',
        }}
      />
      <Tab.Screen
        name={SCREENS.MENU}
        component={Menu}
        options={{
          headerShown: false,
          title: 'More',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
