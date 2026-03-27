import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    features: [],
  },
  reducers: {
    setFeatures: (state, action) => {
      state.features = action.payload;
    },
  },
});

export const {setFeatures} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
