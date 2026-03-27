// import { PermissionsAndroid, Platform } from "react-native";
// import messaging from '@react-native-firebase/messaging';
// import firebase from '@react-native-firebase/app';
// import logger from '@utils/logger';

// async function requestNotificationPermission() {
//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//         const permission = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//         );

//         if (permission === PermissionsAndroid.RESULTS.GRANTED) {
//         } else {
//         }
//     }
// }

// async function requestUserPermission() {
//     const authStatus = await messaging().requestPermission({
//         alert: true,
//         announcement: false,
//         badge: true,
//         carPlay: false,
//         provisional: false,
//         sound: true,
//     });
//     const enabled =
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//     }
// }

// export async function getFcmToken() {
//     await requestNotificationPermission();
//     requestUserPermission()
//     const fcmToken = await messaging().getToken();
//     if (fcmToken) {
//         return fcmToken
//     } else {
//     }
// }
