import {createSlice} from '@reduxjs/toolkit';
import logger from '@utils/logger';

const darkTheme = {
  backgroundColor: '#040B11',
  secondryColor: '#0D1B2A',
  primaryColor: '#006EC2',
  primaryTextColor: '#ebebf0',
  secondryTextColor: '#a4a4ad',
  QuaternaryText: '#8B8D97',
  BorderGrayColor: '#35383F',
  primaryBtn: {
    BtnColor: '#006EC2',
    TextColor: '#FFFFFF',
  },
  secondryBtn: {
    BtnColor: '#006EC2',
    TextColor: '#006EC2',
  },
  iconColor: '#FFFFFF',
  cardBgColor: 'rgba(255, 255, 255, 0.3)',
  input: '#0D1B2A',

  cardBackground: '#1E1E1E',
  readBackground: '#2A2A2A',
  unreadBackground: '#1E1E1E',
  readDot: '#4CAF50',
  taskAssignedColor: '#4CAF50',
  checkInColor: '#2196F3',
  checkOutColor: '#FF9800',
  taskCompleteColor: '#9C27B0',
  deadlineMissedColor: '#F44336',
};

const lightTheme = {
  backgroundColor: '#ffffff',
  secondryColor: '#F1F2F3',
  primaryColor: '#006EC2',
  primaryTextColor: '#2E2929',
  secondryTextColor: '#5E5E5E',
  QuaternaryText: '#8B8D97',
  BorderGrayColor: '#E3E3ED',

  primaryBtn: {
    BtnColor: '#006EC2',
    TextColor: '#FFFFFF',
  },
  secondryBtn: {
    BtnColor: '#006EC2',
    TextColor: '#006EC2',
  },
  iconColor: '#827F7F',
  cardBgColor: 'rgba(67, 99, 105, 0.2)',
  input: '#F5F6FA',

  cardBackground: '#F9F9F9',
  readBackground: '#F5F5F5',
  unreadBackground: '#FFFFFF',
  readDot: '#4CAF50',
  taskAssignedColor: '#4CAF50',
  checkInColor: '#2196F3',
  checkOutColor: '#FF9800',
  taskCompleteColor: '#9C27B0',
  deadlineMissedColor: '#F44336',
};
const Colors = {
  darkTheme,
  lightTheme,
  error: '#F87168',
  success: '#0CC25F',
  transparent: 'transparent',
};
const initialState = {
  isDarkMode: false, // Set the default theme here (false = Light Theme, true = Dark Theme),
  isThemeApplied: false,
  Colors: Colors,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setIsThemeApplied: (state, action) => {
      state.isThemeApplied = action.payload;
    },
    setColors: (state, action) => {
      const newColor = action.payload; // hex color passed like "#FF0000"


      const updateColor = theme => ({
        ...theme,
        primaryColor: newColor,
        primaryBtn: {
          ...theme.primaryBtn,
          BtnColor: newColor,
        },
        secondryBtn: {
          ...theme.secondryBtn,
          BtnColor: newColor,
          TextColor: newColor,
        },
      });

      state.Colors.darkTheme = updateColor(state.Colors.darkTheme);
      state.Colors.lightTheme = updateColor(state.Colors.lightTheme);
    },
  },
});

export const {toggleTheme, setDarkMode, setIsThemeApplied, setColors} =
  themeSlice.actions;
export default themeSlice.reducer;
