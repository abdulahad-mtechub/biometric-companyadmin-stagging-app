import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {pxToPercentage} from '@utils/responsive';
import {Colors} from '@constants/themeColors';
import {Fonts} from '@constants/Fonts';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CustomDropDown from '@components/DropDown/CustomDropDown';
import {fetchApis} from '@utils/Helpers';
import TxtInput from '@components/TextInput/Txtinput';
import CustomButton from '@components/Buttons/customButton';
import {useTranslation} from 'react-i18next';
import {useAlert} from '@providers/AlertContext';
import {baseUrl} from '@constants/urls';
import logger from '@utils/logger';

const TaskStatusChangeModal = ({isVisible, onClose, taskId, token,onSubmit}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [comment, setComment] = useState('');
  const {showAlert} = useAlert();
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();
  const [formErrors, setFormErrors] = useState({
    status: '',
    comment: '',
  });

  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'center',
      margin: 0,
    },
    container: {
      // paddingVertical:wp(pxToPercentage(20)) ,
      alignItems: 'center',
      // borderRadius: 20,
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
      //   marginTop: hp(2),
      marginTop: hp(2),
    },
    applyText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2.2),
      color: '#fff',
    },
    error: {
      fontFamily: Fonts.PoppinsRegular,
      color: Colors.error,
      fontSize: RFPercentage(pxToPercentage(13)),
    },
  });

  const validate = () => {
    let isValid = true;

    if (!selectedStatus) {
      setFormErrors(prev => ({
        ...prev,
        status: 'Please select any status.',
      }));
      isValid = false;
    } else {
      setFormErrors(prev => ({
        ...prev,
        status: '',
      }));
    }

    if (!comment.trim()) {
      setFormErrors(prev => ({
        ...prev,
        comment: 'Comment/Reason is required.',
      }));
      isValid = false;
    } else {
      setFormErrors(prev => ({
        ...prev,
        comment: '',
      }));
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
  

    const payload = {
      [selectedStatus.value === 'complete' ? 'notes' : 'reason']:
        comment.trim(),
    };

    try {
      const {ok, data} = await fetchApis(
        `${baseUrl}/task-management/admin/tasks/${taskId}/${selectedStatus.value}`,
        'POST',
        setLoading,
        payload,
        null,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      logger.log(data, payload, { context:'TaskStatusChangeModal' });

      if (ok && !data.error) {
        showAlert(data.message, 'success');
        onClose();
        setSelectedStatus(null);
        setComment('');
        onSubmit();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err) {
      logger.error('Local submit error:', err, { context:'TaskStatusChangeModal' });
      showAlert('Something went wrong', 'error');
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <View style={styles.minicontainer}>
          <Text style={styles.label}>{t('Change Status')}</Text>

          <CustomDropDown
            data={[
              {value: 'cancel', label: 'Cancelled'},
              {value: 'complete', label: 'Completed'},
            ]}
            selectedValue={selectedStatus}
            onValueChange={setSelectedStatus}
            placeholder="Status"
            containerStyle={{marginBottom: 0}}
            search={false}
            error={formErrors.status}
          />
          {/* {formErrors.status && (
            <Text style={styles.error}>{formErrors.status}</Text>
          )} */}

          <Text style={[styles.label, {marginTop: hp(1)}]}>{t('Comment/Reason')}</Text>

          <TxtInput
            placeholder="Comment/Reason"
            value={comment}
            onChangeText={setComment}
            error={formErrors.comment}
          />
          
          <CustomButton
            text={'Update'}
            containerStyle={styles.applyBtn}
            onPress={handleSubmit}
            textStyle={styles.applyText}
            isLoading={loading}
            disabled={loading}
            loaderColor={'#fff'}
            LoaderSize={25}
            
          />
        </View>
      </View>
    </Modal>
  );
};

export default TaskStatusChangeModal;
