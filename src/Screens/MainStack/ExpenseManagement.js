import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  FlatList,
  RefreshControl,
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
import {Svgs} from '@assets/Svgs/Svgs';
import ExpenseFilterBtmSheet from '@components/BottomSheets/ExpenseFilterBtmSheet';
import EmptyCard from '@components/Cards/EmptyCard';
import SymbolCard from '@components/Cards/SymbolCard';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import {
  ExpensePayrollSymbols,
  ExpenseRequestSymbols,
} from '@constants/DummyData';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import {pxToPercentage} from '@utils/responsive';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import ExpenseRequestCard from '@components/Cards/ExpenseRequestCard';
import PayrollCard from '@components/Cards/PayrollCard';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import {exportExpensePDF, exportExpenseExcel} from '@utils/exportUtils';
import logger from '@utils/logger';

const INITIAL_FILTERS = {
  worker: null,
  type: null,
  datefrom: null,
  dateto: null,
  filterApplied: false,
  searchText: null,
  status: null,
  showSearch: false,
  payment_state: null,
};

const ExpenseManagement = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const [selectedTab, setSelectedTab] = useState('Reimbursement Requests');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const {token, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const {workers} = useSelector(store => store.states);
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('payments');
  const filterSheetRef = useRef();
  const exportSheetRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

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

  const buildApiUrl = (
    pageNumber,
    currentTab = selectedTab,
    resetSearch = false,
  ) => {
    let url = `${baseUrl}/company-admin/expenses`;

    if (currentTab === 'Reimbursement Requests') {
      url += `?page=${pageNumber}&page_size=10&sort=-created_at`;
      const filterParams = [
        filters.datefrom && `from=${filters.datefrom}`,
        filters.dateto && `to=${filters.dateto}`,
        filters.payment_state && `payment_state=${filters.payment_state}`,
        filters.status && `status=${filters.status}`,
        filters.worker && `worker=${filters.worker}`,
        !resetSearch && filters.searchText && `q=${filters.searchText}`,
      ].filter(Boolean);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }
    } else if (currentTab === 'Remuneration') {
      url += `/remuneration?page=${pageNumber}&page_size=10&sort=created_at`;

      const filterParams = [
        filters.type && `type=${filters.type}`,
        filters.datefrom && `from=${filters.datefrom}`,
        filters.dateto && `to=${filters.dateto}`,
        filters.worker && `worker=${filters.worker}`,
        !resetSearch && filters.searchText && `q=${filters.searchText}`,
      ].filter(Boolean);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }
    }
    logger.log('🔗 Built URL:', url, {context: 'ExpenseManagement'});

    return url;
  };

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      worker: null,
      payment_state: null,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      status: null,
      type: null,
    }));
  }, []);

  // Fetch all data for export (no pagination)
  const fetchAllDataForExport = useCallback(async () => {
    try {
      let url =
        selectedTab === 'Reimbursement Requests'
          ? `${baseUrl}/company-admin/expenses?no_pagination=true&sort=-created_at`
          : `${baseUrl}/company-admin/expenses/remuneration?no_pagination=true&sort=created_at`;

      // Add filters
      const filterParams = [];
      if (filters.datefrom) filterParams.push(`from=${filters.datefrom}`);
      if (filters.dateto) filterParams.push(`to=${filters.dateto}`);
      if (filters.worker) filterParams.push(`worker=${filters.worker}`);
      if (filters.status) filterParams.push(`status=${filters.status}`);
      if (filters.payment_state)
        filterParams.push(`payment_state=${filters.payment_state}`);
      if (filters.type) filterParams.push(`type=${filters.type}`);

      if (filterParams.length) {
        url += `&${filterParams.join('&')}`;
      }

      const {ok, data} = await fetchApis(url, 'GET', null, null, showAlert, {
        Authorization: `Bearer ${token}`,
      });

      if (ok && data?.data) {
        console.log(data.data)
        return data.data;
      }
      return [];
    } catch (error) {
      logger.error('Export fetch error:', error, {
        context: 'ExpenseManagement',
      });
      return [];
    }
  }, [selectedTab, filters, token, showAlert]);

  // Export handlers
  const handleExportPDF = useCallback(async () => {
    exportSheetRef.current?.close();
    setIsExporting(true);

    try {
      const allData = await fetchAllDataForExport();
      const isPayroll = selectedTab === 'Remuneration';

      const columns = isPayroll
        ? {
            ID: 'ID',
            Employee: t('Employee'),
            EmployeeID: `${t('Employee')+ ' ID'}`,
            Date: t('Payment Date'),
            Amount: t('Amount'),
            Type: t('Type'),
            Note: t('Note'),
            Status: t('Status'),
            Proof: t('Proof'),
          }
        : {
            ID: 'ID',
            Employee: t('Employee'),
            EmployeeID: `${t('Employee')+ ' ID'}`,
            Date: t('Date'),
            Amount: t('Amount'),
            Description: t('Description'),
            Status: t('Status'),
            PaymentState: t('Payment State'),
            Proof: t('Proof'),
          };

      await exportExpensePDF(
        allData,
        showAlert,
        isPayroll ? t('Payroll Report') : t('Expense Report'),
        columns,
        isPayroll,
      );
    } catch (error) {
      logger.error('PDF Export error:', error, {
        context: 'ExpenseManagement',
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedTab, fetchAllDataForExport, showAlert]);

  const handleExportExcel = useCallback(async () => {
    exportSheetRef.current?.close();
    setIsExporting(true);

    try {
      const allData = await fetchAllDataForExport();
      const isPayroll = selectedTab === 'Remuneration';

      const columnHeaders = isPayroll
        ? [
            'ID',
            'Employee',
            'EmployeeID',
            'PaymentDate',
            'Amount',
            'Type',
            'Status',
            'Note',
            'Proof',
          ]
        : [
            'ID',
            'Employee',
            'EmployeeID',
            'Date',
            'Amount',
            'Description',
            'Status',
            'PaymentState',
            'Proof',
          ];

      await exportExpenseExcel(allData, showAlert, columnHeaders, isPayroll);
    } catch (error) {
      logger.error('Excel Export error:', error, {
        context: 'ExpenseManagement',
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedTab, fetchAllDataForExport, showAlert]);

  // Bottom sheet options
  const exportOptions = useMemo(
    () => [
      {
        icon: <Svgs.pdf height={hp(4)} />,
        title: 'Export to PDF',
        onPress: handleExportPDF,
      },
      {
        icon: <Svgs.excel height={hp(4)} />,
        title: 'Export to Excel',
        onPress: handleExportExcel,
      },
    ],
    [handleExportPDF, handleExportExcel],
  );

  const resetSearch = useCallback(() => {
    setFilters(prev => ({...prev, searchText: null, showSearch: false}));

    fetchData(true, true);
  }, [fetchData]);

  const fetchData = async (reset = false, tabOverride = null, resetSearch) => {
    if (isLoading || (!reset && !hasNext)) return;

    const loadingState = reset ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const url = buildApiUrl(
        reset ? 1 : page,
        tabOverride || selectedTab,
        resetSearch,
      );
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
        logger.log('Fetch error:', responseData, {
          context: 'ExpenseManagement',
        });

        ApiResponse(showAlert, responseData, language);

        return;
      }

      const fetchedData = responseData;

      setApiData(prevData =>
        reset
          ? fetchedData?.data
          : [...(prevData || []), ...(fetchedData?.data || [])],
      );

      setHasNext(responseData?.data?.pagination?.has_next || false);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'ExpenseManagement'});
      showAlert('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
    }, [
      selectedTab,
      filters.type,
      filters.worker,
      filters.datefrom,
      filters.dateto,
      filters.status,
      filters.filterApplied,
      filters.payment_state,
    ]),
  );


  const handleSearchTextChange = useCallback(value => {
    setFilters(prev => ({...prev, searchText: value}));
  }, []);

  const handleSearch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const renderSearchInput = useCallback(() => {
    if (!filters.showSearch) return null;

    return (
      <Animated.View style={{marginHorizontal: wp(4), marginVertical: hp(2)}}>
        <TxtInput
          placeholder={selectedTab === 'Reimbursement Requests' ? t('Search by description') : t('Search by name')}
          onChangeText={handleSearchTextChange}
          value={filters.searchText}
          containerStyle={[
            styles.searchInput,
            {
              backgroundColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : 'transparent',
            },
          ]}
          rightSvg={
            isDarkMode ? (
              <Svgs.crossWhite height={hp(8)} width={wp(8)} />
            ) : (
              <Svgs.Cross height={hp(3.5)} width={wp(3.5)} />
            )
          }
          rightIconPress={resetSearch}
          onSubmitEditing={handleSearch}
        />
      </Animated.View>
    );
  }, [
    filters.showSearch,
    styles,
    t,
    handleSearchTextChange,
    filters.searchText,
    isDarkMode,
    resetSearch,
    handleSearch,
  ]);
  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      worker: data.workerId,
      payment_state: data.paymentState,
      status: data.status,
      type: data.type,
      filterApplied: true,
    }));
  }, []);


  const SymbolsArray =
    selectedTab === 'Reimbursement Requests'
      ? ExpenseRequestSymbols
      : selectedTab === 'Remuneration'
      ? ExpensePayrollSymbols
      : null;
  const Heading =
    selectedTab === 'Reimbursement Requests'
      ? 'All Expenses'
      : selectedTab === 'Remuneration'
      ? 'All Payrolls'
      : null;

  const onCardPress = item => {
    if (selectedTab === 'Reimbursement Requests') {
      navigation.navigate(SCREENS.EXPENSEREQUESTDETAILS, {
        item,
      });
    } else if (selectedTab === 'Remuneration') {
      navigation.navigate(SCREENS.PAYROLLDETAILS, {
        item,
      });
    } else if (selectedTab === 'Paid Loan') {
      navigation.navigate(SCREENS.LOANDETAILS, {
        item,
      });
    }
  };

  const loadMoreData = () => {
    if (!isLoadingMore && !isLoading) {
      fetchData(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    resetPagination();
    await fetchData(true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {hasFeature === false && (
        <UpgradeFeatureView
          navigation={navigation}
          featureName="Payment Management"
        />
      )}
      {selectedTab === 'Remuneration' && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate(SCREENS.ADDPAYROLLRECORD)}>
          <Svgs.whitePlus height={hp(3)} width={hp(3)} />
        </TouchableOpacity>
      )}

      <StackHeader
        title={'Payment Management'}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        rightIcon={isDarkMode ? <Svgs.searchD /> : <Svgs.SearchL />}
        rightIconPress={() => {
          if (filters.showSearch) {
            resetSearch();
          } else {
            setFilters(prev => ({...prev, showSearch: true}));
          }
        }}
      />
      <TabSelector
        tabs={['Reimbursement Requests', 'Remuneration']}
        selectedTab={selectedTab}
        onTabPress={setSelectedTab}
        containerStyle={{
          backgroundColor: isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.backgroundColor,
        }}
      />

      {renderSearchInput()}

      <View style={styles.contentContainerStyle}>
        <View
          style={[
            styles.rowViewSB,
            {
              padding: hp(2),
              backgroundColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : Colors.lightTheme.backgroundColor,
              borderRadius: wp(3),
            },
          ]}>
          <Text style={styles.TabHeading}>{t(Heading)}</Text>
          <View
            style={{flexDirection: 'row', alignItems: 'center', gap: wp(3)}}>
            <TouchableOpacity onPress={() => exportSheetRef.current?.open()}>
              {isDarkMode ? (
                <Svgs.exportD height={hp(4)} />
              ) : (
                <Svgs.exportL height={hp(5)} width={hp(4)} />
              )}
            </TouchableOpacity>
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
        </View>

        <SymbolCard
          heading={'Status Symbols'}
          array={SymbolsArray}
          contianerStyle={{
            backgroundColor: isDarkMode
              ? Colors.darkTheme.secondryColor
              : Colors.lightTheme.backgroundColor,
          }}
        />

        <View style={styles.listContainer}>
          {isLoading ? (
            <View>
              <Loader size={wp(10)} />
            </View>
          ) : (
            <FlatList
              data={apiData}
              keyExtractor={(_, index) => index.toString()} // better: use item.id if available
              renderItem={({item}) =>
                selectedTab === 'Reimbursement Requests' ? (
                  <ExpenseRequestCard
                    item={item}
                    onPress={() => onCardPress(item)}
                  />
                ) : (
                  <PayrollCard item={item} onPress={() => onCardPress(item)} />
                )
              }
              ListEmptyComponent={
                <EmptyCard
                  icon={<Svgs.paymentEmpty height={hp(10)} width={hp(10)} />}
                  heading="Empty!"
                  subheading={
                    selectedTab === 'Reimbursement Requests'
                      ? 'No Expense Request Found'
                      : 'No Expense Payroll Found'
                  }
                  containerStyle={{paddingVertical: hp(5)}}
                />
              }
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoadingMore ? <Loader size={wp(10)} /> : null
              }
              onEndReached={loadMoreData}
              refreshControl={
                <RefreshControl
                  colors={[Colors.darkTheme.primaryColor]}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              contentContainerStyle={{paddingBottom: hp(35)}}
            />
          )}
        </View>
      </View>

      <ExpenseFilterBtmSheet
        refRBSheet={filterSheetRef}
        workers={workers}
        height={hp(90)}
        onApplyFilters={onApplyFilters}
        isRequest={selectedTab === 'Reimbursement Requests'}
      />

      <ReusableBottomSheet
        height={hp('25%')}
        refRBSheet={exportSheetRef}
        sheetTitle="Select An Option"
        options={exportOptions}
      />
    </View>
  );
};

export default ExpenseManagement;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    floatingButton: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.primaryColor
        : Colors.lightTheme.primaryColor,
      width: wp(13),
      height: wp(13),
      borderRadius: wp(100),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
      zIndex: 1000,
    },
    contentContainerStyle: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
      flex: 1,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: hp(1),
      marginLeft: wp(1.5),
    },
    TabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    listContainer: {
      //   paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingHorizontal: wp(3),
      borderRadius: wp(4),
      paddingTop: hp(2),
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsSemiBold,
      //   marginBottom: hp(1),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(1),
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: hp(30),
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
  });
