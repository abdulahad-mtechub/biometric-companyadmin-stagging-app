import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  userId: '',
  User: {},
  isLoggedIn: false,
  rememberMe: false,
  role: 'worker',
  language: '', // Default language,
  token: '',
  savedAccounts: [],
  plan: null,
  planDetails: null,
  planDetailsLoading: false,
  planDetailsError: null,
  trail: null,
  company: {},
  location: {
    latitude: 48.858440950818455,
    longitude: 2.2946447494660642,
    address: null,
    shortAddress: null, // may be undefined
    name: null,
    region: null,
    country: null,
    city: null,
    state: null,
    postalCode: null,
  },
  departments:[],
  onboardingShown: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.User = action.payload;
    },
     setOnboardingShown: (state, action) => {
      state.onboardingShown = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setPlanDetails: (state, action) => {
      state.plan = {...state.plan, ...action.payload};
    },
    setPlanDetailsData: (state, action) => {
      state.planDetails = action.payload;
      state.planDetailsLoading = false;
      state.planDetailsError = null;
    },
    setPlanDetailsLoading: (state, action) => {
      state.planDetailsLoading = action.payload;
    },
    setPlanDetailsError: (state, action) => {
      state.planDetailsError = action.payload;
      state.planDetailsLoading = false;
    },
    clearPlanDetails: state => {
      state.planDetails = null;
      state.planDetailsLoading = false;
      state.planDetailsError = null;
    },
    setTrail: (state, action) => {
      state.trail = {...state.trail, ...action.payload};
    },
    setLocation: (state, action) => {
      state.location = {...state.location, ...action.payload};
    },
    setAuthState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    logout: state => {
      state.User = null;
      state.isLoggedIn = false;
      state.rememberMe = false;
      state.profile = {};
    },
    setDepartment: (state, action) => {
      state.departments = action.payload
    },
    setSavedAccounts: (state, action) => {
      const exists = state.savedAccounts.some(
        account => account.email === action.payload.email,
      );

      if (!exists) {
        state.savedAccounts.push(action.payload);
      }
    },

    removeSavedAccounts: (state, action) => {
      state.savedAccounts = state.savedAccounts.filter(
        account => account.id !== action.payload,
      );
    },
    clearSavedAccounts: state => {
      state.savedAccounts = [];
    },
    resetAuthState: state => {
      logger.debug('Auth state reset', { context: 'authSlice' });
      return {
        ...initialState,
        language: state.language,
        savedAccounts: state.savedAccounts,
      };
    },
    updateProfile: (state, action) => {
      state.User = {...state.User, ...action.payload.user};
      state.company = {...state.company, ...action.payload.company};
    },
  },
});

export const {
  setUser,
  setUserId,
  setLoggedIn,
  setRememberMe,
  setRole,
  setLanguage,
  setLocation,
  setAuthState,
  resetAuthState,
  setSavedAccounts,
  removeSavedAccounts,
  clearSavedAccounts,
  setPlanDetails,
  setPlanDetailsData,
  setPlanDetailsLoading,
  setPlanDetailsError,
  clearPlanDetails,
  setTrail,
  logout,
  updateProfile,
  setDepartment,
  setOnboardingShown
} = authSlice.actions;
export default authSlice.reducer;
