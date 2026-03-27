import { Svgs } from '@assets/Svgs/Svgs';
import RequestDetailsCard from '@components/Cards/RequestDetailsCard';
import DocumentViewModal from '@components/CustomModal/DocumentViewModal';
import StackHeader from '@components/Header/StackHeader';
import { Fonts } from '@constants/Fonts';
import { capitalize } from '@utils/Helpers';
import { pxToPercentage } from '@utils/responsive';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';

const PayrollDetails = ({navigation, route}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const [ImageExpendable, setImageExpendable] = useState({
    paymentProof: false,
    expenseProof: false,
  });
  const [isDocumentPreviewVisible, setisDocumentPreviewVisible] =
    useState(false);
  const {item} = route.params;
  console.log(item);

  const PaymentDetails = [
    {label: 'Type', value: capitalize(item?.type)},
    {label: 'Paid Amount', value: `$${item?.amount}`},
    {
      label: 'Comment',
      value: item.note,
    },
  ];
  const WorkerDetails = [
    {label: 'Employee Name', value: item?.worker?.name},
    {label: 'Email', value: item?.worker?.email},
    {label: 'Designation', value: item?.worker?.designation},
    {label: 'Employee type', value: `${item?.worker?.employee_type}`},
  ];

  const isImageFile = fileUrl => {
    if (!fileUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(
      ext =>
        fileUrl.toLowerCase().includes(ext) ||
        fileUrl.toLowerCase().startsWith('data:image/'),
    );
  };

  const handleOpenDocument = async () => {
    setisDocumentPreviewVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <StackHeader
        title={'Payroll Details'}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
      />

      <View style={styles.statusContainer}>
        <View style={styles.rowSb}>
          <Text style={[styles.statusText]}>{t('Date')}</Text>
          <Text style={[styles.statusValue]}>
            {moment(item.paid_at).format('DD MMM, YYYY')}
          </Text>
        </View>
      </View>

      <RequestDetailsCard
        details={WorkerDetails}
        heading={'Employee Details'}
      />
      <RequestDetailsCard
        details={PaymentDetails}
        headerTitle={'Payment Details'}
      />

      {item?.attachment_url && (
        <View style={styles.sectionBox}>
          <View style={styles.receiptHeader}>
            <Text style={styles.sectionTitle}>{t('Supporting Proof')}</Text>
          </View>
          <View style={styles.receiptHeader}>
            <Text style={styles.sectionTitle}>{t('Attachement')}</Text>
          </View>
          <View style={styles.uploadContainer}>
            {isImageFile(item?.attachment_url) ? (
              <Image
                source={{uri: item?.attachment_url}}
                style={styles.receiptImage}
              />
            ) : (
              <TouchableOpacity
                onPress={() => handleOpenDocument(item.attachment_url)}
                style={{
                  padding: wp(4),
                  backgroundColor: isDarkMode ? '#68696A' : '#5E5F60',
                  borderRadius: wp(10),
                }}>
                <Svgs.pdf />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <DocumentViewModal
        visible={isDocumentPreviewVisible}
        documentUrl={item?.attachment_url}
        onClose={() => setisDocumentPreviewVisible(false)}
      />
    </ScrollView>
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
      height: hp(65),
      resizeMode: 'cover',
      marginBottom: hp(2),
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
    uploadContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.secondryColor,
      borderRadius: wp(2),
      height: hp(30),
    },
  });
export default PayrollDetails;
