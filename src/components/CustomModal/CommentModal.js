import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { Fonts } from '@constants/Fonts';
import { pxToPercentage } from '@utils/responsive';
import CustomButton from '@components/Buttons/customButton';
import TxtInput from '@components/TextInput/Txtinput';
import logger from '@utils/logger';
import { TextInput } from 'react-native-gesture-handler';

const CommentModal = ({
  isVisible,
  onClose,
  heading,
  onSubmit,
  comment,
  setComment,
}) => {
  const {isDarkMode,Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();

  const [error, setError] = useState('');

  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'center',
      margin: 0,
    },
      input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderRadius: wp(2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.input
        : Colors.lightTheme.backgroundColor,
    },

    container: {
      alignItems: 'center',
    },
    minicontainer: {
      paddingVertical: wp(5),
      borderRadius: 20,
      width: '98%',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(5),
    },
    label: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(16)),
    },
    applyBtn: {
      backgroundColor: Colors.lightTheme.primaryColor,
      borderRadius: wp(4),
      alignItems: 'center',
      paddingVertical: hp(1.3),
      marginTop: hp(2),
    },
    applyText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.6),
      color: '#fff',
    },
    error: {
      fontFamily: Fonts.PoppinsRegular,
      color: Colors.error,
      fontSize: RFPercentage(pxToPercentage(13)),
    },
     comments: {
      height: hp(10),
      textAlignVertical: 'top',
      marginTop: hp(1.5),
    },
  });

  const validate = () => {
    if (!comment.trim()) {
      setError('Please enter a comment/reason.');
      return false;
    }
    setError('');
    return true;
  };

  // const handleSubmit = async () => {
  //   if (!validate()) return;

  //   const payload = {comment: comment.trim()};

  //   try {
  //     const {ok, data} = await fetchApis(
  //       `${baseUrl}/tickets/${id}/comment`,
  //       'POST',
  //       setLoading,
  //       payload,
  //       null,
  //       {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     );

  //     if (ok && !data.error) {
  //       setComment('');
  //       onClose();
  //     } else {
  //     }
  //   } catch (err) {
  //   }
  // };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.minicontainer}>
          <Text style={styles.label}>{t(heading)}</Text>
          <Text style={[styles.label, {fontSize: RFPercentage(1.7)}]}>{t('Comment')}</Text>

         <TextInput
            style={[styles.input, styles.comments]}
            placeholder="Comment/Reason"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <CustomButton
            text={'Submit'}
            containerStyle={styles.applyBtn}
            onPress={() => {
              if (!validate()) return;

              onSubmit();
            }}
            textStyle={styles.applyText}
            // isLoading={loading}
            // disabled={loading}
            // loaderColor={'#fff'}
            // LoaderSize={25}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
