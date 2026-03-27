import {combineReducers, configureStore} from '@reduxjs/toolkit';
import authSlice from '@redux/Slices/authSlice';
import themeSlice from '@redux/Slices/theme';
import errorSlice from '@redux/Slices/errorSlice';
import createAccSlice from '@redux/Slices/createAccSlice';
import updateLocationSlice from '@redux/Slices/updateLocationSlice';
import globalStatesSlice from '@redux/Slices/globalStatesSlice';
import messageSlice from '@redux/Slices/messageSlice';
import subscriptionReducer from '@redux/Slices/subscriptionSlice';
import CreateTasklocation from '@redux/Slices/CreateTaskLocation';
import {setupPersistence} from '@redux/utils/reduxPersistence';
import logger from '@utils/logger';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  theme: themeSlice,
  error: errorSlice,
  createAccSlice: createAccSlice,
  updateLocation: updateLocationSlice,
  states: globalStatesSlice,
  messageSlice: messageSlice,
  subscription: subscriptionReducer,
  CreateTasklocation: CreateTasklocation,
});

export const createStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
  });

  // Setup persistence with proper cleanup
  setupPersistence(store);

  return store;
};

// Singleton pattern for store instance
let storeInstance = null;

export const initializeStore = preloadedState => {
  if (storeInstance) {
    return storeInstance;
  }

  storeInstance = createStore(preloadedState);
  return storeInstance;
};

export const getStore = () => {
  if (!storeInstance) {
    throw new Error(
      'Redux store has not been initialized. ' +
        'Make sure to call initializeStore() in App.js before accessing the store.',
    );
  }
  return storeInstance;
};

export const dispatch = action => {
  return getStore().dispatch(action);
};

export const getState = () => {
  return getStore().getState();
};
