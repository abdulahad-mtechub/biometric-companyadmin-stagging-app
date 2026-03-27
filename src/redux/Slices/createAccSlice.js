import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  payload: {},
  token: '',
};

const createAccSlice = createSlice({
  name: 'createAccSlice',
  initialState,
  reducers: {
    setPayload: (state, action) => {
      state.payload = {
        ...state.payload,
        ...action.payload,
      };
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const {setPayload, setToken} = createAccSlice.actions;
export default createAccSlice.reducer;
