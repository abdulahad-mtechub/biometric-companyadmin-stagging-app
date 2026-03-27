import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import { useSelector } from 'react-redux';
import logger from '@utils/logger';

const Loader = ({color, size, loading, style}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);

  return (
    <ActivityIndicator
      size={size || 'small'}
      color={color ?? Colors.darkTheme.primaryColor}
      style={[{alignSelf: 'center'}, style]}
    />
  );
};

export default Loader;

const styles = StyleSheet.create({});
