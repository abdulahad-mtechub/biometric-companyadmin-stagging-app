import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  Modal,
  Linking,
  PermissionsAndroid,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Colors} from '@constants/themeColors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {Svgs} from '@assets/Svgs/Svgs';
import {useTranslation} from 'react-i18next';
import {Images} from '@assets/Images/Images';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TxtInput from '@components/TextInput/Txtinput';
import CameraBottomSheet from '@components/BottomSheets/CameraBottomSheet';
import {SCREENS} from '@constants/Screens';
import {baseUrl, ImgURL} from '@constants/urls';
import {
  ApiResponse,
  fetchApis,
  fetchFormDataApi,
  truncateText,
} from '@utils/Helpers';
import {useAlert} from '@providers/AlertContext';
import moment from 'moment';
import Loader from '@components/Loaders/loader';
import {io} from 'socket.io-client';
import {viewDocument} from '@react-native-documents/viewer';
import {
  addCountObject,
  removeThreadById,
  addPendingMessage,
  removePendingMessage,
  clearPendingMessages,
  setNetworkStatus,
  syncPendingMessage,
} from '@redux/Slices/messageSlice';
import {shouldQueueMessage, subscribeNetworkChanges} from '@utils/Helpers';
import ImagePreviewModal from '@components/CustomModal/ImagePreviewModal';
import Sound from 'react-native-nitro-sound';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import logger from '@utils/logger';

const {width} = Dimensions.get('window');

