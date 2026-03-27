import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState} from 'react-native';
import logger from '@utils/logger';

const STORAGE_KEYS = {
  auth: 'persist:auth',
  theme: 'persist:theme',
  messageSlice: 'persist:messageSlice',
  CreateTasklocation: 'persist:CreateTasklocation',
  states: 'persist:states',
};

let unsubscribeStore = null;
let saveTimeout = null;
let appStateListener = null;

export const loadPersistedState = async () => {
  try {
    const persistedState = {};

    // Check if old format exists (migrate if found)
    const rootData = await AsyncStorage.getItem('persist:root');
    if (rootData) {
      try {
        const parsed = JSON.parse(rootData);

        // Migrate each slice if it exists in old format
        if (parsed.auth) {
          try {
            persistedState.auth = JSON.parse(parsed.auth);
            await AsyncStorage.setItem(STORAGE_KEYS.auth, parsed.auth);
          } catch (e) {
            logger.error('Failed to migrate auth data:', e, { context: 'loadPersistedState' });
          }
        }
        if (parsed.theme) {
          try {
            persistedState.theme = JSON.parse(parsed.theme);
            await AsyncStorage.setItem(STORAGE_KEYS.theme, parsed.theme);
          } catch (e) {
            logger.error('Failed to migrate theme data:', e, { context: 'loadPersistedState' });
          }
        }
        if (parsed.messageSlice) {
          try {
            persistedState.messageSlice = JSON.parse(parsed.messageSlice);
            await AsyncStorage.setItem(STORAGE_KEYS.messageSlice, parsed.messageSlice);
          } catch (e) {
            logger.error('Failed to migrate messageSlice data:', e, { context: 'loadPersistedState' });
          }
        }
        if (parsed.CreateTasklocation) {
          try {
            persistedState.CreateTasklocation = JSON.parse(parsed.CreateTasklocation);
            await AsyncStorage.setItem(STORAGE_KEYS.CreateTasklocation, parsed.CreateTasklocation);
          } catch (e) {
            logger.error('Failed to migrate CreateTasklocation data:', e, { context: 'loadPersistedState' });
          }
        }
        if (parsed.states) {
          try {
            persistedState.states = JSON.parse(parsed.states);
            await AsyncStorage.setItem(STORAGE_KEYS.states, parsed.states);
          } catch (e) {
            logger.error('Failed to migrate states data:', e, { context: 'loadPersistedState' });
          }
        }

        // Remove old key after migration attempt
        await AsyncStorage.removeItem('persist:root');

        logger.log('Migration completed successfully', { context: 'loadPersistedState' });
      } catch (migrationError) {
        logger.error('Error during migration:', migrationError, { context: 'loadPersistedState' });
        // Clear corrupted old data
        await AsyncStorage.removeItem('persist:root');
      }
    }

    if (!persistedState.auth) {
      try {
        const authData = await AsyncStorage.getItem(STORAGE_KEYS.auth);
        if (authData) {
          persistedState.auth = JSON.parse(authData);
        }
      } catch (authError) {
        logger.error('Failed to load auth data:', authError, { context: 'loadPersistedState' });
        await AsyncStorage.removeItem(STORAGE_KEYS.auth);
      }
    }

    if (!persistedState.theme) {
      try {
        const themeData = await AsyncStorage.getItem(STORAGE_KEYS.theme);
        if (themeData) {
          persistedState.theme = JSON.parse(themeData);
        }
      } catch (themeError) {
        logger.error('Failed to load theme data:', themeError, { context: 'loadPersistedState' });
        await AsyncStorage.removeItem(STORAGE_KEYS.theme);
      }
    }

    if (!persistedState.messageSlice) {
      try {
        const messageSliceData = await AsyncStorage.getItem(STORAGE_KEYS.messageSlice);
        if (messageSliceData) {
          persistedState.messageSlice = JSON.parse(messageSliceData);
        }
      } catch (messageError) {
        logger.error('Failed to load messageSlice data:', messageError, { context: 'loadPersistedState' });
        await AsyncStorage.removeItem(STORAGE_KEYS.messageSlice);
      }
    }

    if (!persistedState.CreateTasklocation) {
      try {
        const CreateTaskLocationData = await AsyncStorage.getItem(STORAGE_KEYS.CreateTasklocation);
        if (CreateTaskLocationData) {
          persistedState.CreateTasklocation = JSON.parse(CreateTaskLocationData);
        }
      } catch (locationError) {
        logger.error('Failed to load CreateTasklocation data:', locationError, { context: 'loadPersistedState' });
        await AsyncStorage.removeItem(STORAGE_KEYS.CreateTasklocation);
      }
    }

    if (!persistedState.states) {
      try {
        const statesData = await AsyncStorage.getItem(STORAGE_KEYS.states);
        if (statesData) {
          persistedState.states = JSON.parse(statesData);
        }
      } catch (statesError) {
        logger.error('Failed to load states data:', statesError, { context: 'loadPersistedState' });
        await AsyncStorage.removeItem(STORAGE_KEYS.states);
      }
    }

    return persistedState;
  } catch (error) {
    logger.error('Critical error in loadPersistedState:', error, { context: 'loadPersistedState' });
    return {};
  }
};

