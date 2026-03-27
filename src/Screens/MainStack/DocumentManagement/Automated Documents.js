import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import Mustache from 'mustache';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {generatePDF} from 'react-native-html-to-pdf';
import MonthPicker from 'react-native-month-year-picker';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import AutomatedDocumentFilterBtmSheet from '@components/BottomSheets/AutomatedDocumentFilterBtmSheet';
import AutomatedDocumentsCard from '@components/Cards/AutomatedDocumentsCard';
import EmptyCard from '@components/Cards/EmptyCard';
import Loader from '@components/Loaders/loader';
import DocumentPreviewModal from '@components/Modals/DocumentPreviewModal';
import NestedTabsSelector from '@components/TabSelector/NestedTabsSelector';
import {Fonts} from '@constants/Fonts';
import {Colors} from '@constants/themeColors';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import {
  employment_certificate,
  employment_certificate_Spanish,
} from '@utils/HTMLS/employment_certificate';
import {payslip, payslip_spanish} from '@utils/HTMLS/payslip';
import {pxToPercentage} from '@utils/responsive';
import uuid from 'react-native-uuid';
import logger from '@utils/logger';

const TABS = ['Certificates', 'Pay Slips', 'Document History'];
const limit = 10;

const INITIAL_FILTERS = {
  datefrom: null,
  dateto: null,
  workerId: null,
  documentType: null,
};
const AutomatedDocuments = () => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {token, language} = useSelector(store => store.auth);
  const [selectedTab, setSelectedTab] = useState('Certificates');
  const styles = dynamicStyles(isDarkMode, Colors);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const {showAlert} = useAlert();
  const {t} = useTranslation();
  const [sendDocumentLoading, setSendDocumentLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalData, setModalData] = useState({});
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const previewData =
    selectedTab === 'Certificates'
      ? [
          {label: 'Name', value: modalData?.workerName},
          {label: 'ID', value: modalData?.workerId},
          {label: 'Department', value: modalData?.department},
          {label: 'Position', value: modalData?.position},
          {
            label: 'Date of Joining',
            value: moment(modalData?.dateOfJoining, 'DD/MM/YYYY').format(
              'DD MMM, YYYY',
            ),
          },
          {label: 'Work Schedule', value: modalData?.workSchedule},
          {label: 'Salary', value: `${modalData?.salary}${modalData.currency}`},
          {label: 'Company', value: modalData.companyName},
          {label: 'Company Phone', value: modalData.companyPhone},
          {label: 'Email', value: modalData.companyEmail},
          {
            label: 'Current Date',
            value: moment(modalData?.currentDate, 'DD/MM/YYYY').format(
              'DD MMM, YYYY',
            ),
          },
          {
            label: 'Generated On',
            value: moment(modalData?.systemGenerationDate, 'DD/MM/YYYY').format(
              'DD MMM, YYYY',
            ),
          },
          {
            label: 'Registered On',
            value: moment(
              modalData?.systemRegistrationDate,
              'DD/MM/YYYY',
            ).format('DD MMM, YYYY'),
          },
        ]
      : [
          {label: 'Name', value: modalData?.workerName},
          {label: 'ID', value: modalData?.workerId},
          {label: 'Department', value: modalData?.department},
          {label: 'Position', value: modalData?.position},
          {
            label: 'Date of Joining',
            value: moment(modalData?.dateOfJoining, 'DD/MM/YYYY').format(
              'DD MMM, YYYY',
            ),
          },

          {
            label: 'Salary',
            value: `${modalData?.basicSalary}${modalData.currency}`,
          },
          {label: 'Company', value: modalData.companyName},
          {label: 'Company Phone', value: modalData.companyPhone},
          {label: 'Email', value: modalData.companyEmail},
          {label: 'Period', value: modalData?.period || ''},

          {
            label: 'Generated On',
            value: moment(modalData?.systemGenerationDate, 'DD/MM/YYYY').format(
              'DD MMM, YYYY',
            ),
          },
        ];

  const TAB_CONFIG = {
    Certificates: {heading: 'Employement Certificates'},
    'Pay Slips': {heading: 'Pay Slips'},
    'Document History': {heading: 'Document History'},
  };
  const filterSheetRef = useRef();

  const {heading} = TAB_CONFIG[selectedTab];

  const {
    apiData,
    setApiData,
    page,
    setPage,
    hasNext,
    setHasNext,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    refreshing,
    setRefreshing,
    resetPagination,
  } = useApiData();

  const buildApiUrl = useCallback(
    (pageNumber, currentTab, resetSearch = false) => {
      let url = `${baseUrl}/documents/automated/workers?page=${pageNumber}&limit=${limit}`;

      logger.log(currentTab, { context:'Automated Documents' });

      if (currentTab === 'Certificates') {
        url += `&document_type=employment_certificate`;
        filters.datefrom && (url += `&date_from=${filters.datefrom}`);
        filters.dateto && (url += `&date_to=${filters.dateto}`);
      } else if (currentTab === 'Pay Slips') {
        url += `&document_type=payslip`;
        filters.datefrom && (url += `&date_from=${filters.datefrom}`);
        filters.dateto && (url += `&date_to=${filters.dateto}`);
      } else if (currentTab === 'Document History') {
        url = `${baseUrl}/documents/automated/history?page=${pageNumber}&limit=${limit}`;
        filters.workerId && (url += `&worker_id=${filters.workerId}`);
        filters.documentType &&
          (url += `&document_type=${filters.documentType}`);
      }

      logger.log(url, { context:'Automated Documents' });
      return url;
    },
    [selectedTab, filters],
  );

  const renderTabHeader = useCallback(
    () => (
      <View style={styles.tabHeaderBox}>
        <Text style={styles.tabHeading}>{t(heading)}</Text>
        {filters.filterApplied ? (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearFilters}>
            <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => filterSheetRef.current?.open()}>
            <Svgs.filter />
          </TouchableOpacity>
        )}
      </View>
    ),
    [styles, filters.filterApplied, clearFilters, t, apiData],
  );
  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      workerId: null,
      documentType: null,
    }));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetPagination();
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData, resetPagination, setRefreshing, selectedTab]);

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasNext) {
      fetchData(false);
    }
  }, [fetchData, isLoadingMore, isLoading, hasNext]);

  const renderEmptyComponent = useCallback(
    () => (
      <EmptyCard
        icon={<Svgs.emptyUser height={hp(10)} width={hp(10)} />}
        heading={'Empty!'}
        subheading={'No Documents Yet!'}
      />
    ),
    [],
  );
  const onApplyFilters = useCallback(data => {
    logger.log(data, { context:'Automated Documents' });
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      workerId: data.workerId,
      documentType: data.documentType,
      filterApplied: true,
    }));
  }, []);

  const fetchData = useCallback(
    async (reset = false, resetSearch = false) => {
      if (isLoading || (!reset && !hasNext)) return;

      const loadingState = reset ? setIsLoading : setIsLoadingMore;
      loadingState(true);
      logger.log('selectedTab: ', selectedTab, { context:'Automated Documents' });

      try {
        const url = buildApiUrl(reset ? 1 : page, selectedTab, resetSearch);
        const {ok, data: responseData} = await fetchApis(
          url,
          'GET',
          null,
          null,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        );

        if (!ok || responseData?.error) {
          ApiResponse(showAlert, responseData, language);
          return;
        }

        const fetchedData = responseData?.data;
        const documents =
          selectedTab === 'Document History'
            ? fetchedData?.history || []
            : fetchedData?.workers || [];

        // if (selectedTab === 'Document History') {
        //   setApiData(prevData =>
        //   );
        // }
        // else {
        //   setApiData(prevData =>
        //   );
        // }

        setApiData(prevData =>
          reset ? documents : [...(prevData || []), ...documents],
        );

        setHasNext(fetchedData?.pagination?.has_next || false);
        setPage(reset ? 2 : page + 1);
      } catch (error) {
        logger.error('Fetch error:', error, { context:'Automated Documents' });
        showAlert('Network error occurred', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      buildApiUrl,
      selectedTab,
      page,
      hasNext,
      isLoading,
      setApiData,
      setHasNext,
      setPage,
      setIsLoading,
      setIsLoadingMore,
      showAlert,
      token,
      refreshing,
    ],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={[Colors?.darkTheme?.primaryColor || '#007AFF']}
        refreshing={refreshing}
        onRefresh={onRefresh}
        progressBackgroundColor={
          isDarkMode
            ? Colors?.darkTheme?.secondryColor || '#1C1C1E'
            : Colors?.lightTheme?.backgroundColor || '#FFFFFF'
        }
      />
    ),
    [refreshing, onRefresh, isDarkMode, selectedTab],
  );

  const handleSendDocument = async (item, date) => {
    let payload;
    if (selectedTab === 'Certificates') {
      payload = {
        worker_id: item?.id,
        doc_type: 'employment_certificate',
      };
    } else {
      payload = {
        worker_id: item?.id,
        doc_type: 'payslip',
        period: date,
      };
    }

    logger.log(item, payload, { context:'Automated Documents' });

    const {ok, data} = await fetchApis(
      `${baseUrl}/documents/automated/preview`,
      'POST',
      setSendDocumentLoading,
      payload,
      showAlert,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    );

    if (!ok || data?.error) {
      ApiResponse(showAlert, data, language);
      return;
    }
    setVisible(true);
    setModalData(data?.data?.preview_data);
  };

  const handlePreviewDocument = async item => {
    setSelectedDocument(item);
    if (selectedTab === 'Certificates') {
      handleSendDocument(item);
    } else {
      setShowPicker(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
    }, [selectedTab, filters.datefrom, filters.dateto, filters.filterApplied]),
  );

  const buildHtmlData = () => {
    return {
      workerName: modalData?.workerName,
      workerId: modalData?.workerId,
      department: modalData?.department,
      position: modalData?.position,
      dateOfJoining: moment(modalData?.dateOfJoining, 'DD/MM/YYYY').format(
        'DD MMM, YYYY',
      ),
      workSchedule: modalData?.workSchedule,
      salary: modalData?.salary,
      currency: modalData?.currency,
      companyName: modalData?.companyName,
      companyAddress: modalData?.companyAddress || '',
      companyPhone: modalData?.companyPhone || '',
      companyEmail: modalData?.companyEmail || '',
      companyLogo: modalData?.companyLogo || '',
      currentDate: moment(modalData?.currentDate, 'DD/MM/YYYY').format(
        'DD MMM, YYYY',
      ),
      systemGenerationDate: moment(
        modalData?.systemGenerationDate,
        'DD/MM/YYYY',
      ).format('DD MMM, YYYY'),
      systemRegistrationDate: modalData?.systemRegistrationDate || '',
    };
  };

  const buildPaySlipHtmlData = () => {
    return {
      workerName: modalData?.workerName || '',
      workerId: modalData?.workerId || '',
      department: modalData?.department || '',
      position: modalData?.position || '',
      dateOfJoining: modalData?.dateOfJoining
        ? moment(modalData.dateOfJoining, 'DD/MM/YYYY').format('DD MMM, YYYY')
        : '',
      paymentDate: modalData?.paymentDate
        ? moment(modalData.paymentDate, 'DD/MM/YYYY').format('DD MMM, YYYY')
        : '',
      period: modalData?.period || '',
      currency: modalData?.currency || '',
      basicSalary: modalData?.basicSalary || '0.00',
      allowances: modalData?.allowances || [],
      deductions: modalData?.deductions || [],
      totalEarnings: modalData?.totalEarnings || '0.00',
      totalDeductions: modalData?.totalDeductions || '0.00',
      netPay: modalData?.netPay || '0.00',
      companyName: modalData?.companyName || '',
      companyAddress: modalData?.companyAddress || '',
      companyPhone: modalData?.companyPhone || '',
      companyEmail: modalData?.companyEmail || '',
      companyLogo: modalData?.companyLogo, // will show logo if available
      systemGenerationDate: modalData?.systemGenerationDate
        ? moment(modalData.systemGenerationDate, 'DD/MM/YYYY, HH:mm').format(
            'DD MMM, YYYY, HH:mm',
          )
        : moment().format('DD MMM, YYYY, HH:mm'), // fallback to current datetime
    };
  };

  const generateHtmlContent = () => {
    if (selectedTab === 'Certificates') {
      const htmlData = buildHtmlData();
      const renderedHtml = Mustache.render(
        language.value === 'es'
          ? employment_certificate_Spanish
          : employment_certificate,
        htmlData,
      );
      return renderedHtml;
    } else {
      const htmlData = buildPaySlipHtmlData();
      const renderedHtml = Mustache.render( language.value === 'es'
        ? payslip_spanish: payslip, htmlData);
      return renderedHtml;
    }
  };
  const createPDF = async () => {
    try {
      const html = generateHtmlContent();
      const id = uuid.v4();

      const options = {
        html: html,
        fileName:
          selectedTab === 'Certificates'
            ? `Employment_Certificate_${modalData.workerId}_${id}`
            : `PaySlip_${modalData.workerId}_${id}`,
        base64: false, // Set to true if you need base64
      };

      const results = await generatePDF(options);
      logger.log('PDF generated:', results, { context:'Automated Documents' });

      // Use DocumentDirectoryPath which is more reliable across platforms
      const directoryPath = RNFS.DocumentDirectoryPath;

      // Ensure directory exists
      const dirExists = await RNFS.exists(directoryPath);
      if (!dirExists) {
        await RNFS.mkdir(directoryPath);
      }

      const downloadDest = `${directoryPath}/${
        selectedTab === 'Certificates'
          ? `Employment_Certificate_${modalData.workerId}_${id}.pdf`
          : `PaySlip_${modalData.workerId}_${id}.pdf`
      }`;

      // Move file from cache to Documents directory
      await RNFS.moveFile(results.filePath, downloadDest);

      logger.log('PDF saved to:', downloadDest, { context:'Automated Documents' });
      return downloadDest;
    } catch (error) {
      logger.error('Error generating PDF:', error, { context:'Automated Documents' });
      throw error;
    }
  };

  const onTabPress = useCallback(tab => {
    setSelectedTab(tab);
    setFilters(INITIAL_FILTERS);
  }, []);

  const formattedMonthYear = date => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
    return `${year}-${month}`;
  };
  const onValueChange = (event, selectedDate) => {
    logger.log(event, { context:'Automated Documents' });
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      handleSendDocument(selectedDocument, formattedMonthYear(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <NestedTabsSelector
        tabs={Object.keys(TAB_CONFIG)}
        selectedTab={selectedTab}
        onTabPress={onTabPress}
      />

      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader size={wp(10)} />
        </View>
      ) : (
        <FlatList
          data={apiData}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <AutomatedDocumentsCard
              item={item}
              onSendDocument={handlePreviewDocument}
              isLoading={
                item.id === selectedDocument?.id && sendDocumentLoading
              }
              type={
                selectedTab === 'Document History'
                  ? 'documentHistory'
                  : 'document'
              }
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          ListHeaderComponent={renderTabHeader}
          refreshControl={refreshControl}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.6}
          contentContainerStyle={styles.listContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
      )}

      <DocumentPreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={previewData}
        theme="light"
        onButtonPress={async () => {
          try {

            const filePath = await createPDF();
            logger.log('PDF saved at:', filePath, { context:'Automated Documents' });
            Alert.alert('Success', `PDF saved at: ${filePath}`);
          } catch (error) {
            logger.error('Failed to generate PDF:', error, { context:'Automated Documents' });
            Alert.alert('Error', 'Failed to generate PDF');
          }
        }}
      />

      <AutomatedDocumentFilterBtmSheet
        height={selectedTab === 'Document History' ? hp(50) : hp(35)}
        refRBSheet={filterSheetRef}
        onApplyFilters={onApplyFilters}
        isHistory={selectedTab === 'Document History'}
      />

      {showPicker && (
        <MonthPicker
          onChange={onValueChange}
          value={date}
          minimumDate={new Date(2000, 0)}
          maximumDate={new Date(2100, 11)}
          locale="en"
        />
      )}
    </View>
  );
};

export default AutomatedDocuments;

const dynamicStyles = isDarkMode =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
      paddingHorizontal: wp(2),
    },
    tabHeaderBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      marginVertical: hp(3),
      marginHorizontal: wp(2),
    },
    tabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    clearFilterButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(0.5),
    },
    clearFilterText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: hp(30),
    },
  });
