import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  region: '',
  state: '',
  country: '',
  city: '',
  postalCode: '',
  address: '',
  latitude: null,
  longitude: null,
};

const updateLocationSlice = createSlice({
  name: 'UpdateLocation',
  initialState: {
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    region: '',
    // Add any additional fields you need
  },
  reducers: {
    updateLocation: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearLocation: state => {
      return initialState; // or your initial state
    },
  },
});

export const {updateLocationField, updateLocation, clearLocation} =
  updateLocationSlice.actions;
export default updateLocationSlice.reducer;