const Conversation = ({navigation, route}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode);
  const {t} = useTranslation();
  const [chat, setChat] = useState('');
  const CameraBottomSheetRef = useRef(null);
  const {id, name, avatar, other_user_id} = route.params;
  const [thread_id, setThreadId] = useState(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {showAlert} = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;
  const {token, User, language} = useSelector(store => store.auth);
  const {pendingMessages} = useSelector(store => store.messageSlice);
  const [image, setImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [sendMsgLoading, setSendMsgLoading] = useState(false);
  const sendMsgUrl = `${baseUrl}/messages/threads/${thread_id}/messages`;
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const createThreadUrl = `${baseUrl}/messages/threads`;
  const markAllAsReadUrl = `${baseUrl}/super-admin-chat/threads/${thread_id}/read-all`;
  const [chatData, setChatData] = useState([]);
  const socketRef = useRef();
  const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState('');
  const [otherUserLastSeen, setotherUserLastSeen] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [isDocumentPreviewVisible, setisDocumentPreviewVisible] =
    useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const [audioDuration, setAudioDuration] = useState({});
  const recordingIntervalRef = useRef(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [recordingStates, setRecordingStates] = useState({
    isRecording: false,
    isPlaying: false,
    isPaused: false,
    duration: 0,
    recordSecs: 0,
    recordingUI: false,
  });
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(true);
  const [syncingMessages, setSyncingMessages] = useState(false);
  const flatListRef = useRef(null);
  const scrollToBottom = () => {
    if (flatListRef.current) {
      console.log('scrollToBottom');
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  // Sync pending messages when back online
  const syncPendingMessages = async () => {
    const threadPending = pendingMessages[thread_id] || [];

    if (threadPending.length === 0 || syncingMessages) return;

    logger.log(
      `Syncing ${threadPending.length} pending messages for thread ${thread_id}`,
      {context: 'Conversation'},
    );
    setSyncingMessages(true);

    for (const pendingMsg of threadPending) {
      try {
        // Update message status to syncing
        setChatData(prev =>
          prev.map(msg =>
            msg.id === pendingMsg.id
              ? {...msg, isPending: true, syncing: true}
              : msg,
          ),
        );

        let fileUrl = pendingMsg.file_url;
        if (pendingMsg.message_type === 'image' && pendingMsg.localImagePath) {
          fileUrl = await uploadFileToServer(
            {path: pendingMsg.localImagePath},
            'image',
          );
        } else if (
          pendingMsg.message_type === 'audio' &&
          pendingMsg.localAudioPath
        ) {
          fileUrl = await uploadFileToServer(
            pendingMsg.localAudioPath,
            'audio',
          );
        } else if (
          pendingMsg.message_type === 'system' &&
          pendingMsg.localDocumentPath
        ) {
          fileUrl = await uploadFileToServer(
            pendingMsg.localDocumentPath,
            'document',
          );
        }

        // Always try socket first (as requested by user)
        if (socketRef.current?.connected) {
          logger.log('Sending pending message via socket', {
            context: 'Conversation',
          });
          socketRef.current.emit('send_message', {
            threadId: thread_id,
            content: pendingMsg.content,
            messageType: pendingMsg.message_type,
            tempId: pendingMsg.id,
            fileUrl: fileUrl,
            receiverId: other_user_id,
          });

          setChatData(prev => prev.filter(msg => msg.id !== pendingMsg.id));
        } else {
          // Fallback to API if socket not available
          const apiPayload = {
            content: pendingMsg.content,
            messageType: pendingMsg.message_type,
          };

          if (fileUrl) {
            apiPayload.file_url = fileUrl;
          }

          const {ok, data: response} = await fetchApis(
            sendMsgUrl,
            'POST',
            null,
            apiPayload,
            null,
            {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          );

          if (ok && !response?.error) {
            logger.log('Message synced successfully via API: ', response, {
              context: 'Conversation',
            });

            // Update message to synced status
            setChatData(prev =>
              prev.map(msg =>
                msg.id === pendingMsg.id
                  ? {
                      ...msg,
                      id: response.data.id,
                      synced: true,
                      isPending: false,
                      syncing: false,
                    }
                  : msg,
              ),
            );
          } else {
            throw new Error(response?.message || 'Failed to sync message');
          }
        }

        // Remove from pending after successful sync
        dispatch(
          removePendingMessage({threadId: thread_id, messageId: pendingMsg.id}),
        );
      } catch (error) {
        logger.error('Failed to sync message:', error, {
          context: 'Conversation',
        });

        // Update message to error status
        setChatData(prev =>
          prev.map(msg =>
            msg.id === pendingMsg.id
              ? {...msg, syncError: true, syncing: false}
              : msg,
          ),
        );
        // Keep the message in pending queue for retry
      } finally {
        logger.log(threadPending.length);
      }
    }

    FetchThreadMsgs(true, true, {context: 'Conversation'});

    setSyncingMessages(false);
  };

  const getThreadMsgUrl = pageNumber => {
    let url = `${baseUrl}/messages/threads/${thread_id}/messages?page=${pageNumber}&limit=${limit}`;
    console.log(url);
    return url;
  };

  function getUserStatus(status, lastSeen) {
    if (status === 'online') {
      return 'Online';
    }

    if (lastSeen) {
      const localTime = moment(lastSeen).local();
      const now = moment();

      if (localTime.isSame(now, 'day')) {
        return `last seen today at ${localTime.format('h:mm A')}`;
      } else if (localTime.isSame(moment().subtract(1, 'day'), 'day')) {
        return `last seen yesterday at ${localTime.format('h:mm A')}`;
      } else {
        return `last seen on ${localTime.format(
          'D MMM YYYY',
        )} at ${localTime.format('h:mm A')}`;
      }
    }

    return 'Offline';
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    const newSocket = io(ImgURL, {
      auth: {
        token: token, // ✅ THIS IS THE KEY FIX!
      },
      transports: ['websocket', 'polling'], // Add polling as fallback
      autoConnect: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    [
      'new_message',
      'receive_message',
      'message_sent',
      'image_sent',
      'new_image_message',
    ].forEach(evt => {
      newSocket.on(evt, data => handleMessageEvent(data, evt));
    });

    newSocket.on('message_delivery_status', data => {
      logger.log('message_delivery_status:', data, {context: 'Conversation'});
      setChatData(prevChatData => {
        return prevChatData.map(chat => {
          if (chat.id === data.messageId) {
            return {
              ...chat,
              delivery_status: data.status,
            };
          }
          return chat;
        });
      });
    });

    newSocket.on('user_status_change', data => {
      console.log('User Status Changed:', data, {context: 'Conversation'});
      if (data.userId === other_user_id) {
        logger.log(data.status, 'status', {context: 'Conversation'});
        setOtherUserOnlineStatus(data.status);
      }
    });

    // newSocket.on('messages_read', data => {
    //   // TODO: Update message read status in UI
    // });

    newSocket.on('message_read_receipt', data => {
      logger.log('message_read_receipt:', data, {context: 'Conversation'});
      // TODO: Update specific message read status
    });

    newSocket.on('unread_count_updated', data => {
      logger.log('unread_count_updated:', data, {context: 'Conversation'});
      // TODO: Update unread count badge
    });

    // ✅ 3. Connection event - only emit authenticate
    newSocket.on('connect', () => {
      logger.log('✅ Socket connected, authenticating...', {
        context: 'Conversation',
      });
      newSocket.emit('authenticate', {token: token});
      syncPendingMessages();
    });

    newSocket.on('authenticated', data => {
      logger.log('✅ Socket authenticated:', data, {context: 'Conversation'});

      newSocket.emit('mark_read', {
        threadId: thread_id,
      });

      // ✅ Fixed: Send just userId, not object
      newSocket.emit('join_user_room', other_user_id);

      newSocket.emit('update_online_status', {
        isOnline: true,
      });
    });

    // ✅ 5. Error handlers
    newSocket.on('connect_error', error => {
      // TODO: Show user-friendly error message
    });

    newSocket.on('disconnect', reason => {
      logger.log('❌ Socket disconnected:', reason, {context: 'Conversation'});
      // TODO: Update UI to show offline/connecting state
    });

    newSocket.on('auth_error', error => {
      logger.log('❌ Authentication error:', error, {context: 'Conversation'});
      // TODO: Handle auth failure (maybe redirect to login)
    });

    newSocket.on('message_error', error => {
      logger.error('❌ Message error:', error, {context: 'Conversation'});
      // TODO: Show error to user
    });

    socketRef.current = newSocket;

    // ✅ 6. Cleanup
    return () => {
      logger.log('🧹 Cleaning up socket connection...', {
        context: 'Conversation',
      });

      // Update status before disconnect
      newSocket.emit('update_online_status', {
        isOnline: false,
      });

      // ✅ Remove if backend doesn't support this

      newSocket.disconnect();
    };
  }, [token, thread_id, other_user_id]); // ✅ Add dependencies

  // Network monitoring
  useEffect(() => {
    const unsubscribe = subscribeNetworkChanges(isConnected => {
      logger.log('Network status changed:', isConnected, {
        context: 'Conversation',
      });
      setIsOnline(isConnected);
      dispatch(setNetworkStatus(isConnected));

      if (isConnected) {
        logger.log('Back online - syncing pending messages...', {
          context: 'Conversation',
        });
        // FetchThreadMsgs(true, true);
      }
    });

    // Check initial network status
    (async () => {
      const connected = await shouldQueueMessage();
      setIsOnline(!connected);
      dispatch(setNetworkStatus(!connected));
    })();

    return unsubscribe;
  }, [dispatch]);

  // Load pending messages on mount
  useEffect(() => {
    const threadPending = pendingMessages[thread_id] || [];
    if (threadPending.length > 0) {
      logger.log(
        `Found ${threadPending.length} pending messages for thread ${thread_id}`,
        {context: 'Conversation'},
      );
      setChatData(prev => {
        const merged = [...prev, ...threadPending];
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex(t => t.id === item.id),
        );

        return unique;
      });
    }
  }, [thread_id, pendingMessages]);

  const handleMessageEvent = (data, evt) => {
    if (
      evt === 'receive_message' &&
      data.message.sender_id === User?.user?.id
    ) {
      return;
    }
    logger.log(
      `Message event triggered: ${evt} Data:`,
      JSON.stringify(data, null, 2),
      {context: 'Conversation'},
    );
    const chat = data?.message;
    if (!chat) {
      logger.warn('⚠️ No message in event data', {context: 'Conversation'});
      return;
    }

    const newMessage = {
      id: chat?.id,
      thread_id: thread_id,
      sender_id: chat?.sender_id,
      message_type: chat?.message_type,
      content: chat?.content,
      file_url: chat?.file_url,
      file_name: chat?.file_name,
      file_size: chat?.file_size,
      mime_type: chat?.mime_type,
      is_edited: chat?.is_edited,
      edited_at: chat?.edited_at,
      is_deleted: chat?.is_deleted,
      deleted_at: chat?.deleted_at,
      created_at: chat?.created_at,
      updated_at: chat?.created_at,
      sender_name: chat?.sender?.name,
      sender_avatar: null,
      read_by_user: null,
      delivery_status: chat?.delivery_status,
      read_at: chat?.read_at,
    };
    // ✅ Mark message as read if chat is open
    if (data.threadId === thread_id && socketRef?.current && newMessage.sender_id !== User?.user?.id) {
      socketRef.current.emit('mark_message_read', {
        messageId: newMessage.id,
        threadId: thread_id,
      });
    }

    scrollToBottom();
    setChatData(prev => [...prev, newMessage]);
  };

  const FetchThreadMsgs = async (reset = false, notLoading = false) => {
    if (isLoading || (!reset && !hasNext)) return;

    if (!notLoading) {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
    }

    try {
      const {ok, data} = await fetchApis(
        getThreadMsgUrl(reset ? 1 : page),
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

      if (reset) {
      scrollToBottom();

      }
      const fetched = data.data.messages || [];

      setChatData(reset ? fetched : [...fetched, ...chatData]);
     if (reset) {
  // Scroll to bottom
  flatListRef.current?.scrollToEnd({
    animated: true,
  });
} else {
  // Scroll to top
  flatListRef.current?.scrollToOffset({
    offset: 0,
    animated: true,
  });
}
      setHasNext(page < data?.data?.pagination?.total_pages);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.log(error, {context: 'Conversation'});
    } finally {
      setIsLoadingMore(false);
      setIsLoading(false);
    }
  };

  const CreateThread = async () => {
    if (isLoading) return;
    console.log('Create Thread')

    const payload = {
      receiverId: other_user_id,
    };

    try {
      const {ok, data} = await fetchApis(
        createThreadUrl,
        'POST',
        setIsLoading,
        payload,
        showAlert,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      );

      console.log(data);
      if (!ok || data?.error) {
        ApiResponse(showAlert, data, language);
        return;
      }

      const result = data.data.thread.id;
      setThreadId(result);
    } catch (error) {
      logger.log(error, {context: 'Conversation'});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (thread_id) {
      FetchThreadMsgs(true);
    } else {
      CreateThread();
    }
  }, [thread_id]);

  const getDateSectionHeader = date => {
    const messageDate = moment(date);
    const today = moment();
    const yesterday = moment().subtract(1, 'day');

    if (messageDate.isSame(today, 'day')) {
      return t('Today');
    } else if (messageDate.isSame(yesterday, 'day')) {
      return t('Yesterday');
    } else {
      return messageDate.format('DD MMM YYYY');
    }
  };
  const sortMessagesByDate = messages => {
    return messages.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateA - dateB;
    });
  };

const groupMessagesByDate = messages => {
  const grouped = {};

  messages.forEach(message => {
    const dateKey = moment(message.created_at).format('YYYY-MM-DD');
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  const sortedGroups = Object.keys(grouped)
    .sort((a, b) => moment(a).diff(moment(b))) // Changed from moment(b).diff(moment(a))
    .map(date => ({
      date,
      title: getDateSectionHeader(date),
      data: grouped[date],
    }));

  return sortedGroups;
};

  const createFlatListData = () => {
    const sortedMessages = sortMessagesByDate([...chatData]);
    const groupedMessages = groupMessagesByDate(sortedMessages);
    const flatData = [];

    groupedMessages.forEach(group => {
      flatData.push({
        id: `header-${group.date}`,
        type: 'header',
        title: group.title,
        date: group.date,
      });
      const sortedGroupMessages = sortMessagesByDate(group.data);
      sortedGroupMessages.forEach(message => {
        flatData.push({
          ...message,
          type: 'message',
        });
      });
    });

    return flatData;
  };


  const handleSendMessage = async () => {
    if (chat.trim()) {
      const tempId = Date.now().toString();
      const messageContent = chat.trim();
      setChat(''); // Clear input immediately

      const tempMessage = {
        id: tempId,
        thread_id: thread_id,
        sender_id: User?.user?.id,
        message_type: 'text',
        content: messageContent,
        file_url: null,
        created_at: new Date().toISOString(),
        synced: false,
        isPending: true,
      };

      // Add to UI immediately
      // setChatData(prev => [...prev, tempMessage]);
      scrollToBottom();

      try {
        // Check if should queue message (offline mode)
        const shouldQueue = await shouldQueueMessage();

        if (shouldQueue) {
          // Queue message for later sync
          logger.log('Offline - Queueing message', {context: 'Conversation'});
          dispatch(
            addPendingMessage({threadId: thread_id, message: tempMessage}),
          );
          showAlert(
            'Message saved offline. Will be sent when connection is restored.',
            'success',
          );
          return;
        }

        // Online - send immediately
        if (socketRef.current?.connected) {
          socketRef.current.emit('send_message', {
            threadId: thread_id,
            content: messageContent,
            messageType: 'text',
            tempId,
            receiverId: other_user_id,
          });

          logger.log('Message sent via socket', {context: 'Conversation'});
        } else {
          logger.log('API call - send message', {context: 'Conversation'});
          const apiPayload = {
            content: messageContent,
            messageType: 'text',
          };
          const {ok, data} = await fetchApis(
            sendMsgUrl,
            'POST',
            null,
            apiPayload,
            null,
            {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          );

          if (ok && !data?.error) {
            logger.log('Message sent via API', {context: 'Conversation'});
            // Sync temp message with real message ID
            setChatData(prev =>
              prev.map(msg =>
                msg.id === tempId
                  ? {...msg, id: data.data.id, synced: true, isPending: false}
                  : msg,
              ),
            );
          } else {
            throw new Error(data?.message || 'Failed to send message');
          }
        }
      } catch (error) {
        logger.error('Failed to send message:', error, {
          context: 'Conversation',
        });
        // Move message to pending queue
        dispatch(
          addPendingMessage({threadId: thread_id, message: tempMessage}),
        );
        showAlert('Connection lost. Message saved offline.', 'info');
      }
    }
  };

  const uploadFileToServer = useCallback(
    async (file, type = 'image') => {
      if (!file) return null;

      setSendMsgLoading(true);

      const formData = new FormData();
      let fieldName = 'image';
      let mimeType = 'image/jpeg';
      let fileName = `upload-${Date.now()}.jpg`;
      let endpoint = `${baseUrl}/upload/image`;
      let path = file.uri || file.path;

      // 🧩 Handle file types
      if (type === 'document') {
        fieldName = 'pdf';
        mimeType = 'application/pdf';
        fileName = file.name || `upload-${Date.now()}.pdf`;
        endpoint = `${baseUrl}/upload/pdf`;
      } else if (type === 'audio') {
        fieldName = 'audio';
        mimeType = 'audio/webm';
        fileName = `audio-${Date.now()}.webm`;
        endpoint = `${baseUrl}/upload/audio`;
        path = file;
      }

      // 🏗️ Append form data
      formData.append(fieldName, {
        uri: path,
        type: mimeType,
        name: fileName,
      });

      logger.log(
        {
          uri: path,
          type: mimeType,
          name: fileName,
        },
        {context: 'Conversation'},
      );

      try {
        const {ok, data} = await fetchFormDataApi(
          endpoint,
          'POST',
          null,
          formData,
          null,
          {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        );
        if (!ok) {
          throw new Error(data?.message || `${type} upload failed`);
        }

        logger.log(`✅ ${type.toUpperCase()} uploaded:`, data?.data?.url, {
          context: 'Conversation',
        });
        return data?.data?.url; // Return uploaded file URL
      } catch (error) {
        logger.error(`${type} upload failed:`, error, {
          context: 'Conversation',
        });
        return null;
      } finally {
        setSendMsgLoading(false);
      }
    },
    [baseUrl, token],
  );

  const handleSendImageMessage = async type => {
    const tempId = Date.now().toString();
    const messageContent =
      type === 'document' ? chat.trim() || document?.name : chat.trim();
    const fileToUpload = type === 'image' ? image : document;

    // Create temp message for immediate UI update
    const tempMessage = {
      id: tempId,
      thread_id: thread_id,
      sender_id: User?.user?.id,
      message_type: type === 'image' ? 'image' : 'system',
      content: messageContent,
      file_url: null,
      localImagePath: type === 'image' ? fileToUpload?.path : null,
      localDocumentPath: type === 'document' ? fileToUpload : null,
      created_at: new Date().toISOString(),
      synced: false,
      isPending: true,
    };

    // Add to UI immediately
    // setChatData(prev => [...prev, tempMessage]);
    setIsPreviewVisible(false);
    setChat('');

    try {
      // Check if should queue message (offline mode)
      const shouldQueue = await shouldQueueMessage();

      if (shouldQueue) {
        // Queue message for later sync
        logger.log('Offline - Queueing image/document message', {
          context: 'Conversation',
        });
        dispatch(
          addPendingMessage({threadId: thread_id, message: tempMessage}),
        );
        showAlert(
          'File saved offline. Will be sent when connection is restored.',
          'success',
        );
        setImage(null);
        setDocument(null);
        setSendMsgLoading(false);
        return;
      }

      // Online - upload and send
      const uploadedUrl = await uploadFileToServer(fileToUpload, type);

      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          threadId: thread_id,
          receiverId: other_user_id,
          content: messageContent,
          messageType: type === 'image' ? 'image' : 'system',
          tempId,
          fileUrl: uploadedUrl,
        });

        logger.log('Image/Document sent via socket', {context: 'Conversation'});

        setImage(null);
        setDocument(null);
      } else {
        const formData = new FormData();

        formData.append('fileUrl', {
          uri: uploadedUrl,
          name:
            type === 'image' ? 'image.jpg' : document?.name || 'document.pdf',
          type: type === 'image' ? 'image/jpeg' : 'application/pdf',
        });
        formData.append('content', messageContent);
        formData.append('messageType', type === 'image' ? 'image' : 'system');
        const {ok, data} = await fetchFormDataApi(
          sendMsgUrl,
          'POST',
          null,
          formData,
          null,
          {
            Authorization: `Bearer ${token}`,
          },
        );

        logger.log('send image msg with api,', data, {context: 'Conversation'});

        if (ok && !data.error) {
          // Update temporary message with real data
          // setChatData(prev =>
          //   prev.map(msg =>
          //     msg.id === tempId
          //       : msg,
          //   ),
          // );
          setIsPreviewVisible(false);
          setImage(null);
          setChat('');
        } else {
          showAlert(data.message || 'Failed to Send Msg', 'error');
          setChatData(prev => prev.filter(msg => msg.id !== tempId));
        }
      }
    } catch (error) {}
  };
  // console.log(chatData)

  const handleSendAudioMessage = async audio => {
    const tempId = Date.now().toString();

    // Create temp message for immediate UI update
    const tempMessage = {
      id: tempId,
      thread_id: thread_id,
      sender_id: User?.user?.id,
      message_type: 'audio',
      content: '',
      file_url: null,
      localAudioPath: audio,
      created_at: new Date().toISOString(),
      synced: false,
      isPending: true,
    };

    // Add to UI immediately
    // setChatData(prev => [...prev, tempMessage]);

    try {
      // Check if should queue message (offline mode)
      const shouldQueue = await shouldQueueMessage();

      if (shouldQueue) {
        // Queue message for later sync
        logger.log('Offline - Queueing audio message', {
          context: 'Conversation',
        });
        dispatch(
          addPendingMessage({threadId: thread_id, message: tempMessage}),
        );
        showAlert(
          'Audio saved offline. Will be sent when connection is restored.',
          'success',
        );
        setSendMsgLoading(false);
        return;
      }

      // Online - upload and send
      const uploadedUrl = await uploadFileToServer(audio, 'audio');

      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          threadId: thread_id,
          receiverId: other_user_id,
          content: '',
          messageType: 'audio',
          tempId,
          fileUrl: uploadedUrl,
        });

        logger.log('Audio sent via socket', {context: 'Conversation'});
      } else {
        const formData = new FormData();

        formData.append('fileUrl', {
          uri: uploadedUrl,
          name: `audio-${Date.now()}.webm`,
          type: 'audio/webm',
        });
        formData.append('content', '');
        formData.append('messageType', 'audio');
        const {ok, data} = await fetchFormDataApi(
          sendMsgUrl,
          'POST',
          setSendMsgLoading,
          formData,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
          },
        );

        logger.log('send image msg with api,', data, {context: 'Conversation'});

        if (ok && !data.error) {
          // Update temporary message with real data
          // setChatData(prev =>
          //   prev.map(msg =>
          //     msg.id === tempId
          //       : msg,
          //   ),
          // );
          setIsPreviewVisible(false);
          setImage(null);
          setChat('');
          setSendMsgLoading(false);
        } else {
          showAlert(data.message || 'Failed to Send Msg', 'error');
          setChatData(prev => prev.filter(msg => msg.id !== tempId));
        }
      }
    } catch (error) {
      logger.error('Failed to send audio message:', error, {
        context: 'Conversation',
      });
    }
  };

  const renderDateHeader = item => {
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={styles.dateHeaderBubble}>
          <Text style={styles.dateHeaderText}>{item.title}</Text>
        </View>
      </View>
    );
  };

  const onRefresh = async () => {
    if (isLoading || isLoadingMore || !hasNext) {
      // Set flag to true to prevent multiple rapid calls

      return;
    }

    FetchThreadMsgs(false);
  };

  const onMsgPress = item => {
    logger.log(item, {context: 'Conversation'});
    if (item.message_type === 'image') {
      if (item?.isPending) {
        setIsImagePreviewVisible(true);
        setSelectedImage(item.localImagePath);
        return;
      }
      setIsImagePreviewVisible(true);
      setSelectedImage(item.file_url);
    }
    if (item.message_type === 'system') {
      if (item?.isPending) {
        viewSelectedDocument(item.localDocumentPath.path);
        return;
      }
      setisDocumentPreviewVisible(true);
      setSelectedDocument(item.file_url);
    }
  };

  const playAudio = async (audioUrl, messageId) => {
    try {
      logger.log('🔊 Playing audio:', messageId, 'URL:', audioUrl, {
        context: 'Conversation',
      });

      if (playingAudio === messageId) {
        // Stop if already playing
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        setPlayingAudio(null);
        setAudioProgress(prev => ({...prev, [messageId]: 0}));
        logger.log('⏸️ Audio stopped', {context: 'Conversation'});
      } else {
        // Stop any currently playing audio
        if (playingAudio) {
          await Sound.stopPlayer();
          Sound.removePlayBackListener();
          setAudioProgress(prev => ({...prev, [playingAudio]: 0}));
        }

        setPlayingAudio(messageId);

        Sound.addPlayBackListener(e => {
          const currentPos = e.currentPosition || 0;
          const totalDuration = e.duration || 0;

          // Update duration if not set
          if (totalDuration > 0 && !audioDuration[messageId]) {
            setAudioDuration(prev => ({...prev, [messageId]: totalDuration}));
          }

          // Update progress
          setAudioProgress(prev => ({...prev, [messageId]: currentPos}));

          // Check if audio finished playing
          if (currentPos >= totalDuration - 100 && totalDuration > 0) {
            logger.log('✅ Audio playback finished', {context: 'Conversation'});
            Sound.stopPlayer();
            Sound.removePlayBackListener();
            setPlayingAudio(null);
            setAudioProgress(prev => ({...prev, [messageId]: 0}));
          }
        });

        // Play the audio using startPlayer
        await Sound.startPlayer(audioUrl);
        logger.log('▶️ Audio playback started', {context: 'Conversation'});
      }
    } catch (error) {
      logger.error('❌ Failed to play audio:', error, {
        context: 'Conversation',
      });
      Sound.removePlayBackListener();
      setPlayingAudio(null);
      setAudioProgress(prev => ({...prev, [messageId]: 0}));
      showAlert('Failed to play audio', 'error');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
      Sound.removePlayBackListener();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (playingAudio) {
        Sound.stopPlayer().catch(error =>
          logger.error('Sound player error', error, {
            context: 'Conversation.soundPlayer',
          }),
        );
      }
    };
  }, []);

  const formatAudioTime = milliseconds => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({item}) => {
    if (item.type === 'header') {
      return renderDateHeader(item);
    }

    const isSender = item?.sender_id === User?.user?.id;
    const isImageMessage = item.message_type === 'image';
    const isDocumentMessage = item.message_type === 'system';
    const isAudioMessage =
      item.message_type === 'audio' ||
      item.mime_type === 'audio' ||
      (item.file_url && item.file_url.includes('.webm'));

    const isMessageSent = isSender && item.delivery_status === 'sent';
    const isMessageRead = isSender && item.delivery_status === 'read';
    const isMessageDelivered = isSender && item.delivery_status === 'delivered';
    const isPlaying = playingAudio === item.id;
    const isUploading = item.uploading;
    const isPending = item.isPending || false;
    const renderImage = isImageMessage
      ? isPending
        ? item?.localImagePath
        : `${item?.file_url}`
      : null;

    // Determine audio URL based on pending status
    const audioUrl =
      isPending && item.localAudioPath ? item.localAudioPath : item.file_url;

    return (
      <View style={styles.messageContainer}>
        <View
          style={[
            styles.messageBubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}>
          {isImageMessage && (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => onMsgPress(item)}>
                <Image
                  source={{uri: renderImage}}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}

          {isDocumentMessage && (
            <View style={styles.imageContainer}>
              <TouchableOpacity
                style={{marginTop: hp(0)}}
                onPress={() => onMsgPress(item)}>
                <View style={[styles.pdfContainer, {borderWidth: 0}]}>
                  <Svgs.documentred height={hp(4)} width={hp(4)} />
                  <Text
                    style={{
                      fontFamily: Fonts.PoppinsMedium,
                      color: isDarkMode
                        ? Colors.darkTheme.primaryTextColor
                        : Colors.lightTheme.primaryTextColor,
                    }}>
                    {'Document'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {isAudioMessage && (
            <View
              style={[
                styles.audioBubble,
                isSender ? styles.senderBubble : styles.receiverBubble,
              ]}>
              <View style={styles.audioContent}>
                <TouchableOpacity
                  onPress={() => !isUploading && playAudio(audioUrl, item.id)}
                  disabled={isUploading}
                  style={[
                    styles.audioPlayButton,
                    isSender && styles.audioPlayButtonSender,
                    isPlaying && styles.audioPlayButtonActive,
                  ]}
                  activeOpacity={0.7}>
                  {isUploading ? (
                    <ActivityIndicator
                      size="small"
                      color={isSender ? Colors.darkTheme.primaryColor : '#fff'}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={isPlaying ? 'pause' : 'play'}
                      size={RFPercentage(3)}
                      color={isSender ? Colors.darkTheme.primaryColor : '#fff'}
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.audioInfoContainer}>
                  <View style={styles.audioProgressBarContainer}>
                    <View
                      style={[
                        styles.audioProgressBarBackground,
                        {
                          backgroundColor: isSender
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.2)',
                        },
                      ]}>
                      <View
                        style={[
                          styles.audioProgressBarFill,
                          {
                            width: `${
                              audioDuration[item.id]
                                ? (audioProgress[item.id] /
                                    audioDuration[item.id]) *
                                  100
                                : 0
                            }%`,
                            backgroundColor: isSender ? '#fff' : '#fff',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.audioTimeContainer}>
                    <MaterialCommunityIcons
                      name="microphone"
                      size={RFPercentage(1.6)}
                      color={isSender ? Colors.darkTheme.primaryColor : '#fff'}
                      style={{opacity: 0.7}}
                    />
                    <Text
                      style={[
                        styles.audioDurationText,
                        isSender ? styles.senderText : styles.receiverText,
                      ]}>
                      {isUploading
                        ? 'Uploading...'
                        : isPlaying && audioProgress[item.id]
                        ? formatAudioTime(audioProgress[item.id])
                        : audioDuration[item.id]
                        ? formatAudioTime(audioDuration[item.id])
                        : '0:00'}
                    </Text>
                    <Text
                      style={[
                        styles.audioDurationText,
                        isSender ? styles.senderText : styles.receiverText,
                        {opacity: 0.6},
                      ]}>
                      {!isUploading && audioDuration[item.id]
                        ? `/ ${formatAudioTime(audioDuration[item.id])}`
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {item.content && (
            <Text
              style={[
                styles.messageText,
                isSender ? styles.senderText : styles.receiverText,
              ]}>
              {item.content}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.timeContainer,
            isSender && styles.senderTimeContainer,
          ]}>
          <Text style={styles.timeText}>
            {moment(item?.created_at).format('hh:mm A')}
          </Text>
          {/* {isSender && (
            <MaterialCommunityIcons
              name={
                isPending
                  ? 'clock-outline'
                  : isMessageSent
                  ? 'check'
                  : 'check-all'
              }
              size={RFPercentage(1.8)}
              color={
                isMessageRead
                  ? Colors.darkTheme.primaryColor
                  : Colors.darkTheme.secondryTextColor
              }
            />
          )} */}
        </View>
      </View>
    );
  };

  const flatListData = createFlatListData();

  const viewSelectedDocument = useCallback(path => {
    viewDocument({
      uri: path,
      mimeType: 'application/pdf',
    }).catch(error => {
      logger.error('Document viewer error:', error, {context: 'Conversation'});
      showAlert(t('Failed to open document'), 'error');
    });
  }, []);

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        logger.warn(err, {context: 'Conversation'});
        return false;
      }
    }
    return true; // iOS handled via Info.plist
  };
  // Recording
  const onStartRecord = async () => {
    const granted = await requestAudioPermission();
    logger.log(granted, {context: 'Conversation'});

    // Set up recording progress listener
    Sound.addRecordBackListener(e => {
      logger.log('Recording progress:', e.currentPosition, e.currentMetering, {
        context: 'Conversation',
      });

      // Format duration as MM:SS
      const totalSeconds = Math.floor(e.currentPosition / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(
        seconds,
      ).padStart(2, '0')}`;

      setRecordingStates(prev => ({
        ...prev,
        isRecording: true,
        recordSecs: e.currentPosition,
        duration: formattedDuration, // Now in MM:SS format
        recordingUI: true,
      }));
    });

    const result = await Sound.startRecorder();
    logger.log('Recording started:', result, {context: 'Conversation'});
  };
  const onStopRecord = async (stop = true) => {
    const result = await Sound.stopRecorder();
    Sound.removeRecordBackListener();

    logger.log('Recording stopped:', result, {context: 'Conversation'});

    if (stop) {
      setRecordingStates(prev => ({
        ...prev,
        isRecording: false,
        recordingUI: false,
      }));
    } else {
      setRecordingStates(prev => ({
        ...prev,
        isRecording: false,
        recordingUI: false,
      }));
      setSendMsgLoading(true);
      await handleSendAudioMessage(result);
    }
  };
  const onEndReachedCalledDuringMomentum = useRef(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons
          name={'chevron-left'}
          onPress={() => navigation.goBack()}
          size={RFPercentage(4)}
          color={
            isDarkMode
              ? Colors.darkTheme.primaryTextColor
              : Colors.lightTheme.primaryTextColor
          }
        />
        <TouchableOpacity style={{flexDirection: 'row'}}>
          <Image source={Images.placeholderImg} style={styles.avatar} />
          <View>
            <Text style={styles.screenHeading}>{name || 'John Doe'}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.onlineIndicator,
                  getUserStatus(otherUserOnlineStatus, otherUserLastSeen) ===
                  'Online'
                    ? {backgroundColor: '#4CAF50'}
                    : {backgroundColor: 'gray'},
                ]}
              />
              <Text
                // style={styles.userStatus}
                style={[
                  styles.userStatus,
                  getUserStatus(otherUserOnlineStatus, otherUserLastSeen) !==
                    'Online' && {color: 'gray'},
                ]}>
                {t(getUserStatus(otherUserOnlineStatus, otherUserLastSeen))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(5) : 0}>
   {isLoading ? (
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <Loader size={wp(10)} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={flatListData}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            style={styles.chatList}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() =>
              isLoadingMore ? <Loader size={wp(10)} /> : null
            }
            // onMomentumScrollBegin={() => {
            //   onEndReachedCalledDuringMomentum.current = false;
            // }}
            // onEndReached={() => {
            //   logger.log('End reached');

            //   // 🔒 COMPREHENSIVE GUARD - Check ALL loading states
            //   if (isLoading || isLoadingMore || !hasNext) {
            //     // Set flag to true to prevent multiple rapid calls
            //     onEndReachedCalledDuringMomentum.current = true;
            //     return;
            //   }

            //   // 🔒 FLAG CHECK - Only proceed if flag is false
            //   if (!onEndReachedCalledDuringMomentum.current) {
            //     logger.log('Fetching more messages...');
            //     FetchThreadMsgs(false);

            //     // Set flag to true immediately to prevent rapid calls
            //     onEndReachedCalledDuringMomentum.current = true;
            //   }
            // }}
            // // 🔄 PROPER FLAG RESET - At scroll END, not BEGIN
            // onMomentumScrollEnd={() => {
            //   onEndReachedCalledDuringMomentum.current = false;
            // }}
            // // inverted
            // onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                colors={[Colors.darkTheme.primaryColor]}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            // onContentSizeChange={() => {
            //   // 🔹 Always scroll to bottom when new content is added
            //   flatListRef.current?.scrollToEnd({animated: true});
            // }}
            refreshing={refreshing}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
          />
        )}

        

        {document && (
          <View style={[styles.inputContainer]}>
            <TouchableOpacity
              onPress={() => viewSelectedDocument(document?.path)}
              style={{marginTop: hp(0), flex: 1}}>
              <View style={styles.pdfContainer}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setDocument(null)}>
                  <Svgs.Cross height={hp(1)} width={hp(1)} />
                </TouchableOpacity>
                <Svgs.documentred height={hp(4)} width={hp(4)} />
                <Text>{truncateText(document?.name, 10)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            recordingStates.recordingUI && {paddingVertical: hp(1.8)},
          ]}>
          {recordingStates.recordingUI ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <TouchableOpacity
                onPress={
                  recordingStates.isRecording ? onStopRecord : onStartRecord
                }>
                <MaterialCommunityIcons
                  name={recordingStates.isRecording ? 'close' : 'microphone'}
                  size={RFPercentage(4)}
                  color={
                    recordingStates.isRecording
                      ? 'red'
                      : Colors.lightTheme.primaryColor
                  }
                />
              </TouchableOpacity>
              <Text style={styles.ListeningText}>
                {t('Listening in progress...')}
              </Text>

              <Text
                style={[
                  styles.ListeningText,
                  {
                    color: isDarkMode
                      ? Colors.darkTheme.primaryTextColor
                      : Colors.lightTheme.primaryTextColor,
                  },
                ]}>
                {recordingStates.duration}
              </Text>
              <TouchableOpacity
                style={[
                  styles.iconWrapper,
                  {backgroundColor: Colors.darkTheme.primaryColor},
                ]}
                disabled={sendMsgLoading}
                onPress={() => {
                  onStopRecord(false);
                }}>
                {sendMsgLoading ? (
                  <Loader color={Colors.darkTheme.primaryTextColor} />
                ) : (
                  <Svgs.sendWhite />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={
                  recordingStates.isRecording ? onStopRecord : onStartRecord
                }>
                <MaterialCommunityIcons
                  name="microphone"
                  size={RFPercentage(4)}
                  color={
                    recordingStates.isRecording
                      ? 'red'
                      : Colors.lightTheme.primaryColor
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => CameraBottomSheetRef.current.open()}
                // style={styles.iconWrapper}
              >
                <Svgs.plusBlue />
              </TouchableOpacity>

              <TxtInput
                value={chat}
                onChangeText={setChat}
                placeholder={t('Write message...')}
                style={styles.input}
                containerStyle={{
                  backgroundColor: isDarkMode
                    ? Colors.darkTheme.input
                    : Colors.lightTheme.backgroundColor,
                }}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.iconWrapper,
                  {backgroundColor: Colors.darkTheme.primaryColor},
                ]}
                disabled={sendMsgLoading}
                onPress={() => {
                  document
                    ? handleSendImageMessage('document')
                    : handleSendMessage();
                }}>
                {sendMsgLoading ? (
                  <Loader color={Colors.darkTheme.primaryTextColor} />
                ) : (
                  <Svgs.sendWhite />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <CameraBottomSheet
        refRBSheet={CameraBottomSheetRef}
        showDocument
        onPick={image => {
          logger.log('File picked from CameraBottomSheet:', image.path, {
            context: 'Conversation',
          });
          if (image?.name) {
            setDocument(image);
          } else {
            setTimeout(() => {
              setIsPreviewVisible(true);
            }, 300);
            setImage(image);
          }
        }}
      />

      <ImagePreviewModal
        visible={isImagePreviewVisible}
        imageUri={selectedImage}
        onClose={() => setIsImagePreviewVisible(false)}
      />

      <DocumentViewModal
        visible={isDocumentPreviewVisible}
        documentUrl={selectedDocument}
        onClose={() => setisDocumentPreviewVisible(false)}
      />

      <Modal
        visible={isPreviewVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsPreviewVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? hp(5) : 0}>
          <Image source={{uri: image?.path}} style={styles.fullScreenImage} />
          <View style={styles.modalButtons}>
            <View style={styles.ModalinputContainer}>
              <TouchableOpacity
                onPress={() => {
                  setImage(null);
                  setIsPreviewVisible(false);
                }}
                style={[
                  styles.iconWrapper,
                  {backgroundColor: Colors.darkTheme.backgroundColor},
                ]}>
                <Svgs.crossWhite height={hp(3)} width={hp(3)} />
              </TouchableOpacity>
              <TxtInput
                value={chat}
                onChangeText={setChat}
                placeholder={t('Write message...')}
                style={[styles.input]}
                inputStyle={{color: Colors.darkTheme.primaryTextColor}}
                placeholderTextColor={Colors.darkTheme.primaryTextColor}
                containerStyle={{
                  backgroundColor: Colors.darkTheme.input,
                  borderColor: Colors.darkTheme.BorderGrayColor,
                }}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.iconWrapper,
                  {backgroundColor: Colors.darkTheme.primaryColor},
                ]}
                disabled={sendMsgLoading}
                onPress={() => handleSendImageMessage('image')}>
                {sendMsgLoading ? (
                  <Loader color={Colors.darkTheme.primaryTextColor} />
                ) : (
                  <Svgs.sendWhite />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Conversation;

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
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(1),
      borderBottomWidth: 0.5,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
    },
    screenHeading: {
      paddingTop: hp(0.5),
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(0.2),
    },
    onlineIndicator: {
      width: wp(2),
      height: wp(2),
      borderRadius: wp(1),
      marginRight: wp(1),
    },
    userStatus: {
      fontSize: RFPercentage(1.6),
      color: '#00C851',
      fontFamily: Fonts.PoppinsRegular,
    },
    avatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      marginHorizontal: wp(3),
    },
    chatList: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    chatContent: {},
    // Date header styles
    dateHeaderContainer: {
      alignItems: 'center',
      marginVertical: hp(1),
    },
    dateHeaderBubble: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: wp(3),
    },
    dateHeaderText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    messageContainer: {
      marginVertical: hp(0.5),
    },
    messageBubble: {
      maxWidth: '80%',
      borderRadius: wp(4),
      padding: wp(3),
    },
    senderBubble: {
      backgroundColor: Colors.darkTheme.primaryColor,
      alignSelf: 'flex-end',
      // marginLeft: '20%',
    },
    receiverBubble: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      alignSelf: 'flex-start',
      // marginRight: '20%',
    },
    messageText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.6),
      lineHeight: RFPercentage(2.8),
    },
    senderText: {
      color: Colors.lightTheme.backgroundColor,
    },
    receiverText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    timeContainer: {
      alignSelf: 'flex-start',
      marginTop: hp(0.5),
      marginLeft: wp(2),
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1),
    },
    senderTimeContainer: {
      alignSelf: 'flex-end',
      marginRight: wp(2),
      marginLeft: 0,
    },
    timeText: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    // Image styles
    imageContainer: {
      marginTop: wp(1),
    },
    imageWrapper: {
      position: 'relative',
      width: wp(50),
      height: wp(40),
      borderRadius: wp(2),
      overflow: 'hidden',
    },
    messageImage: {
      width: '100%',
      height: '100%',
      borderRadius: wp(2),
    },
    downloadOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: wp(5),
      padding: wp(2),
    },
    downloadingCircle: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: wp(5),
      padding: wp(2),
      borderWidth: 2,
      borderColor: Colors.lightTheme.backgroundColor,
    },
    // Input styles
    inputContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      // borderRadius: wp(6),
      // position: 'absolute',
      // bottom: hp(0),
      // left: wp(4),
      // right: wp(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
    },
    iconWrapper: {
      padding: wp(2.5),
      borderRadius: wp(100),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,

      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      marginHorizontal: wp(3),
      maxHeight: hp(10),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ModalinputContainer: {
      backgroundColor: Colors.darkTheme.secondryColor,

      borderRadius: wp(6),
      position: 'absolute',
      // bottom: hp(1),
      left: wp(4),
      right: wp(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
    },
    fullScreenImage: {
      width: '100%',
      height: '80%',
      resizeMode: 'contain',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingVertical: hp(2),
    },
    cancelBtn: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(13),
      borderRadius: wp(6),
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
      borderWidth: 1,
    },
    sendBtnModal: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(13),
      borderRadius: wp(6),
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pdfContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(3),
      marginRight: wp(3),
    },
    closeIcon: {
      position: 'absolute',
      top: hp(0),
      right: wp(0),
      zIndex: 1000,
      backgroundColor: Colors.lightTheme.BorderGrayColor,
      padding: wp(1),
      borderRadius: wp(100),
    },
    ListeningText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
    },

    audioDurationText: {
      fontSize: RFPercentage(1.5),
      opacity: 0.8,
      fontFamily: Fonts.PoppinsRegular,
    },
    audioIcon: {
      marginLeft: wp(2),
    },
    audioPlayButton: {
      width: wp(11),
      height: wp(11),
      borderRadius: wp(5.5),
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    audioPlayButtonSender: {
      backgroundColor: '#fff',
    },
    audioPlayButtonActive: {
      transform: [{scale: 0.95}],
    },
    audioInfoContainer: {
      flex: 1,
      gap: wp(1.5),
    },
    audioProgressBarContainer: {
      width: '100%',
      marginTop: hp(0.3),
    },
    audioProgressBarBackground: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    audioProgressBarFill: {
      height: '100%',
      borderRadius: 2,
      minWidth: 4,
    },
    audioTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1),
      alignSelf: 'flex-end',
    },
    audioContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
    },
    audioBubble: {
      minWidth: wp(60),
    },
  });
