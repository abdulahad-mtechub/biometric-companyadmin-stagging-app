import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RefreshControl} from 'react-native-gesture-handler';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {SwipeListView} from 'react-native-swipe-list-view';
import {useSelector, useDispatch} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {Colors} from '@constants/themeColors';
import {baseUrl, ImgURL} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import NavigateAbleBtmSheet from '@components/BottomSheets/NavigateAbleBtmSheet';
import EmptyCard from '@components/Cards/EmptyCard';
import Loader from '@components/Loaders/loader';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import {
  ApiResponse,
  fetchApis,
  formatChatDate,
  isConnected,
  shouldQueueMessage,
  subscribeNetworkChanges,
} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import {io} from 'socket.io-client';
import {socket} from '@utils/socket';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import logger from '@utils/logger';
import {
  setCachedThreads,
  updateThreadLastMessage,
  incrementThreadUnreadCount,
} from '@redux/Slices/messageSlice';
import {capitalize} from '@utils/Helpers';
import StackHeader from '@components/Header/StackHeader';

const Messages = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {language, token} = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const styles = dynamicStyles(isDarkMode);
  const {t} = useTranslation();

  // Redux state for cached threads
  const {cachedThreads, threadsHasNext, threadsIsStale, threadsCurrentPage} =
    useSelector(store => store.messageSlice);

  const [selectedRole, setSelectedRole] = useState('account_executive');
  const [messages, setMessages] = useState([]); // Local state for UI
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEligibleLoading, setIsEligibleLoading] = useState(false);
  const [isEligibleLoadingMore, setIsEligibleLoadingMore] = useState(false);
  const {showAlert} = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [eligiblehasNext, setEligibleHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [eligiblePage, setEligiblePage] = useState(1);
  const limit = 10;
  const [refreshingEligible, setRefreshingEligible] = useState(false);
  const sheetRef = useRef(null);
  const [eligibleContacts, setEligibleContacts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedMessages, setSearchedMessages] = useState([]);
  const btmSheetRef = useRef(null);
  const [isConnectedState, setIsConnectedState] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const handleImageError = useCallback(itemId => {
    setImageErrors(prev => ({...prev, [itemId]: true}));
  }, []);

  const checkConnectivity = async (showFeedback = true) => {
    try {
      const connected = await isConnected();
      setIsConnectedState(connected);

      return connected;
    } catch (error) {
      logger.error('Connectivity check failed:', error, {context: 'Messages'});
      setIsConnectedState(false);
      return false;
    }
  };
  const togglePin = id => {
    setMessages(prev =>
      prev.map(item =>
        item.id === id ? {...item, pinned: !item.pinned} : item,
      ),
    );
  };

  const deleteMessage = id => {
    setMessages(prev => prev.filter(item => item.id !== id));
  };

  // Helper function to create thread
  const createThread = async receiverId => {
    const payload = {receiverId};
    const createThreadUrl = `${baseUrl}/messages/threads`;

    try {
      const {ok, data} = await fetchApis(
        createThreadUrl,
        'POST',
        null,
        payload,
        showAlert,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok || data?.error) {
        throw new Error(data?.message || 'Failed to create thread');
      }

      return data.data.thread.id;
    } catch (error) {
      logger.error('Error creating thread:', error);
      throw error;
    }
  };

  // Helper function to send message to a user
  const sendMessageToUser = async (threadId, receiverId, messageContent) => {
    const sendMsgUrl = `${baseUrl}/messages/threads/${threadId}/messages`;

    try {
      const {ok, data} = await fetchApis(
        sendMsgUrl,
        'POST',
        null,
        {
          content: messageContent,
          messageType: 'text',
        },
        null,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok || data?.error) {
        throw new Error(data?.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  };

  // Handle bulk message sending
  const handleSendBulkMessage = async (selectedUsers, messageText) => {
    const failedUsers = [];
    let successCount = 0;

    logger.log(
      `Starting bulk message to ${selectedUsers.length} users: ${messageText}`,
    );

    for (const user of selectedUsers) {
      try {
        logger.log(`Processing user: ${user.name} (${user.id})`);

        const threadId = await createThread(user.id);
        logger.log(`Created thread ${threadId} for user ${user.name}`);

        await sendMessageToUser(threadId, user.id, messageText);
        logger.log(`Message sent successfully to ${user.name}`);

        successCount++;
      } catch (error) {
        logger.error(`Failed to send message to ${user.name}:`, error);
        failedUsers.push(user);
      }
    }

    if (failedUsers.length === 0) {
      showAlert(
        `${t('Message sent successfully to all')} ${successCount} ${t(
          'contacts',
        )}`,
        'success',
      );
    } else {
      const failedNames = failedUsers.map(u => u.name).join(', ');
      showAlert(
        `${t('Message sent successfully to')} ${successCount} ${t(
          'contacts',
        )}, ${t('except:')} ${failedNames}`,
        'warning',
      );
    }
    FetchThreads(true);

    return {success: failedUsers.length === 0, failedUsers};
  };

  const renderItem = data => {
    const item = data.item;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.navigate(SCREENS.CONVERSATION, {
            id: item?.id,
            name: item?.other_user_name,
            avatar: item?.other_user_avatar,
            other_user_id: item?.other_user_id,
          });
        }}
        style={[styles.messageCard]}>
        <View style={styles.messageLeft}>
          <Image
            source={
              item?.other_user_avatar && !imageErrors[item?.id]
                ? {uri: item?.other_user_avatar}
                : Images.placeholderImg
            }
            style={styles.avatar}
            onError={() => handleImageError(item?.id)}
          />
          <View style={[styles.messageContent, styles.UnPinnedMessage]}>
            <View style={styles.rowView}>
              <Text style={styles.messageName}>{item?.other_user_name}</Text>
              <Text style={styles.messageRole}>
                {item.other_user_role === 'account_executive'
                  ? t('Account Executive')
                  : item.other_user_role === 'company_admin'
                  ? t('Company Admin')
                  : t(capitalize(item.other_user_role))}
              </Text>
            </View>
            <Text
              style={styles.messageText}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {item.last_message_type === 'image'
                ? '🏞️ Image'
                : item.last_message_type === 'system'
                ? '📄 Document'
                : item.last_message_type === 'audio'
                ? 'Voice Message'
                : item?.last_message_content}
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.timeText}>
            {formatChatDate(item?.last_message_at)}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unread_count > 99 ? '99+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchItem = data => {
    const item = data.item;
    logger.log('item: ', item, {context: 'Messages'});

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          // navigation.navigate(SCREENS.CONVERSATION, {
          //   id: item?.thread_id,
          //   name: item?.other_user_name || 'Dummy Name',
          //   avatar: item?.other_user_avatar,
          // });
        }}
        style={[styles.messageCard]}>
        <View style={styles.messageLeft}>
          <Image source={Images.placeholderImg} style={styles.avatar} />
          <View
            style={[
              styles.messageContent,
              !item.pinned && styles.UnPinnedMessage,
            ]}>
            <Text style={styles.messageName}>
              {item?.other_user_name || item?.sender_name || 'Dummy Name'}
            </Text>
            <Text
              style={styles.messageText}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {item?.content}
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.timeText}>
            {formatChatDate(item?.created_at)}
          </Text>

          {item.pinned && <Svgs.PinnedL height={hp(2)} width={hp(2)} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = data => {
    const item = data.item;
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backLeftBtn, {backgroundColor: '#EEFFF1'}]}
          onPress={() => togglePin(item.id)}>
          {item.pinned ? (
            <Svgs.unPin height={hp(4)} width={hp(4)} />
          ) : (
            <Svgs.pin height={hp(4)} width={hp(4)} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backRightBtn, {backgroundColor: '#FFEFEE'}]}
          onPress={() => deleteMessage(item.id)}>
          <Svgs.Delete height={hp(4)} width={hp(4)} />
        </TouchableOpacity>
      </View>
    );
  };

  const getThreadsUrl = pageNumber => {
    let url = `${baseUrl}/messages/threads?page=${pageNumber}&limit=${limit}`;

    return url;
  };
  const getEligibleUrl = useCallback(
    pageNumber => {
      let url = `${baseUrl}/messages/eligible-users?noPagination=true&role=${selectedRole}`;
      return url;
    },
    [selectedRole, baseUrl],
  );

  const FetchThreads = async (reset = false) => {
    if (isLoading || (!reset && !hasNext)) return;

    const connected = await checkConnectivity();
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const {ok, data} = await fetchApis(
        getThreadsUrl(reset ? 1 : page),
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);

        // If offline, use cached data

        if (!connected) {
          if (reset && cachedThreads.length > 0) {
            setMessages(cachedThreads);
            setHasNext(threadsHasNext);
            setPage(threadsCurrentPage);

            // Calculate total unread count from cached threads
            const cachedTotalUnread = cachedThreads.reduce((sum, thread) => {
              return sum + (thread.unread_count || 0);
            }, 0);
            setTotalUnreadCount(cachedTotalUnread);
          }
        }
        return;
      }

      const fetched = data.data.threads || [];
      const currentPage = reset ? 1 : page;
      const totalPages = data?.data?.pagination?.totalPages;
      const hasNextPage = currentPage < totalPages;
      // Calculate total unread count from threads
      const totalUnread = fetched.reduce((sum, thread) => {
        return sum + (thread.unread_count || 0);
      }, 0);
      setTotalUnreadCount(totalUnread);

      // Save to Redux cache
      dispatch(
        setCachedThreads({
          threads: fetched,
          page: currentPage,
          hasNext: hasNextPage,
        }),
      );

      // Update local state for UI
      setMessages(reset ? fetched : [...messages, ...fetched]);

      setHasNext(hasNextPage);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.log('FetchThreads error:', error, {context: 'Messages'});

      if (!shouldQueueMessage() && reset && cachedThreads.length > 0) {
        setMessages(cachedThreads);
        setHasNext(threadsHasNext);
        setPage(threadsCurrentPage);
      }
    } finally {
      setIsLoadingMore(false);
      setIsLoading(false);
    }
  };

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

  const FetchEligibleContacts = useCallback(
    async (reset = false) => {
      if (isEligibleLoading || (!reset && !eligiblehasNext)) return;

      if (reset) {
        setIsEligibleLoading(true);
      } else {
        setIsEligibleLoadingMore(true);
      }

      try {
        const url = getEligibleUrl(reset ? 1 : eligiblePage);
        const {ok, data} = await fetchApis(url, 'GET', null, null, showAlert, {
          Authorization: `Bearer ${token}`,
        });

        if (!ok || data?.error) {
          ApiResponse(showAlert, data, language);
          return;
        }

        const fetched = data?.data?.users || [];
        setEligibleContacts(
          reset ? fetched : [...eligibleContacts, ...fetched],
        );

        setEligibleHasNext(data?.data?.pagination?.has_next);

        setEligiblePage(reset ? 2 : eligiblePage + 1);
      } catch (error) {
        logger.error('FetchEligibleContacts error:', error, {
          context: 'Messages',
        });
      } finally {
        setIsEligibleLoadingMore(false);
        setIsEligibleLoading(false);
      }
    },
    [
      isEligibleLoading,
      eligiblehasNext,
      getEligibleUrl,
      eligiblePage,
      showAlert,
      token,
      language,
      selectedRole,
    ],
  );

  // Search API function
  const searchMessages = async (reset = false) => {
    if (!searchText) return;
    // setIsLoading(true);
    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/messages/search?search=${encodeURIComponent(
          searchText,
        )}&page=1&limit=10`,
        'GET',
        null,
        null,
        showAlert,
        {
          Authorization: `Bearer ${token}`,
        },
      );
      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }
      // Log the search results

      setSearchedMessages(data?.data?.messages || []);
    } catch (error) {
      logger.log(error, {context: 'Messages'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchMessages(true);
  };

  useEffect(() => {
    searchMessages(true);
  }, [searchText]);

  const handleReset = () => {
    setSearchText('');
    setShowSearch(false);
    // FetchThreads(true);
    setSearchedMessages([]);
  };

  useEffect(() => {
    // Reset page when role changes
    setEligiblePage(1);
    setEligibleHasNext(false);
    // FetchThreads(true);
    FetchEligibleContacts(true);
  }, [selectedRole]);

  useFocusEffect(
    useCallback(() => {
      FetchThreads(true);
    }, []),
  );

  // Auto-refresh when network is restored
  useEffect(() => {
    const unsubscribe = subscribeNetworkChanges(isConnected => {
      if (isConnected && (threadsIsStale || cachedThreads.length === 0)) {
        FetchThreads(true);
      }
    });
    return unsubscribe;
  }, [threadsIsStale, cachedThreads.length]);

  // Socket listeners for real-time thread updates
  useEffect(() => {
    if (!token) return;

    // Connect and authenticate socket
    socket.connect();
    socket.emit('super_admin_chat_authenticate', {token});

    // Listen for new messages
    socket.on('new_message', data => {
      if (data?.thread && data?.message) {
        // Update cached thread with new message
        dispatch(
          updateThreadLastMessage({
            threadId: data.thread.id,
            lastMessage: data.message.content,
            lastMessageType: data.message.type,
            lastMessageAt: data.message.created_at,
            unreadCount: data.thread.unread_count || 0,
          }),
        );

        // Update local messages state
        setMessages(prev => {
          const updatedMessages = prev.map(thread =>
            thread.id === data.thread.id
              ? {
                  ...thread,
                  last_message_content: data.message.content,
                  last_message_type: data.message.type,
                  last_message_at: data.message.created_at,
                  unread_count: data.thread.unread_count || 0,
                }
              : thread,
          );

          // Recalculate total unread count
          const totalUnread = updatedMessages.reduce((sum, thread) => {
            return sum + (thread.unread_count || 0);
          }, 0);
          setTotalUnreadCount(totalUnread);

          return updatedMessages;
        });
      }
    });

    // Listen for unread count updates
    socket.on('unread_count_update', data => {
      if (data?.threadId && typeof data?.unreadCount === 'number') {
        dispatch(incrementThreadUnreadCount({threadId: data.threadId}));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('new_message');
      socket.off('unread_count_update');
      socket.disconnect();
    };
  }, [token, dispatch]);

  const loadMoreData = () => {
    FetchThreads(false);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await FetchThreads(true);
    setRefreshing(false);
  };
  const loadMoreEligibleData = () => {
    FetchEligibleContacts(false);
  };
  const onRefreshEligible = async () => {
    setRefreshingEligible(true);
    await FetchEligibleContacts(true);
    setRefreshingEligible(false);
  };

  return (
    <View style={styles.container}>
      {renderOfflineBanner()}
      <View style={styles.headerView}>
       <StackHeader
            title="Messages"
            headerTxtStyle={styles.headerTxtStyle}
            headerStyle={styles.headerStyle}
            
          />
        {showSearch && (
          <Animated.View style={{marginHorizontal: wp(5), marginBottom: hp(2)}}>
            <TxtInput
              placeholder={t('Search')}
              onChangeText={setSearchText}
              value={searchText}
              containerStyle={{
                backgroundColor: isDarkMode
                  ? Colors.darkTheme.secondryColor
                  : 'transparent',
                height: hp(6),
              }}
              rightSvg={
                isDarkMode ? (
                  <Svgs.crossWhite height={hp(8)} width={wp(8)} />
                ) : (
                  <Svgs.Cross height={hp(3.5)} width={wp(3.5)} />
                )
              }
              rightIconPress={() => handleReset()}
              onSubmitEditing={handleSearch}
            />
          </Animated.View>
        )}
      </View>
      {isLoading ? (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Loader size={wp(20)} />
        </View>
      ) : (
        <View>
          <View
            style={[
              styles.listWrapper,
              {
                backgroundColor: isDarkMode
                  ? Colors.darkTheme.backgroundColor
                  : Colors.lightTheme.secondryColor,
              },
            ]}></View>

          <View style={styles.listWrapper}>
            <SwipeListView
            showsVerticalScrollIndicator={false}
              data={
                searchedMessages.length > 0 && showSearch
                  ? searchedMessages
                  : messages
              }
              renderItem={
                searchedMessages.length > 0 && showSearch
                  ? renderSearchItem
                  : renderItem
              }
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-wp(20)}
              leftOpenValue={wp(20)}
              keyExtractor={item => item.id + '_all'}
              ListFooterComponent={() =>
                isLoadingMore ? <Loader size={wp(10)} /> : null
              }
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                // <View
                //   style={{
                //     flex: 1,
                //     alignItems: 'center',
                //     justifyContent: 'center',
                //   }}>
                <EmptyCard
                  icon={<Svgs.emptyMessages />}
                  heading={'Empty!'}
                  subheading={'No Messages Yet!'}
                  containerStyle={{marginTop: hp(2)}}
                />
                // </View>
              }
              refreshControl={
                <RefreshControl
                  colors={[Colors.darkTheme.primaryColor]}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              refreshing={refreshing}
              contentContainerStyle={styles.listContainer}
              // disableRightSwipe
            />
          </View>
        </View>
      )}

      <NavigateAbleBtmSheet
        refRBSheet={sheetRef}
        data={eligibleContacts}
        isLoading={isEligibleLoading}
        sheetTitle="Start New Chat"
        enableMultipleSelect={selectedRole === 'worker'}
        onSendBulkMessage={
          selectedRole === 'worker' ? handleSendBulkMessage : undefined
        }
        bulkMessagePlaceholder="Type your message to multiple workers..."
        onItemPress={item => {
          sheetRef.current?.close();

          navigation.navigate(SCREENS.CONVERSATION, {
            id: item?.thread_id,
            name: item?.name,
            avatar: item?.profile_image,
            other_user_id: item?.id,
          });
        }}
      />

      {isConnectedState && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            btmSheetRef.current?.open();
          }}>
          <Svgs.whitePlus />
        </TouchableOpacity>
      )}

      <ReusableBottomSheet
        height={hp('40%')}
        refRBSheet={btmSheetRef}
        sheetTitle={'Select User Type'}
        options={[
          {
            title: 'Super Admin',
            description: 'Select a Super Admin to chat with',
            onPress: () => {
              setSelectedRole('super_admin');
              btmSheetRef.current?.close();
              if (Platform.OS === 'ios') {
                // iOS-specific logic
                setTimeout(() => {
                  sheetRef.current?.open();
                }, 500); // Delay to ensure smooth transition
                return;
              } else {
                sheetRef.current?.open();
              }
              console.log('iOS platform detected');
            },
          },
          {
            title: 'Account Executive',
            description: 'Select an Account Executive to chat with',

            onPress: () => {
              setSelectedRole('account_executive');

              btmSheetRef.current?.close();
              if (Platform.OS === 'ios') {
                // iOS-specific logic
                setTimeout(() => {
                  sheetRef.current?.open();
                }, 500); // Delay to ensure smooth transition
                return;
              } else {
                sheetRef.current?.open();
              }
            },
          },
          {
            title: 'Employee',
            description: 'Select an employee to chat with',
            onPress: () => {
              setSelectedRole('worker');
              btmSheetRef.current?.close();
              if (Platform.OS === 'ios') {
                // iOS-specific logic
                setTimeout(() => {
                  sheetRef.current?.open();
                }, 500); // Delay to ensure smooth transition
                return;
              } else {
                sheetRef.current?.open();
              }
            },
          },
        ]}
      />
    </View>
  );
};

export default Messages;

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
       headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    headerView: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      justifyContent: 'space-between',
      marginBottom: hp(3),
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    messageRole: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(13)),
      color: isDarkMode
        ? Colors.lightTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(2),
      borderRadius: wp(1),
      marginLeft: wp(2),
    },
    screenHeading: {
      paddingTop: hp(1.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(20)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(5),
    },
    listContainer: {
      paddingBottom: hp(20),
    },
    floatingButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(10),
      height: wp(10),
      borderRadius: wp(100),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
    },
    messageCard: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingVertical: wp(3),
      paddingHorizontal: wp(4),
      // marginHorizontal: wp(4),
      marginVertical: hp(0.5),
      borderRadius: wp(3),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderBottomWidth: 1,
    },
    messageLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      marginRight: wp(3),
    },
    messageContent: {
      flex: 1,
    },
    messageName: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    messageText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      width: wp(55),
      // marinTop: hp(0.5),
    },
    rightContainer: {
      alignItems: 'flex-end',
      marginTop: hp(1.5),
    },
    timeText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(12)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    unreadBadge: {
      backgroundColor: Colors.darkTheme.primaryColor,
      minWidth: wp(6),
      height: wp(6),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(0.5),
    },
    unreadText: {
      color: '#fff',
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsMedium,
    },
    rowBack: {
      alignItems: 'center',
      // backgroundColor: '#DDD',
      // flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      // paddingHorizontal: wp(5),
      marginHorizontal: wp(5.5),
      borderRadius: wp(3),
      marginVertical: hp(0.5),
    },
    backLeftBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(20),
      height: '100%',
      borderTopLeftRadius: wp(3),
      borderBottomLeftRadius: wp(3),
      paddingVertical: wp(4),
    },
    backRightBtn: {
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(20),
      height: '100%',
      borderTopRightRadius: wp(3),
      borderBottomRightRadius: wp(3),
      paddingVertical: wp(4),
    },

    listWrapper: {
      // flex: 1,
      marginBottom: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      borderRadius: wp(2),
    },
    pinnedHeader: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
      paddingHorizontal: wp(5),
      marginTop: hp(2),
      marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.QuaternaryText
        : Colors.lightTheme.QuaternaryText,
    },
    UnPinnedMessage: {
      paddingBottom: hp(1),
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