export const saveState = async (state) => {
  try {
    if (state.auth) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
      } catch (authError) {
        if (authError.name === 'QuotaExceededError') {
          logger.warn('AsyncStorage quota exceeded for auth data', { context: 'saveState' });
        } else {
          throw authError;
        }
      }
    }
    if (state.theme) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(state.theme));
      } catch (themeError) {
        if (themeError.name === 'QuotaExceededError') {
          logger.warn('AsyncStorage quota exceeded for theme data', { context: 'saveState' });
        } else {
          throw themeError;
        }
      }
    }
    if (state.messageSlice) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.messageSlice, JSON.stringify(state.messageSlice));
      } catch (messageError) {
        if (messageError.name === 'QuotaExceededError') {
          logger.warn('AsyncStorage quota exceeded for messageSlice data', { context: 'saveState' });
        } else {
          throw messageError;
        }
      }
    }
    if (state.CreateTasklocation) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CreateTasklocation, JSON.stringify(state.CreateTasklocation));
      } catch (locationError) {
        if (locationError.name === 'QuotaExceededError') {
          logger.warn('AsyncStorage quota exceeded for CreateTasklocation data', { context: 'saveState' });
        } else {
          throw locationError;
        }
      }
    }
    if (state.states) {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.states, JSON.stringify(state.states));
      } catch (statesError) {
        if (statesError.name === 'QuotaExceededError') {
          logger.warn('AsyncStorage quota exceeded for states data', { context: 'saveState' });
        } else {
          throw statesError;
        }
      }
    }
  } catch (error) {
    logger.error('Error saving state:', error, { context: 'saveState' });
    // Don't rethrow - let app continue
  }
};

export const createPersistenceSubscriber = (store) => {
  // Prevent multiple subscriptions
  if (unsubscribeStore) {
    unsubscribeStore();
  }

  // Subscribe to store changes
  unsubscribeStore = store.subscribe(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      const state = store.getState();
      saveState(state);
    }, 1000);
  });

  appStateListener = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
      }
      // Save immediately when app goes to background
      const state = store.getState();
      saveState(state);
    }
  });

  // Return cleanup function
  return () => {
    if (unsubscribeStore) {
      unsubscribeStore();
      unsubscribeStore = null;
    }
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    if (appStateListener) {
      appStateListener.remove();
      appStateListener = null;
    }
  };
};

// Expose cleanup function for app-level usage
let cleanup = null;

export const setupPersistence = (store) => {
  if (cleanup) {
    cleanup();
  }
  cleanup = createPersistenceSubscriber(store);
  return cleanup;
};

export const cleanupPersistence = () => {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
};

export const clearPersistedState = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.auth),
      AsyncStorage.removeItem(STORAGE_KEYS.theme),
      AsyncStorage.removeItem(STORAGE_KEYS.messageSlice),
      AsyncStorage.removeItem(STORAGE_KEYS.CreateTasklocation),
      AsyncStorage.removeItem(STORAGE_KEYS.states),
    ]);
  } catch (error) {
    logger.error('Error clearing persisted state:', error, { context: 'clearPersistedState' });
  }
};
