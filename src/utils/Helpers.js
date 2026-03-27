import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import {PermissionsAndroid, Platform} from 'react-native';
import logger from '@utils/logger';
export const capitalize = str =>
  typeof str === 'string'
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';

export const fetchApis = async (
  endPoint,
  method,
  setLoading,
  payload,
  showAlert,
  header,
  setServerRunning,
) => {
  setLoading && setLoading(true);

  try {
    const response = await fetch(endPoint, {
      method,
      headers: header || {'Content-Type': 'application/json'},
      body: method === 'GET' || !payload ? undefined : JSON.stringify(payload),
    });
    const jsonResponse = await response.json();

    if (!response.ok) {
      setServerRunning?.(false);
    }

    return {ok: response.ok, data: jsonResponse}; // ✅ consistent return shape
  } catch (error) {

    if (
      error instanceof TypeError &&
      error.message === 'Network request failed'
    ) {
      logger.error('Network request failed', error, { endPoint, context: 'fetchApis' });

      showAlert?.('Please check your internet connection.', 'error');
      return {
        ok: false,
        data: {error: true, message: 'Please check your internet connection.'},
      };
    }

    setServerRunning?.(false);

    return {ok: false, data: null};
  } finally {
    setLoading && setLoading(false);
  }
};

export const isValidUrl = url => {
  if (typeof url !== 'string' || !url.trim()) return false;

  const pattern = /^(https?:\/\/)[^\s]+(\.(jpg|jpeg|png|gif|webp))$/i;
  return pattern.test(url.trim());
};

export function formatChatDate(dateString) {
  const inputDate = moment(dateString);
  const now = moment();

  if (inputDate.isSame(now, 'day')) {
    // Today → return time only
    return inputDate.format('hh:mm A');
  }

  if (inputDate.isSame(moment().subtract(1, 'days'), 'day')) {
    // Yesterday
    return 'Yesterday';
  }

  return inputDate.format('D MMMM');
}

export const fetchFormDataApi = async (
  endPoint,
  method,
  setLoading,
  formData,
  showAlert,
  headers = {},
) => {
  setLoading && setLoading(true);

  try {
    const response = await fetch(endPoint, {
      method,
      headers: {
        ...headers,
      },
      body: formData,
    });

    const jsonResponse = await response.json();

    return {ok: response.ok, data: jsonResponse};
  } catch (error) {
    logger.error('Error:', error, { context: 'fetchApis' });
    if (
      error instanceof TypeError &&
      error.message === 'Network request failed'
    ) {
       showAlert?.('Please check your internet connection.', 'error');
    } else {
       showAlert?.('Something went wrong.', 'error');
    }
    return {ok: false, data: null};
  } finally {
    setLoading && setLoading(false);
  }
};

export function formatNumber(value) {
  const num = Number(value);

  // Safe check
  if (isNaN(num) || !isFinite(num)) return '0';

  // Handle millions
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  // Handle thousands
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  // Handle normal numbers (integer/decimal)
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

export function formatCurrency(amount, currencyCode, locale = 'en-US') {
  // Validate amount

  const safeAmount = Number(amount);
  if (isNaN(safeAmount) || !isFinite(safeAmount)) {
    logger.warn(`Invalid amount "${amount}". Defaulting to 0.`, { amount, context: 'formatAmount' });
    return '0';
  }

  if (
    typeof currencyCode !== 'string' ||
    currencyCode.length !== 3 ||
    !/^[A-Z]{3}$/.test(currencyCode.toUpperCase())
  ) {
    currencyCode = 'USD';
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(safeAmount);
  } catch (err) {
    logger.error('Currency formatting error:', err, { amount: safeAmount, currencyCode, context: 'formatCurrency' });
    return String(safeAmount);
  }
}

export function truncateText(text, maxLength) {
  if (!text) return ''; // handles null, undefined, empty string, 0, false
  if (typeof text !== 'string') text = String(text); // convert non-strings to string
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getFirstWord(str) {
  if (typeof str !== 'string') return '';
  const parts = str.trim().split(/\s+/); // split by any whitespace
  return parts[0] || '';
}

export const isConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected;
  } catch (error) {
    logger.error('Error checking network connectivity:', error, { context: 'isConnected' });
    return false;
  }
};

// Network state management for offline messaging
let networkChangeListeners = [];


export const subscribeNetworkChanges = callback => {
  const listener = NetInfo.addEventListener(state => {
    const isConnected = state.isConnected;
    callback(isConnected);
  });

  networkChangeListeners.push(listener);
  return () => {
    listener();
    networkChangeListeners = networkChangeListeners.filter(l => l !== listener);
  };
};


export const shouldQueueMessage = async () => {
  return !(await isConnected());
};


export const unsubscribeNetworkChanges = () => {
  networkChangeListeners.forEach(listener => listener());
  networkChangeListeners = [];
};

export function formatNumbertoK(num) {
  if (typeof num !== 'number' || !isFinite(num)) {
    return '0';
  }

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  return num.toString();
}

export const requestStoragePermission = async showAlert => {
  if (Platform.OS !== 'android') return true;

  try {
    const sdk = Platform.constants.Release; // API level as string
    const apiLevel = Number(Platform.Version);
    logger.debug('API Level:', apiLevel, { context: 'checkDownloadPermission' });

    // Android 13+ (API 33)
    if (apiLevel >= 33) {
      logger.debug('Android 13+', { context: 'checkDownloadPermission' });
      return true;
    }

    // Android 10 - Android 12 (API 29–32)
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'This app needs access to your storage to download PDF files',
        buttonPositive: 'OK',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      showAlert?.(
        'Storage permission is required to download PDF files',
        'error',
      );
      return false;
    }

    return true;
  } catch (err) {
    logger.warn('Storage permission error:', err, { context: 'requestStoragePermission' });
    return false;
  }
};

export const ApiResponse = (showAlert, data, language) => {
  const lang = language?.value || 'en'; // fallback if language is undefined
  const isError = data?.error === true;

  console.log(JSON.stringify(data, null, 2))

  let message;

  // Lang-based messages
  if (lang === 'es' && data?.message_es) {
    message = data.message_es;
    logger.debug('Using Spanish message', { context: 'ApiResponse' });
  } else if (lang === 'en' && data?.message_en) {
    message = data.message_en;
    logger.debug('Using English message', { context: 'ApiResponse' });

  } else {
    message = data?.message;
    logger.debug('Using default message', { context: 'ApiResponse' });

  }

  if (isError && (!message)) {
    message = "Something went wrong.";
  }

  showAlert?.(message, isError ? 'error' : 'success');
};