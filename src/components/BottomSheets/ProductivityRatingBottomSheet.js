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
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import TxtInput from '@components/TextInput/Txtinput';
import CustomButton from '@components/Buttons/customButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import logger from '@utils/logger';

const ProductivityRatingBottomSheet = forwardRef(({onSubmit}, ref) => {
  const bottomSheetRef = useRef(null);
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const [selectedRating, setSelectedRating] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const styles = dynamicStyles(isDarkMode, Colors);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.open(),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleCancel = () => {
    bottomSheetRef.current?.close();
    resetForm();
  };

  const resetForm = () => {
    setSelectedRating(null);
    setNotes('');
    setRatingError('');
  };

  const handleSubmit = async () => {
    if (!selectedRating) {
      setRatingError(t('Please select a rating'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating, notes.trim() || undefined);
      resetForm();
      bottomSheetRef.current?.close();
    } catch (error) {
      logger.error('Productivity rating error:', error, { context:'ProductivityRatingBottomSheet' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingOption = ({rating, label, icon, iconColor}) => {
    const isSelected = selectedRating === rating;
    return (
      <TouchableOpacity
        style={[
          styles.ratingOption,
          isSelected && styles.ratingOptionSelected,
          
        ]}
        onPress={() => {
          setSelectedRating(rating);
          setRatingError('');
        }}>
        
        <Text
          style={[
            styles.ratingLabel,
            isSelected && {color: Colors.darkTheme.primaryColor, fontFamily: Fonts.PoppinsSemiBold},
          ]}>
          {t(label)}
        </Text>
        {isSelected && (
          <View style={[styles.checkmark, {backgroundColor: iconColor}]}>
            <Icon name="check" size={RFPercentage(1.5)} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={hp(60)}
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
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add Productivity Rating')}</Text>
        </View>

        {/* Rating Selection */}
        <View style={styles.ratingContainer}>
          <Text style={styles.sectionLabel}>{t('Select Rating')}</Text>
          <View style={styles.ratingOptions}>
            <RatingOption
              rating="good"
              label="Good"
              icon="thumb-up"
              iconColor="#4CAF50"
            />
            <RatingOption
              rating="bad"
              label="Bad"
              icon="thumb-down"
              iconColor="#F44336"
            />
          </View>
          {ratingError ? (
            <Text style={styles.errorText}>{ratingError}</Text>
          ) : null}
        </View>

        {/* Notes Input */}
        <View style={{marginTop: hp(2)}}>
          <Text style={styles.sectionLabel}>{t('Notes (Optional)')}</Text>
          <TxtInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('Add notes about this rating...')}
            multiline
            numberOfLines={4}
            containerStyle={styles.notesInput}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            text={t('Cancel')}
            onPress={handleCancel}
            containerStyle={[styles.cancelButton]}
            textStyle={[
              styles.cancelButtonText,
              {color: Colors.darkTheme.primaryColor},
            ]}
          />
          <CustomButton
            text={isSubmitting ? t('Submitting...') : t('Submit Rating')}
            onPress={handleSubmit}
            disabled={isSubmitting}
            containerStyle={[
              styles.submitButton,
              isSubmitting && {opacity: 0.7},
            ]}
            textStyle={styles.submitButtonText}
            rightComponent={
              isSubmitting ? (
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

export default ProductivityRatingBottomSheet;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(2),
    },
    title: {
      fontSize: RFPercentage(2.3),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    sectionLabel: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1),
    },
    ratingContainer: {
      marginTop: hp(1),
    },
    ratingOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    ratingOption: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: hp(2),
      marginHorizontal: wp(1),
      borderRadius: wp(3),
      borderWidth: 2,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    ratingOptionSelected: {
      borderWidth: 2,
      borderColor: isDarkMode?Colors.darkTheme.primaryColor:Colors.lightTheme.primaryColor
    },
    ratingIconContainer: {
      width: wp(14),
      height: wp(14),
      borderRadius: wp(7),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    ratingLabel: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    checkmark: {
      position: 'absolute',
      top: hp(1),
      right: wp(2),
      width: wp(5),
      height: wp(5),
      borderRadius: wp(2.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    notesInput: {
      minHeight: hp(12),
    },
    errorText: {
      fontSize: RFPercentage(1.4),
      fontFamily: Fonts.PoppinsRegular,
      color: '#F44336',
      marginTop: hp(0.5),
    },
    buttonContainer: {
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
    submitButton: {
      flex: 2,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
    },
    submitButtonText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsSemiBold,
      color: '#fff',
    },
  });
