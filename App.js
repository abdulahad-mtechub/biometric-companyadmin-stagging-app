import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {Linking, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import {Provider, useDispatch, useSelector} from 'react-redux';
import DynamicAlert from './src/components/DynamicAlert';
import {SCREENS} from './src/Constants/Screens';
import {baseUrl, ImgURL} from './src/Constants/urls';
import MainStack from './src/navigations/MainStack';
import {AlertProvider, useAlert} from './src/Providers/AlertContext';
import {setServerRunning} from './src/redux/Slices/errorSlice';
import {setWorkers} from './src/redux/Slices/globalStatesSlice';
import {initializeStore} from './src/redux/Store/Store';
import {loadPersistedState} from './src/redux/utils/reduxPersistence';
import ErrorBoundary from './src/Screens/MainStack/ErrorBoundary';
import i18n from './src/Translations/i18n';
import {fetchApis, isConnected} from './src/utils/Helpers';
import {usePlanDetails} from './src/utils/Hooks/Hooks';
import LanguageInitializer from './src/utils/LanguageInitializer';
import {navigationRef} from './src/utils/navigationRef';
// import {
//   getFCMToken,
//   registerForegroundHandler,
//   registerNotificationOpenedHandler,
// } from './src/utils/NotificationService';
import {initSQLite} from './src/utils/sqlite';
import * as Sentry from '@sentry/react-native';
import {SENTRY_PROJECT_KEY} from '@env';
import Geocoder from 'react-native-geocoding';
import {GOOGLE_MAP_API_KEY} from '@constants/Constants';


Sentry.init({
  dsn: SENTRY_PROJECT_KEY,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const MainRoot = () => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const navigation = useNavigation();

  const {isLoggedIn, company, language} = useSelector(store => store.auth);
  const {showAlert, hideAlert} = useAlert();
  const {refetch} = usePlanDetails();

  const dispatch = useDispatch();

  // -----------------------------
  // Handle Deep Links / Referral Links
  // -----------------------------
  useEffect(() => {
    const handleDeepLink = event => {
      console.log('App opened via deep link:', event.url);
      handleUrlNavigation(event.url);
    };

    const subscription = Linking.addListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('App cold-started via deep link:', url);
        handleUrlNavigation(url);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrlNavigation = url => {
    try {
      const urlWithoutScheme = url.replace(
        'biometricprocompanyadminapp://',
        '',
      );
      const [path, queryString] = urlWithoutScheme.split('?');

      const searchParams = {};
      if (queryString) {
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          searchParams[key] = decodeURIComponent(value);
        });
      }

      console.log('Deep link path:', path);
      console.log('Query params:', searchParams);

      if (path === 'register' || path === 'open') {
        navigation.navigate(SCREENS.SIGNUP, {
          referral: searchParams.referral,
        });
      } else if (path === 'home') {
        navigation.navigate('Home');
      } else {
        console.log('Unknown deep link path:', path);
      }
    } catch (err) {
      console.warn('Failed to parse deep link URL:', url, err);
    }
  };

  useEffect(() => {
    if (language.label === 'English') {
      i18n.changeLanguage('en');
    } else if (language.label === 'Español') {
      i18n.changeLanguage('es');
    }
  }, [language]);

  const CheckServerhealth = useCallback(async () => {
    const connected = await isConnected();
    if (connected) {
      try {
        const response = await fetch(`${ImgURL}/health`);
        if (!response.ok) {
          console.log('Backend has issues');
          dispatch(setServerRunning(false));
        } else {
          console.log('Backend is running');
          dispatch(setServerRunning(true));
          fetchWorkers();
        }
      } catch (error) {
        console.log('Backend is down or crashed');
        dispatch(setServerRunning(false));
      }
    }
  }, [dispatch, company]);

  const fetchWorkers = useCallback(async () => {
    if (!company?.id) {
      console.warn('Company ID not available');
      return;
    }

    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/public/workers?no_pagination=true&company_id=${company.id}&status=active`,
        'GET',
      );

      if (ok && !data?.error && data?.data?.records) {
        const workersData = data.data.records.map(worker => ({
          label: `${worker.first_name} ${worker.last_name}`.trim(),
          value: worker.id,
          email: worker.email,
        }));
        dispatch(setWorkers(workersData));
      } else {
        throw new Error(data?.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      showAlert('Failed to fetch employees', 'error');
    }
  }, [company, dispatch, showAlert]);

  useEffect(() => {
    if (isLoggedIn) {
      CheckServerhealth();
      refetch();
       Geocoder.init(GOOGLE_MAP_API_KEY);
    }
    const init = async () => {
      initSQLite();

      const unsubscribe = NetInfo.addEventListener(async state => {
        if (state.isConnected) {
        }
      });

      // Save unsubscribe reference so cleanup works
      cleanup = unsubscribe;
    };

    let cleanup;

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, [isLoggedIn, initSQLite, company]);
  const onForgroundNotificationPress = msg => {
    console.log(
      '🟢 User tapped notification:',
      msg.data.type,
      JSON.stringify(msg, null, 2),
    );
    if (msg?.data?.type === 'attendance_validation_failed') {
      navigation.navigate(SCREENS.ATTENDANCE);
    } else if (msg?.data?.type === 'new_request') {
      navigation.navigate(SCREENS.REQUESTMANAGEMENT);
    } else if (msg?.data?.type === 'schedule_change_request_submitted') {
      navigation.navigate(SCREENS.REQUESTMANAGEMENT);
    } else if (msg?.data?.type === 'hr_request_submitted') {
      navigation.navigate(SCREENS.REQUESTMANAGEMENT);
    } else if (msg?.data?.type === 'worker_document_uploaded') {
      navigation.navigate(SCREENS.DOCUMENTMANAGEMENT);
    } else if (msg?.data?.type === 'expense_submitted') {
      navigation.navigate(SCREENS.EXPENSEMANAGEMENT);
    } else if (msg?.data?.type === 'payment_success') {
      navigation.navigate(SCREENS.SUBSCRIPTIONPLANS);
    } else if (msg?.data?.type === 'payment_failed') {
      navigation.navigate(SCREENS.SUBSCRIPTIONPLANS);
    } else if (msg?.data?.type === 'subscription_renewal_reminder') {
      navigation.navigate(SCREENS.SUBSCRIPTIONPLANS);
    } else if (msg?.data?.type === 'new_message') {
      navigation.navigate(SCREENS.MESSAGES);
    }
    hideAlert();
  };
  // useEffect(() => {
  //   registerForegroundHandler(showAlert, onForgroundNotificationPress);

  //   registerNotificationOpenedHandler(msg => {
  //     console.log('🟢 User tapped notification:', msg);

  //     // Example navigation from FCM payload:
  //     // if (msg?.data?.screen === 'Chat') {
  //     //   navigation.navigate('Chat', { id: msg.data.userId });
  //     // }
  //   });
  //   getFCMToken(); // optional auto-fetch Token
  // }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? Colors.darkTheme.backgroundColor
            : Colors.lightTheme.secondryColor,
        },
      ]}>
      <StatusBar
        backgroundColor={
          isDarkMode
            ? Colors.darkTheme.backgroundColor
            : Colors.lightTheme.backgroundColor
        }
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <MainStack />
      <DynamicAlert />
    </SafeAreaView>
  );
};
export default Sentry.wrap(function App() {
  const [isRehydrated, setIsRehydrated] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Load persisted state from AsyncStorage
      const persistedState = await loadPersistedState();
      // Initialize store with rehydrated state
      const initializedStore = initializeStore(persistedState);
      setStore(initializedStore);
      setIsRehydrated(true);
    };

    initializeApp();
  }, []);

  // Return null during rehydration (matches loading={null} behavior)
  if (!isRehydrated || !store) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <AlertProvider>
          <LanguageInitializer />
          <NavigationContainer ref={navigationRef}>
            <ErrorBoundary>
              <MainRoot />
            </ErrorBoundary>
          </NavigationContainer>
        </AlertProvider>
      </Provider>
    </GestureHandlerRootView>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});