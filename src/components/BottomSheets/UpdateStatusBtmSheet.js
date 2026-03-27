import React, {useState, useMemo, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import {useTranslation} from 'react-i18next';
import CustomDropDown from '@components/DropDown/CustomDropDown';

export default function UpdateStatusBtmSheet({
  refRBSheet,
  onApplyFilters,
  height = hp(33),
  dropdownData = {
    statusOptions: [],
  },
  currentStatus = null,
}) {
  const {isDarkMode} = useSelector(state => state.theme);
  const {t} = useTranslation();

  const [selectedStatus, setSelectedStatus] = useState(null);

  const styles = useMemo(() => dynamicStyles(isDarkMode), [isDarkMode]);

  // Filter dropdown options based on current status
  const filteredStatusOptions = React.useMemo(() => {
    if (!currentStatus) return dropdownData.statusOptions;

    // If current status is 'active', only show 'inactive'
    if (currentStatus === 'active') {
      return dropdownData.statusOptions.filter(option => option.value === 'inactive');
    }
    // If current status is 'inactive', only show 'active'
    if (currentStatus === 'inactive') {
      return dropdownData.statusOptions.filter(option => option.value === 'active');
    }
    // For other statuses, show both options
    return dropdownData.statusOptions;
  }, [dropdownData.statusOptions, currentStatus]);

  const handleUpdateStatus = useCallback(() => {
    onApplyFilters({
      status: selectedStatus?.value || null,
    });
    refRBSheet.current.close();
    setSelectedStatus(null);
  }, [selectedStatus, onApplyFilters, refRBSheet]);

  const handleClose = useCallback(() => {
    setSelectedStatus(null);
  }, []);

  return (
    <RBSheet
      ref={refRBSheet}
      height={height}
      openDuration={300}
      draggable={true}
      closeOnPressMask
      onClose={handleClose}
      customStyles={{
        container: {
          borderTopLeftRadius: wp(5),
          borderTopRightRadius: wp(5),
          backgroundColor: isDarkMode
            ? Colors.darkTheme.backgroundColor
            : Colors.lightTheme.backgroundColor,
          padding: wp(4),
        },
      }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <CustomDropDown
          data={filteredStatusOptions}
          selectedValue={selectedStatus}
          onValueChange={setSelectedStatus}
          placeholder="Status"
          search={false}
        />

        <TouchableOpacity style={styles.applyBtn} onPress={handleUpdateStatus}>
          <Text style={styles.applyText}>{t('Update')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </RBSheet>
  );
}

const createStyles = isDarkMode =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    applyBtn: {
      backgroundColor: Colors.lightTheme.primaryColor,
      borderRadius: wp(4),
      alignItems: 'center',
      paddingVertical: hp(1.3),
      marginTop: hp(3),
      marginBottom: hp(1),
    },
    applyText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: '#fff',
    },
  });

const dynamicStyles = (() => {
  const cache = new Map();
  return isDarkMode => {
    if (!cache.has(isDarkMode)) {
      cache.set(isDarkMode, createStyles(isDarkMode));
    }
    return cache.get(isDarkMode);
  };
})();
