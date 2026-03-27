// // NotificationService.js
// import {Platform} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import logger from '@utils/logger';

// import {getApp} from '@react-native-firebase/app';
// import {
//   getMessaging,
//   requestPermission,
//   AuthorizationStatus,
//   getToken,
//   onMessage,
//   onNotificationOpenedApp,
//   getInitialNotification,
//   setBackgroundMessageHandler,
// } from '@react-native-firebase/messaging';

// const messaging = getMessaging(getApp());

// async function requestUserPermission() {
//   try {
//     if (Platform.OS === 'ios') {
//       const authStatus = await requestPermission(messaging);
//       const enabled =
//         authStatus === AuthorizationStatus.AUTHORIZED ||
//         authStatus === AuthorizationStatus.PROVISIONAL;
//       logger.log('🔐 Permission Granted:', enabled, { context: 'requestUserPermission' });
//       return enabled;
//     }
//     return true;
//   } catch (err) {
//     logger.error('❌ Permission Error:', err, { context: 'requestUserPermission' });
//     return false;
//   }
// }

// async function saveToken(token) {
//   try {
//     await AsyncStorage.setItem('fcm_token', token);
//   } catch (err) {
//     logger.error('💾 Token Store Error:', err, { context: 'saveToken' });
//   }
// }

// export async function getFCMToken() {
//   const allowed = await requestUserPermission();
//   if (!allowed) return null;

//   try {
//     const token = await getToken(messaging);
//     if (token) {
//       await saveToken(token);
//     }
//     return token;
//   } catch (err) {
//     logger.error('❌ Token Error:', err, { context: 'getFCMToken' });
//     return null;
//   }
// }

// // ✅ Foreground Message Handler (App open)
// export function registerForegroundHandler(
//   showAlert,
//   onForgroundNotificationPress=()=>{},
// ) {
//   onMessage(messaging, async message => {
//     showAlert(
//       message.notification.title,
//       'success',
//       message.notification.body,
//       5000,
//        () => onForgroundNotificationPress(message), // ✅ Correct
//     );
//   });
// }

// setBackgroundMessageHandler(messaging, async message => {
//   logger.debug('🌙 Background Notification:', message, { context: 'backgroundMessageHandler' });
// });

// export function registerNotificationOpenedHandler(
//   onNotificationPress = () => {},
// ) {
//   onNotificationOpenedApp(messaging, message => {
//     onNotificationPress(message); // ✅ CALL THE CALLBACK
//   });

//   getInitialNotification(messaging).then(message => {
//     if (message) {
//       logger.log('🚀 Notification Tapped (Quit State):', message, { context: 'registerNotificationOpenedHandler' });
//       onNotificationPress(message); // ✅ CALL THE CALLBACK
//     }
//   });
// }
