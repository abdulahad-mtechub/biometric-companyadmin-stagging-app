import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import logger from '@utils/logger';

const MarkValidPunchBottomSheet = ({
  refRBSheet,
  onSave,
  onCancel,
  bgColor,
  heading,
  subheading,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const backgroundColor = bgColor
    ? bgColor
    : isDarkMode
    ? Colors.darkTheme.secondryColor
    : Colors.lightTheme.backgroundColor;

  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  const styles = dynamicStyles(isDarkMode,Colors);

  const handleSave = () => {
if (comments.trim() ==='') {
  setError('Please enter comment');
  return;
}

    if (onSave) {
      onSave(comments);
    }
    refRBSheet.current.close();
    setComments(''); // Reset comments after save
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    refRBSheet.current.close();
    setComments(''); // Reset comments on cancel
  };

  return (
    <RBSheet
      ref={refRBSheet}
      height={hp('45%')}
      openDuration={300}
      draggable={false}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopLeftRadius: wp('6%'),
          borderTopRightRadius: wp('6%'),
          backgroundColor: backgroundColor,
          paddingHorizontal: wp('6%'),
          paddingTop: hp('3%'),
          paddingBottom: hp('2%'),
        },
      }}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t(heading)}</Text>
          <Text style={styles.subtitle}>
            {t(subheading)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Icon
            name="x"
            size={RFPercentage(3)}
            color={theme.secondryTextColor}
          />
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsLabel}>{t('Comment')}</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: theme.BorderGrayColor,
              color: theme.primaryTextColor,
              backgroundColor: isDarkMode 
                ? Colors.darkTheme.input 
                : Colors.lightTheme.backgroundColor,
            },
          ]}
          placeholder={t('Enter your comments here...')}
          placeholderTextColor={theme.secondryTextColor}
          value={comments}
          onChangeText={setComments}
          multiline={true}
          textAlignVertical="top"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, {color: theme.secondryBtn.BtnColor}]}>
            {t('Cancel')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('Save')}</Text>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );
};

const dynamicStyles = (isDarkMode,Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp('3%'),
    },
    title: {
      fontSize: RFPercentage(2.5),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('0.5%'),
    },
    subtitle: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    commentsSection: {
      flex: 1,
      marginBottom: hp('3%'),
    },
    commentsLabel: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp('1%'),
    },
    textInput: {
      borderWidth: 1,
      borderRadius: wp('2%'),
      paddingHorizontal: wp('4%'),
      paddingVertical: hp('1.5%'),
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsRegular,
      minHeight: hp('15%'),
      maxHeight: hp('20%'),
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp('4%'),
    },
    cancelButton: {
      flex: 1,
      paddingVertical: hp('1%'),
      borderRadius: wp('3%'),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.secondryBtn.BtnColor
        : Colors.lightTheme.secondryBtn.BtnColor,
    },
    saveButton: {
      flex: 1,
      paddingVertical: hp('1%'),
      borderRadius: wp('3%'),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
    },
    cancelButtonText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
    },
    saveButtonText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsMedium,
      color: isDarkMode
      ? Colors.darkTheme.primaryBtn.TextColor
      : Colors.lightTheme.primaryBtn.TextColor,
    },
    errorText: {
      color: 'red',
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(1.5),
      marginTop: hp(0.5)
    },
  });

export default MarkValidPunchBottomSheet;