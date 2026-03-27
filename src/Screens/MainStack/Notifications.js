import {t} from 'i18next';
import React, {useCallback, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import StackHeader from '@components/Header/StackHeader';
import {initialNotifications} from '@constants/DummyData';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {useFocusEffect} from '@react-navigation/native';
import EmptyCard from '@components/Cards/EmptyCard';
import {Svgs} from '@assets/Svgs/Svgs';
import Loader from '@components/Loaders/loader';
import moment from 'moment';
import {useApiData} from '@utils/Hooks/Hooks';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import {SCREENS} from '@constants/Screens';
import logger from '@utils/logger';

const NotificationScreen = ({navigation}) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const markAllAsReadURL = `${baseUrl}/notifications/company-admin/mark-all-read`;

  const {
    apiData,
    setApiData,
    page,
    setPage,
    hasNext,
    setHasNext,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    refreshing,
    setRefreshing,
    resetPagination,
  } = useApiData();

  const getUrl = pageNumber => {
    let url = `${baseUrl}/notifications/company-admin?limit=10&offset=0&page=${pageNumber}`;

    // if (status) url += `&status=${status}`;
    // if (showSearch) url += `&search=${searchText}`;
    logger.log(url, {context: 'Notifications'});
    return url;
  };

  const fetchData = async (reset = false, resetSearch = true) => {
    if (isLoading || (!reset && !hasNext)) return;

    const loadingState = reset ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const currentPage = reset ? 1 : page;
      const url = getUrl(currentPage);
      const {ok, data: responseData} = await fetchApis(
        url,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      if (!ok || responseData?.error) {
        logger.log('Fetch error:', responseData, {context: 'Notifications'});
        ApiResponse(showAlert, responseData, language);

        return;
      }

      const fetchedData = responseData?.data?.notifications || [];
      const totalCount = responseData?.data?.pagination?.total || 0;

      setApiData(prev => (reset ? fetchedData : [...prev, ...fetchedData]));

      setHasNext(responseData?.data?.pagination?.has_next || false);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'Notifications'});
      showAlert('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      if (reset) {
        setRefreshing(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
    }, []),
  );

  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingMore && !isLoading) {
      fetchData(false);
    }
  }, [hasNext, isLoadingMore, isLoading, fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetPagination();
    fetchData(true);
  }, [resetPagination]);

  const {isDarkMode} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode);
  const getNotificationColor = type => {
    const colorMap = {
      'check-in': isDarkMode
        ? Colors.darkTheme.checkInColor
        : Colors.lightTheme.checkInColor,
      'check-out': isDarkMode
        ? Colors.darkTheme.checkOutColor
        : Colors.lightTheme.checkOutColor,
      ae_registration: isDarkMode
        ? Colors.darkTheme.taskAssignedColor
        : Colors.lightTheme.taskAssignedColor,
      ca_registration: isDarkMode
        ? Colors.darkTheme.taskAssignedColor
        : Colors.lightTheme.taskAssignedColor,
      'task-complete': isDarkMode
        ? Colors.darkTheme.taskCompleteColor
        : Colors.lightTheme.taskCompleteColor,
      'deadline-missed': isDarkMode
        ? Colors.darkTheme.deadlineMissedColor
        : Colors.lightTheme.deadlineMissedColor,
    };
    return colorMap[type] || Colors.lightTheme.checkInColor;
  };
  const getNotificationAvatar = type => {
    const avatarMap = {
      ae_registration: '👨‍💼',
      ca_registration: '🏢',
    };
    return avatarMap[type] || '✅';
  };

  // const toggleReadStatus = rowKey => {
  //   setNotifications(prev =>
  //     prev.map(item =>
  //     ),
  //   );
  // };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.is_read
            ? isDarkMode
              ? Colors.darkTheme.readBackground
              : Colors.lightTheme.readBackground
            : isDarkMode
            ? Colors.darkTheme.unreadBackground
            : Colors.lightTheme.unreadBackground,
        },
      ]}>
      <View style={styles.notificationContent}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.avatarContainer,
              {backgroundColor: getNotificationColor(item.type)},
            ]}>
            <Text style={styles.avatar}>
              {getNotificationAvatar(item.type)}
            </Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.notificationTitle}>{t(item.title)}!</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: wp(1)}}>
            <Text style={styles.notificationName}>{item.message}</Text>
          </View>

          <Text style={styles.notificationTime}>
            {moment(item.sent_at).format('DD MMM YYYY, hh:mm A')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHiddenItem = ({item}) => {
    const isUnread = !item.isRead;

    const hiddenBackgroundColor = isUnread
      ? Colors.lightTheme.primaryColor // Unread: primary color
      : isDarkMode
      ? Colors.darkTheme.ActiveSkyBackColor
      : Colors.lightTheme.ActiveSkyBackColor;

    const iconAndTextColor = isUnread
      ? '#FFFFFF'
      : isDarkMode
      ? Colors.darkTheme.secondryTextColor
      : Colors.lightTheme.secondryTextColor;

    return (
      <View
        style={[
          styles.hiddenItemContainer,
          {backgroundColor: hiddenBackgroundColor},
        ]}>
        <View style={styles.hiddenItemContent}>
          <TouchableOpacity
            style={[styles.actionButton, styles.readButton]}
            onPress={() => toggleReadStatus(item.key)}>
            <Icon
              name={item.isRead ? 'mark-email-unread' : 'markunread'}
              size={24}
              color={iconAndTextColor}
            />
            <Text style={[styles.actionButtonText, {color: iconAndTextColor}]}>
              {item.isRead ? 'Unread' : 'Read'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <Loader size={wp(10)} />
        </View>
      );
    }
    return null;
  }, [isLoadingMore, t, styles]);

  const markAllAsRead = async () => {
    const {ok, data} = await fetchApis(
      markAllAsReadURL,
      'PUT',
      null,
      null,
      showAlert,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    );

    ApiResponse(showAlert, data, language);

    if (ok && !data.error) {
      setApiData(prev => prev.map(item => ({...item, is_read: true})));
    } else {
      return;
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={
          isDarkMode
            ? Colors.darkTheme.backgroundColor
            : Colors.lightTheme.backgroundColor
        }
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
    
       
      <StackHeader
        title={'Notification'}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(2.2),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={{paddingVertical: hp(2)}}
        onBackPress={() => navigation.goBack()}
        rightIcon={
          <Text
            style={{
              color: Colors.lightTheme.primaryColor,
              fontSize: RFPercentage(1.8),
              fontFamily: Fonts.PoppinsSemiBold,
            }}>
            {t('Mark all as read')}
          </Text>
        }
        rightIconPress={() => markAllAsRead()}
      />

      {isLoading && apiData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Loader size={wp(10)} />
        </View>
      ) : (
        <FlatList
          data={apiData || []}
          renderItem={renderItem}
          keyExtractor={(item, index) => `request-${item.id || index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              colors={[Colors.darkTheme.primaryColor]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          style={styles.flatListStyle}
          ListEmptyComponent={
            <EmptyCard
              icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
              heading="Empty!"
              subheading={'No notifications yet'}
              containerStyle={{paddingVertical: hp(5)}}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    backButton: {
      padding: wp(2),
    },
    headerTitle: {
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    placeholder: {
      width: wp(10),
    },
    listContainer: {
      paddingBottom: hp(2),
    },
    notificationItem: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    notificationContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    leftSection: {
      position: 'relative',
      marginRight: wp(3),
    },
    avatarContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(100),
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      fontSize: RFPercentage(2.5),
    },
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: wp(3),
      height: wp(3),
      borderRadius: wp(100),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.readDot
        : Colors.lightTheme.readDot,
    },
    contentSection: {
      flex: 1,
      marginRight: wp(2),
    },
    notificationTitle: {
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      marginBottom: hp(0.5),
    },
    notificationName: {
      fontSize: RFPercentage(1.8),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsMedium,
      marginBottom: hp(0.3),
    },
    notificationLocation: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      marginBottom: hp(0.3),
    },
    notificationTime: {
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    timeSection: {
      alignItems: 'flex-end',
    },
    timeText: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      fontFamily: Fonts.PoppinsRegular,
    },
    hiddenItemContainer: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.ActiveSkyBackColor
        : Colors.lightTheme.ActiveSkyBackColor,
    },
    hiddenItemContent: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingRight: wp(2),
    },
    actionButton: {
      // width: wp(18),
      // height: '80%',
      padding: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(14),
      // marginHorizontal: wp(1),
      borderRadius: 8,
    },
    readButton: {
      // backgroundColor: '#4CAF50',
    },
    deleteButton: {
      // backgroundColor: '#F44336',
    },
    actionButtonText: {
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      // color: '#FFFFFF',
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsMedium,
      marginTop: hp(0.5),
    },
    loadingContainer: {
      padding: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    loadingText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    flatListStyle: {
      flex: 1,
    },
    flatListContent: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
    },
  });

export default NotificationScreen;
