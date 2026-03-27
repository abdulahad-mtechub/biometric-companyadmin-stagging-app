import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  serverRunning: true,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setServerRunning: (state, action) => {
      state.serverRunning = action.payload;
    },
  },
});

export const {setServerRunning} = errorSlice.actions;
export default errorSlice.reducer;
