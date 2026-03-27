import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import CustomButton from '@components/Buttons/customButton';
import CustomSwitch from '@components/Buttons/CustomSwitch';
import TxtInput from '@components/TextInput/Txtinput';
import logger from '@utils/logger';

const AddDepartmentBottomSheet = ({
  refRBSheet,
  height,
  bgColor,
  sheetTitle = 'Add Department',
  onSubmit, // Keep for backward compatibility
  is_active,
  selectedDep,
  setSelectedDep,
  isDepEdit,
  onEdit,
  onAdd,
}) => {
  const { isDarkMode,Colors } = useSelector(store => store.theme);
  const { t } = useTranslation();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isDepEdit) {
      setName('');
    }
  }, [isDepEdit]);

  const backgroundColor = bgColor
    ? bgColor
    : isDarkMode
    ? Colors.darkTheme.secondryColor
    : Colors.lightTheme.backgroundColor;

  const styles = dynamicStyles(isDarkMode,Colors);


  const handleSubmit = () => {
    Keyboard.dismiss();
    
    // Close the sheet
    refRBSheet.current.close();
    
    // Handle submission based on mode
    if (isDepEdit) {
      if (onEdit && selectedDep) {
        onEdit(selectedDep.id, selectedDep.is_active, selectedDep.name);
      }
    } else {
      if (onAdd && name.trim()) {
        onAdd(name.trim());
      }
      // Clear name after adding
      setName('');
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    refRBSheet.current.close();
    // Reset name when closing in add mode
    if (!isDepEdit) {
      setName('');
    }
  };

  // Validation
  const isSubmitDisabled = isDepEdit 
    ? !selectedDep?.name?.trim() 
    : !name.trim();

  return (
    <RBSheet
      ref={refRBSheet}
      height={height ? height : hp('45%')} // Increased height for keyboard
      openDuration={300}
      draggable={false}
      closeOnPressMask={true}
      animationType="slide"
      customStyles={{
        container: {
          borderTopLeftRadius: wp('6%'),
          borderTopRightRadius: wp('6%'),
          backgroundColor: backgroundColor,
          paddingHorizontal: wp('5%'),
          paddingTop: hp('2%'),
        },
        wrapper: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t(isDepEdit ? 'Edit Department' : sheetTitle)}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon
                name="x"
                size={RFPercentage(3)}
                color={
                  isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor
                }
              />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <TxtInput
              value={isDepEdit ? selectedDep?.name || '' : name}
              placeholder={t('Department Name')}
              containerStyle={{ marginBottom: hp(2) }}
              onChangeText={text =>
                isDepEdit
                  ? setSelectedDep({ ...selectedDep, name: text })
                  : setName(text)
              }
              multiline={false} // Changed to false for better UX
              autoCapitalize="words"
              returnKeyType="done"
              blurOnSubmit={true}
            />
            
            {isDepEdit && selectedDep && (
              <View style={styles.switchContainer}>
                <Text style={styles.label}>{t('Active')}</Text>
                <CustomSwitch
                  value={selectedDep.is_active}
                  onValueChange={value => {
                    logger.log('Switch value changed:', value, { context:'AddDepartmentBottomSheet' });
                    setSelectedDep({
                      ...selectedDep,
                      is_active: value,
                    });
                  }}
                />
              </View>
            )}

            <CustomButton
              containerStyle={[
                styles.btn,
                isSubmitDisabled && styles.btnDisabled
              ]}
              text={isDepEdit ? t('Update') : t('Add')}
              textStyle={[
                styles.btnText,
                isSubmitDisabled && styles.btnTextDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </RBSheet>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      paddingBottom: hp(2),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('2%'),
    },
    title: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    btn: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp('90%'),
      alignSelf: 'center',
      marginTop: hp(2),
    },
    btnDisabled: {
      opacity: 0.5,
    },
    btnText: {
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
    },
    btnTextDisabled: {
      opacity: 0.7,
    },
    label: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
  });

export default AddDepartmentBottomSheet;