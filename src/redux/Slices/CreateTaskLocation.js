import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  lat: 0,
  lng: 0,
  address: '',
};

const CreateTasklocation = createSlice({
  name: 'CreateTasklocation',
  initialState,
  reducers: {
    setCreateTaskLocation: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const {setCreateTaskLocation} = CreateTasklocation.actions;

export default CreateTasklocation.reducer;
