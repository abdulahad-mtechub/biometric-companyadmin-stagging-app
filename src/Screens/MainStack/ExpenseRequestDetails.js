import moment from 'moment';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Images} from '@assets/Images/Images';
import {Svgs} from '@assets/Svgs/Svgs';
import CustomButton from '@components/Buttons/customButton';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import CommentModal from '@components/CustomModal/CommentModal';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, capitalize, fetchApis, isValidUrl} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';
import {SCREENS} from '@constants/Screens';

const ExpenseRequestDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const {item, type} = route.params;
  const [selectedAction, setSelectedAction] = useState(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(capitalize(item?.status));

  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
const RequestDetails = [
  { label: 'Employee Name', value: item?.worker?.name },
  { label: 'Amount', value: `$${item?.amount}` },
  {
    label: 'Date Of Expense',
    value: moment(item?.date_of_expense).format('DD MMM, YYYY'),
  },
  {
    label: 'Description',
    value: item?.description,
  },

  ...(item?.decision_note
    ? [
        {
          label: 'Decision Note',
          value: item.decision_note,
        },
      ]
    : []),

  ...(item?.decided_at
    ? [
        {
          label: 'Decided At',
          value: moment(item.decided_at).format('DD MMM, YYYY'),
        },
      ]
    : []),
];

  console.log(item);

  const handleReject = useCallback(() => {
    setSelectedAction('Reject');
    setIsModalVisible(true);
  }, []);

  const handleAccept = useCallback(() => {
    setSelectedAction('Approved');
    setIsModalVisible(true);
  }, []);

  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };


  const ModalContent = useMemo(() => {
    if (selectedAction === 'Approved') {
      return {
        heading: 'Mark payment as Approved',
        url: `${baseUrl}/company-admin/expenses/${item.id}/approve`,
      };
    } else if (selectedAction === 'Reject') {
      return {
        heading: 'Mark payment as Rejected',
        url: `${baseUrl}/company-admin/expenses/${item.id}/reject`,
      };
    }
  }, [selectedAction]);

  const handleSubmit = async () => {
    const payload = {decision_note: comment.trim()};
    setIsModalVisible(false);

    try {
      const {ok, data} = await fetchApis(
        ModalContent.url,
        'PATCH',
        setLoading,
        payload,
        null,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );

      ApiResponse(showAlert, data, language);
      if (ok && !data.error) {
        setComment('');
        selectedAction === 'Approved'
          ? setStatus('Approved')
          : setStatus('Rejected');
      } else {
      }
    } catch (err) {
      logger.error('Local submit error:', err, {
        context: 'ExpenseRequestDetails',
      });
      showAlert('Something went wrong while submitting comment.', 'error');
    }
  };

  const [imgSource, setImgSource] = useState(
    isValidUrl(item.receipt_url) ? {uri: item.receipt_url} : null,
  );
  const [isDocumentPreviewVisible, setIsDocumentPreviewVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView style={{flex: 1}}>
        <StackHeader
          title={'Expense Details'}
          headerTxtStyle={styles.headerTxtStyle}
          onBackPress={() => navigation.goBack()}
          headerStyle={styles.headerStyle}
        />

        <View style={styles.statusContainer}>
          <WorkerStatus
            name={'Status'}
            status={status}
            nameTextStyle={styles.statusText}
          />
          <View style={styles.rowSb}>
            <Text style={[styles.statusText]}>{t('Date')}</Text>
            <Text style={[styles.statusValue]}>
              {moment(item.created_at).format('DD MMM, YYYY')}
            </Text>
          </View>
        </View>

        <RequestDetailsCard
          details={RequestDetails}
          headerTitle={'Payment Details'}
        />

        {item.receipt_url && (
          <View style={styles.sectionBox}>
            <View style={styles.receiptHeader}>
              <Text style={styles.sectionTitle}>{t('Expense Proof')}</Text>
            </View>

            {isImageFile(item.receipt_url) ? (
              <Image source={imgSource} style={styles.receiptImage} />
            ) : (
              <View style={styles.uploadContainer}>
                <TouchableOpacity
                  onPress={() => setIsDocumentPreviewVisible(true)}
                  style={{
                    padding: wp(4),
                    backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                    borderRadius: wp(10),
                  }}>
                  <Svgs.pdf />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {status === 'Pending' && (
        <View style={[styles.btnContainer, styles.rowBtnContainer]}>
          <CustomButton
            text="Approved"
            onPress={handleAccept}
            textStyle={styles.continueButtonText}
            containerStyle={[
              styles.continueButton,
              {
                width: wp(40),
              },
            ]}
            loading={selectedAction === 'VALID' && loading}
          />
          <CustomButton
            text="Rejected"
            onPress={handleReject}
            textStyle={styles.continueButtonText}
            containerStyle={[
              styles.continueButton,
              {
                width: wp(40),
              },
            ]}
            loading={selectedAction === 'INVALID' && loading}
          />
        </View>
      )}
      {status === 'Approved' && (
        <View style={[styles.btnContainer]}>
          <CustomButton
            text="Mark as Paid"
            onPress={() =>
              navigation.navigate(SCREENS.ADDEXPENSERECORD, {item})
            }
            textStyle={styles.continueButtonText}
            containerStyle={[styles.continueButton]}
          />
        </View>
      )}

      <CommentModal
        isVisible={isModalVisible}
        comment={comment}
        setComment={setComment}
        heading={ModalContent?.heading}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onSubmit={handleSubmit}
      />

      <DocumentViewModal
        visible={isDocumentPreviewVisible}
        documentUrl={item?.receipt_url}
        onClose={() => setIsDocumentPreviewVisible(false)}
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
      marginBottom: hp(1.5),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
      marginLeft: wp(4),
    },
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginVertical: wp(1.5),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(16)),
    },
    statusValue: {
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      width: wp(40),
      textAlign: 'right',
    },

    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: hp(0.4),
    },
    label: {
      fontFamily: Fonts.PoppinsRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      width: '50%',
    },
    valueText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      width: '50%',
      textAlign: 'right',
    },
    receiptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    receiptImage: {
      width: '100%',
      height: hp(30),
      resizeMode: 'contain',
      marginBottom: hp(2),
    },
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
    sectionBox: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      marginTop: hp(2),
      borderRadius: wp(2),
      padding: wp(4),
    },
    sectionTitle: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginBottom: hp(1.5),
    },
    ReciptContainer: {
      backgroundColor: '#f6f6f6',
      paddingLeft: wp(9),
      paddingVertical: wp(3),
    },
    receiptValue: {
      textAlign: 'left',
      color: '#007860',
    },

    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: wp(4),
      paddingHorizontal: wp(3),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    rowBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
      elevation: 2,
    },
    continueButtonText: {
      fontSize: RFPercentage(1.6),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
  });
export default ExpenseRequestDetails;
