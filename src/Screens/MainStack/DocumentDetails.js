import moment from 'moment';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Svgs} from '@assets/Svgs/Svgs';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import WorkerStatus from '@components/Cards/WorkerStatus';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import {ApiResponse, capitalize, fetchApis} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';

const DocumentDetails = ({route, navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;
  const item = route.params?.item;
  const type = route.params?.type;
  const [loading, setLoading] = useState(false);
  const {showAlert} = useAlert();

  const {token, language} = useSelector(store => store.auth);

  const btmSheetRef = useRef(null);
  const status = item?.status;
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const styles = dynamicStyles(isDarkMode, theme, Colors);

  const accessMode = item?.access_mode ? capitalize(item?.access_mode) : null;
  const subject = item?.subject || '--';

  const DocumentDetail = [
    {label: 'Document Name', value: item?.name},
    {label: 'Description', value: item?.description},
  ];

  const workerDetails = [
    {label: 'Name', value: item?.worker?.name},
    {label: 'Email', value: item?.worker?.email},
  ];

  const CompanyPolicyDetail = [
    {label: 'Document Name', value: item?.name},
    {
      label: 'Description',
      value: item?.description,
    },
    {
      label: 'Subject',
      value: subject,
    },
    {
      label: 'Access Mode',
      value: accessMode === 'All' ? t('All Employees') : 'Specific',
    },
    {
      label: 'Last Updated At',
      value: moment(item?.updated_at).format('DD MMM YY - hh:mm a'),
    },
  ];

  const handleDelete = async () => {
    btmSheetRef.current?.close();

    const {ok, data} = await fetchApis(
      `${baseUrl}/documents/${item?.id}`,
      'DELETE',
      setLoading,
      null,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
    );

    ApiResponse(showAlert, data, language);
    if (ok && !data?.error) {
      navigation.goBack();
    } else {
      // showAlert('Something went wrong', 'error');
    }
  };

  const handleOpenDocument = () => {
    if (item?.document_url) {
      setShowDocumentModal(true);
    } else {
      showAlert('Document URL not available', 'error');
    }
  };

  const getFileIcon = fileType => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <Svgs.pdf />;
      case 'doc':
      case 'docx':
        return <Svgs.word />;
      case 'xls':
      case 'xlsx':
        return <Svgs.excel />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Svgs.image />;
      default:
        return <Svgs.file />;
    }
  };

  const getFileNameFromUrl = url => {
    if (!url) return 'Unknown Document';
    const fileNameFromUrl = url.split('/').pop();
    return item?.name || fileNameFromUrl || 'Document';
  };

  const getFileTypeText = fileType => {
    return fileType ? fileType.toUpperCase() : 'FILE';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{flex: 1}}>
        <StackHeader
          title={item?.name}
          headerTxtStyle={styles.headerTxtStyle}
          onBackPress={() => navigation.goBack()}
          headerStyle={styles.headerStyle}
          rightIcon={
            type === 'Policies' && loading ? (
              <Loader />
            ) : type === 'Policies' ? (
              <TouchableOpacity onPress={() => btmSheetRef.current?.open()}>
                <Svgs.menuDots height={hp(3)} width={hp(3)} />
              </TouchableOpacity>
            ) : null
          }
        />
        <View style={styles.statusContainer}>
          <WorkerStatus
            name={'Status'}
            status={capitalize(item?.status)}
            nameTextStyle={styles.statusText}
          />
          <View style={styles.rowSb}>
            <Text style={[styles.statusText]}>{t('Created At')}</Text>
            <Text
              style={[
                styles.statusText,
                {
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(pxToPercentage(14)),
                },
              ]}>
              {moment(item?.created_at).format('DD MMM YY - hh:mm a')}
            </Text>
          </View>
        </View>

        <RequestDetailsCard
          heading={'Document Details'}
          details={type === 'Document' ? DocumentDetail : CompanyPolicyDetail}
        />
        {type === 'Document' && (
          <RequestDetailsCard
            heading={'Employee Details'}
            details={workerDetails}
          />
        )}

        <View style={styles.cardContainer}>
          <View style={styles.rowSb}>
            <Text style={styles.title}>{t('Document')}</Text>
            <Svgs.ChevronDownFilled height={wp(7)} width={wp(7)} />
          </View>
          <View style={styles.pdfContainer}>
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={handleOpenDocument}
              disabled={!item?.document_url}>
              {getFileIcon(item?.file_type)}
              <Text style={styles.pdfText}>
                {getFileNameFromUrl(item?.document_url)}
              </Text>
              <Text style={styles.SizeText}>
                {getFileTypeText(item?.file_type)}
              </Text>
              {!item?.document_url && (
                <Text style={styles.errorText}>
                  {t('Document not available')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ReusableBottomSheet
        height={hp('26%')}
        refRBSheet={btmSheetRef}
        sheetTitle={'Select An Option'}
        options={[
          {
            icon: <Svgs.edit height={hp(4)} />,
            title: 'Edit',
            description: 'Select edit to edit the document.',

            onPress: () => {
              btmSheetRef.current?.close();
              navigation.navigate(SCREENS.UPDATEDOCUMENT, {
                documentItem: item,
              });
            },
          },
          {
            icon: <Svgs.deleteBlueOutline height={hp(4)} />,
            title: 'Delete',
            description: 'Select to delete document.',

            onPress: () => {
              handleDelete();
            },
          },
        ]}
      />

      <DocumentViewModal
        visible={showDocumentModal}
        documentUrl={item?.document_url}
        onClose={() => setShowDocumentModal(false)}
      />
    </View>
  );
};

export default DocumentDetails;

const dynamicStyles = (isDarkMode, theme, Colors) =>
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
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(16)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    statusContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      marginHorizontal: wp(4),
      paddingVertical: wp(2),
      paddingHorizontal: wp(3),
      marginTop: wp(2),
      borderRadius: wp(2),
    },
    statusText: {
      fontFamily: Fonts.PoppinsSemiBold,
      color: theme.primaryTextColor,
      fontSize: RFPercentage(pxToPercentage(16)),
    },
    rowSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(0.5),
    },
    cardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      padding: wp(4),
      marginHorizontal: wp(4),
      marginBottom: hp(2),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: hp(1.2),
    },
    label: {
      fontFamily: Fonts.NunitoRegular,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      flex: 1,
    },
    valueContainer: {
      flex: 1.2,
      alignItems: 'flex-end',
    },
    value: {
      fontFamily: Fonts.NunitoMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'right',
    },
    title: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlignVertical: 'center',
    },
    pdfContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? `${Colors.darkTheme.backgroundColor}70`
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
      marginTop: hp(2),
    },
    pdfText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.NunitoBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(0.5),
      textAlign: 'center',
      paddingHorizontal: wp(2),
    },
    SizeText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.NunitoMedium,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
      marginTop: hp(0.5),
    },
    errorText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.NunitoMedium,
      color: Colors.errorRed,
      marginTop: hp(0.5),
    },
    btnContainer: {
      borderTopColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingBottom: hp(2),
      paddingTop: wp(4),
      paddingHorizontal: wp(4),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    continueButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryBtn.BtnColor
        : Colors.lightTheme.primaryBtn.BtnColor,
      paddingVertical: hp(1.5),
      borderRadius: wp(3),
      alignItems: 'center',
      marginHorizontal: wp(1),
    },
    continueButtonText: {
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryBtn.TextColor
        : Colors.lightTheme.primaryBtn.TextColor,
      fontFamily: Fonts.PoppinsSemiBold,
    },
    rowViewSb: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1.2),
    },
    selectedZone: {
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.darkTheme.primaryTextColor,
      fontFamily: Fonts.PoppinsRegular,
      backgroundColor: '#579DFF',
      paddingVertical: hp(1),
      paddingHorizontal: wp(3),
      borderRadius: wp(1),
      marginRight: wp(2),
    },
  });
