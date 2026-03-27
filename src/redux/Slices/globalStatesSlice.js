import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const initialState = {
  workers: [],
  departments: [],
  absenceTypes: [],
  attendanceCounters: {},
};

const globalStatesSlice = createSlice({
  name: 'globalStatesSlice',
  initialState,
  reducers: {
    setWorkers: (state, action) => {
      state.workers = Array.isArray(action.payload) ? action.payload : [];
    },
    setDepartments: (state, action) => {
      state.departments = Array.isArray(action.payload) ? action.payload : [];
    },
    setAbsenceTypes: (state, action) => {
      state.absenceTypes = Array.isArray(action.payload) ? action.payload : [];
    },
    setAttendanceCounters: (state, action) => {
      state.attendanceCounters = action.payload || {};
    },
  },
});

export const {setWorkers, setDepartments, setAbsenceTypes, setAttendanceCounters} = globalStatesSlice.actions;
export default globalStatesSlice.reducer;
