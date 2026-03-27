import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import TxtInput from '@components/TextInput/Txtinput';
import CustomButton from '@components/Buttons/customButton';
import {Svgs} from '@assets/Svgs/Svgs';
import logger from '@utils/logger';

const DeleteAccountBottomSheet = forwardRef(({onDelete}, ref) => {
  const bottomSheetRef = useRef(null);
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const styles = dynamicStyles(isDarkMode, Colors);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.open(),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleCancel = () => {
    bottomSheetRef.current?.close();
    setDeletePassword('');
    setDeleteReason('');
    setPasswordError('');
    setReasonError('');
  };

  const handleDelete = async () => {
    // Validate password
    if (!deletePassword.trim()) {
      setPasswordError('Password is required');
      return;
    }
    if (!deleteReason.trim()) {
      setReasonError('Reason is required');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(deletePassword, deleteReason.trim() || undefined);
      // If onDelete succeeds, reset the form
      setDeletePassword('');
      setDeleteReason('');
      setPasswordError('');
      setReasonError('');
      bottomSheetRef.current?.close();
    } catch (error) {
      // Error handling is done in parent component
      logger.error('Delete account error:', error, { context:'DeleteAccountBottomSheet' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={hp(52)}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          backgroundColor: isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.backgroundColor,
          borderTopLeftRadius: wp(5),
          borderTopRightRadius: wp(5),
        },
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{flex: 1, paddingHorizontal: wp(5)}}>
        {/* Header */}
        <View style={styles.deleteSheetHeader}>
          <Text style={styles.deleteSheetTitle}>{t('Delete Account')}</Text>
        </View>

        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Svgs.deleteAcc />
        </View>

        {/* Password Input */}
        <View style={{marginTop: hp(2)}}>
          <TxtInput
            value={deletePassword}
            onChangeText={text => {
              setDeletePassword(text);
              if (passwordError) setPasswordError('');
            }}
            placeholder="Enter Password"
            secureTextEntry
            error={passwordError}
            svg={
              <Icon
                name="lock"
                size={RFPercentage(2.5)}
                color={
                  isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor
                }
              />
            }
          />
         
        </View>

        {/* Reason Input */}
        <View style={{marginTop: hp(2)}}>
          <TxtInput
            value={deleteReason}
            onChangeText={text => {
              setDeleteReason(text);
              setReasonError('');
            }}
            placeholder="Reason for deletion"
            multiline
            numberOfLines={4}
            svg={
              <Icon
                name="comment"
                size={RFPercentage(2.5)}
                color={
                  isDarkMode
                    ? Colors.darkTheme.secondryTextColor
                    : Colors.lightTheme.secondryTextColor
                }
              />
            }
            error={reasonError}
          />
         
        </View>

        {/* Buttons */}
        <View style={styles.deleteButtonContainer}>
          <CustomButton
            text="Cancel"
            onPress={handleCancel}
            containerStyle={[styles.cancelButton]}
            textStyle={[
              styles.cancelButtonText,
              {color: Colors.darkTheme.primaryColor},
            ]}
          />
          <CustomButton
            text={isDeleting ? 'Deleting...' : 'Delete Account'}
            onPress={handleDelete}
            disabled={isDeleting}
            containerStyle={[
              styles.deleteButton,
              {backgroundColor: '#F44336'},
              isDeleting && {opacity: 0.7},
            ]}
            textStyle={styles.deleteButtonText}
            rightComponent={
              isDeleting ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                  style={{marginLeft: wp(2)}}
                />
              ) : null
            }
          />
        </View>
      </ScrollView>
    </RBSheet>
  );
});

export default DeleteAccountBottomSheet;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    deleteSheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(2),
    },
    deleteSheetTitle: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    warningContainer: {
      alignItems: 'center',
    },
    warningText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsMedium,
      color: '#F44336',
      textAlign: 'center',
      marginTop: hp(2),
    },
    errorText: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsRegular,
      color: '#F44336',
      marginTop: hp(0.5),
      marginLeft: wp(2),
    },
    deleteButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: hp(3),
      marginTop: hp(2),
    },
    cancelButton: {
      flex: 1,
      marginRight: wp(2),
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.darkTheme.primaryColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    deleteButton: {
      flex: 2,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsSemiBold,
      color: '#fff',
    },
  });
