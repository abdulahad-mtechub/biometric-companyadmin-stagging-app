import React, {useCallback, useMemo, useRef, useState} from 'react';
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

import DocumentFilterBtmSheet from '@components/BottomSheets/DocumentFilterBtmSheet';
import ReceivedDocumentCard from '@components/Cards/ReceivedDocumentCard';
import CompanyPoliciesCard from '@components/Cards/CompanyPoliciesCard';
import EmptyCard from '@components/Cards/EmptyCard';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TabSelector from '@components/TabSelector/TabSelector';
import TxtInput from '@components/TextInput/Txtinput';
import ReusableBottomSheet from '@components/BottomSheets/ReusableBottomSheet';
import ConfirmationBottomSheet from '@components/BottomSheets/ConfirmationBottomSheet';

import {useFocusEffect} from '@react-navigation/native';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Svgs} from '@assets/Svgs/Svgs';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import {pxToPercentage} from '@utils/responsive';
import AutomatedDocuments from './Automated Documents';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import logger from '@utils/logger';

// Constants
const TABS = ['Received Documents', 'Sent Documents'];
// const TABS = ['Received', 'Sent Documents', 'Automated Documents'];
const TAB_HEADINGS = {
  'Received Documents': 'All Received Documents',
  'Sent Documents': 'All Sent Documents',
};

const INITIAL_FILTERS = {
  worker: null,
  category: null,
  datefrom: null,
  dateto: null,
  filterApplied: false,
  searchText: null,
  status: null,
  sortBy: null,
  sortOrder: null,
};

const PAGINATION_CONFIG = {
  workerReceives: {limit: 10},
  companyPolicies: {limit: 20},
};

const DocumentManagement = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {token, company, language} = useSelector(store => store.auth);
  const {workers} = useSelector(store => store.states);
  const {showAlert} = useAlert();
  const {t} = useTranslation();
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('documents');
  const [selectedTab, setSelectedTab] = useState('Received Documents');
  const [showSearch, setShowSearch] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filterSheetRef = useRef();
  const selectorBottomSheetRef = useRef(null);
  const deleteSheetRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

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

  const styles = useMemo(
    () => createStyles(isDarkMode, Colors),
    [isDarkMode, Colors],
  );
  const tabHeading = useMemo(() => TAB_HEADINGS[selectedTab], [selectedTab]);
  const isWorkerReceivesTab = useMemo(
    () => selectedTab === 'Received Documents',
    [selectedTab],
  );

  const buildApiUrl = useCallback(
    (pageNumber, currentTab = selectedTab, resetSearch = false) => {
      const isWorkerTab = currentTab === 'Received Documents';
      const config = isWorkerTab
        ? PAGINATION_CONFIG.workerReceives
        : PAGINATION_CONFIG.companyPolicies;

      let url = `${baseUrl}/documents/`;

      if (isWorkerTab) {
        url += `received?page=${pageNumber}&limit=${config.limit}&company_id=${company?.id}`;

        const filterParams = [
          filters.datefrom && `date_from=${filters.datefrom}`,
          filters.dateto && `date_to=${filters.dateto}`,
          filters.worker && `worker_id=${filters.worker}`,
          filters.category && `category=${filters.category}`,
          !resetSearch && filters.searchText && `search=${filters.searchText}`,
        ].filter(Boolean);

        if (filterParams.length) {
          url += `&${filterParams.join('&')}`;
        }
      } else {
        url += `company?limit=${config.limit}&page=${pageNumber}&company_id=${company?.id}`;

        const filterParams = [
          !resetSearch && filters.searchText && `search=${filters.searchText}`,
          filters.status && `status=${filters.status}`,
          filters.datefrom && `date_from=${filters.datefrom}`,
          filters.dateto && `date_to=${filters.dateto}`,
          filters.sortBy && `sortBy=${filters.sortBy}`,
          filters.sortOrder && `sortOrder=${filters.sortOrder}`,
        ].filter(Boolean);

        if (filterParams.length) {
          url += `&${filterParams.join('&')}`;
        }
      }

      return url;
    },
    [selectedTab, filters, company?.id],
  );

  const fetchData = useCallback(
    async (reset = false, resetSearch = false) => {
      if (isLoading || (!reset && !hasNext)) return;

      const loadingState = reset ? setIsLoading : setIsLoadingMore;
      loadingState(true);

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
        const documents = fetchedData?.documents || [];

        setApiData(prevData =>
          reset ? documents : [...(prevData || []), ...documents],
        );

        setHasNext(responseData?.data?.pagination?.has_next || false);
        setPage(reset ? 2 : page + 1);
      } catch (error) {
        logger.error('Fetch error:', error, {context: 'DocumentManagement'});
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
    ],
  );

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
    }, [
      selectedTab,
      filters.category,
      filters.worker,
      filters.datefrom,
      filters.dateto,
      filters.status,
      filters.sortBy,
      filters.sortOrder,
      filters.filterApplied,
    ]),
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUploadPress = useCallback(() => {
    navigation.navigate(SCREENS.UPLOADDOCUMENT);
  }, [navigation]);

  const handleSearch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      worker: null,
      category: null,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      status: null,
      sortBy: null,
      sortOrder: null,
    }));
  }, []);

  const resetSearch = useCallback(() => {
    setFilters(prev => ({...prev, searchText: null}));
    setShowSearch(false);
    fetchData(true, true);
  }, [fetchData]);

  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      worker: data.workerId,
      category: data.category,
      status: data.status,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      filterApplied: true,
    }));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetPagination();
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData, resetPagination, setRefreshing]);

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasNext) {
      fetchData(false);
    }
  }, [fetchData, isLoadingMore, isLoading, hasNext]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  const handleSearchTextChange = useCallback(value => {
    setFilters(prev => ({...prev, searchText: value}));
  }, []);

  const renderFloatingButton = useCallback(
    () => (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleUploadPress}>
        <Svgs.whitePlus height={hp(3)} width={hp(3)} />
      </TouchableOpacity>
    ),
    [styles.floatingButton, handleUploadPress],
  );

  const renderTabHeader = useCallback(
    () => (
      <View style={styles.tabHeaderBox}>
        <Text style={styles.tabHeading}>{t(tabHeading)}</Text>
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
    [styles, tabHeading, filters.filterApplied, clearFilters, t, apiData],
  );

  const renderSearchInput = useCallback(() => {
    if (!showSearch) return null;

    return (
      <Animated.View style={styles.searchContainer}>
        <TxtInput
          placeholder={t('Search')}
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
    showSearch,
    styles,
    t,
    handleSearchTextChange,
    filters.searchText,
    isDarkMode,
    resetSearch,
    handleSearch,
  ]);

  const renderDocumentItem = useCallback(
    ({item}) =>
      isWorkerReceivesTab ? (
        <ReceivedDocumentCard
          item={item}
          onPress={() => {
            navigation.navigate(SCREENS.DOCUMENTDETAILS, {
              item,
              type: 'Document',
            });
          }}
        />
      ) : (
        <CompanyPoliciesCard
          item={item}
          onBtnPress={() => handleDocumentBtnPress(item)}
          onPress={() => {
            navigation.navigate(SCREENS.DOCUMENTDETAILS, {
              item,
              type: 'Policies',
            });
            console.log('asdasd');
          }}
        />
      ),
    [isWorkerReceivesTab, handleDocumentBtnPress],
  );

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
    [refreshing, onRefresh, isDarkMode],
  );

  const keyExtractor = useCallback(
    (item, index) => `document-${item.id || index}`,
    [],
  );

  const onTabPress = useCallback(tab => {
    setSelectedTab(tab);
    setFilters(INITIAL_FILTERS);
    setShowSearch(false);
  }, []);

  const deleteDocument = useCallback(
    async id => {
      deleteSheetRef.current?.close();
      try {
        const {ok, data} = await fetchApis(
          `${baseUrl}/documents/${id}`,
          'DELETE',
          setIsStatusLoading,
          null,
          showAlert,
          {
            Authorization: `Bearer ${token}`,
          },
        );

        ApiResponse(showAlert, data, language);
        console.log(data, `${baseUrl}/documents/${id}`);

        if (!ok || data?.error) {
          return;
        }

        setApiData(prevData => prevData.filter(item => item.id !== id));
      } catch (error) {
        logger.error('Delete error:', error, {context: 'DocumentManagement'});
        showAlert('An error occurred while deleting document.', 'error');
      } finally {
        setSelectedItem(null);
        setIsStatusLoading(false);
      }
    },
    [showAlert, token, setApiData],
  );

  const handleDocumentBtnPress = useCallback(item => {
    setSelectedItem(item);
    selectorBottomSheetRef.current?.open();
  }, []);

  return selectedTab === 'Automated Documents' ? (
    <View style={styles.container}>
      <StackHeader
        title="Document Management"
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={handleBackPress}
        headerStyle={styles.headerStyle}
      />

      <TabSelector
        tabs={TABS}
        selectedTab={selectedTab}
        onTabPress={onTabPress}
      />

      <AutomatedDocuments />
    </View>
  ) : (
    <View style={styles.container}>
      {selectedTab === 'Sent Documents' && renderFloatingButton()}
      {hasFeature === false && (
        <UpgradeFeatureView
          navigation={navigation}
          featureName="Documents"
          backIcon={true}
        />
      )}

      <StackHeader
        title="Document Management"
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={handleBackPress}
        headerStyle={styles.headerStyle}
        // rightIconPress={toggleSearch}
      />

      <TabSelector
        tabs={TABS}
        selectedTab={selectedTab}
        onTabPress={onTabPress}
      />

      <View>
        {renderSearchInput()}
        {renderTabHeader()}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <Loader size={wp(10)} />
          </View>
        ) : (
          <FlatList
            data={apiData}
            renderItem={renderDocumentItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={refreshControl}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            contentContainerStyle={[
              styles.listContainer,
              selectedTab === 'Received Documents'
                ? {paddingBottom: hp(25)}
                : {paddingBottom: hp(25)},
            ]}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            ListFooterComponent={() =>
              isLoadingMore ? <Loader size={wp(10)} /> : null
            }
          />
        )}
      </View>

      <DocumentFilterBtmSheet
        refRBSheet={filterSheetRef}
        workers={workers}
        isWorkerReceivesTab={isWorkerReceivesTab}
        height={selectedTab === TABS[0] ? hp(90) : hp(80)}
        onApplyFilters={onApplyFilters}
      />

      <ReusableBottomSheet
        height={hp('25%')}
        refRBSheet={selectorBottomSheetRef}
        sheetTitle={'Select An Option'}
        options={[
          {
            icon: <Svgs.edit height={hp(4)} />,
            title: 'Update Document',
            description: 'Select edit to edit the document.',

            onPress: () => {
              selectorBottomSheetRef.current?.close();
              navigation.navigate(SCREENS.UPDATEDOCUMENT, {
                documentItem: selectedItem,
              });
            },
          },
          {
            icon: <Svgs.deleteBlueOutline height={hp(4)} />,
            title: 'Delete',
            description: 'Select delete to delete the document.',

            onPress: () => {
              selectorBottomSheetRef.current?.close();
              setTimeout(() => {
                deleteSheetRef.current?.open();
              }, 300);
            },
          },
        ]}
      />

      <ConfirmationBottomSheet
        ref={deleteSheetRef}
        icon={<Svgs.deleteAcc height={hp(10)} />}
        title={t('Delete Document')}
        description={t('Are you sure you want to delete this document?')}
        onConfirm={() => {
          deleteDocument(selectedItem?.id);
        }}
        onCancel={() => {
          deleteSheetRef.current?.close();
          setSelectedItem(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </View>
  );
};

const createStyles = (isDarkMode, Colors) => {
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    headerStyle: {
      backgroundColor: isDarkMode ? theme.secondryColor : theme.backgroundColor,
      paddingTop: hp(2),
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(pxToPercentage(18)),
      fontFamily: Fonts.PoppinsSemiBold,
    },
    floatingButton: {
      backgroundColor: theme.primaryColor,
      width: wp(13),
      height: wp(13),
      borderRadius: wp(6.5),
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: hp(5),
      right: wp(5),
      elevation: 10,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    searchContainer: {
      marginTop: hp(2),
      marginHorizontal: wp(2),
    },
    searchInput: {
      height: hp(6),
    },
    tabHeaderBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: hp(2),
      backgroundColor: isDarkMode ? theme.secondryColor : theme.backgroundColor,
      borderRadius: wp(3),
      borderWidth: 1,
      borderColor: theme.BorderGrayColor,
      marginVertical: hp(3),
      marginHorizontal: wp(2),
    },
    tabHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: theme.primaryTextColor,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: theme.BorderGrayColor,
      borderBottomWidth: 1,
      marginBottom: hp(1),
    },
    listContainer: {
      backgroundColor: isDarkMode ? theme.secondryColor : theme.backgroundColor,
      paddingHorizontal: wp(5),
      marginHorizontal: wp(2),
      paddingVertical: hp(2),
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: theme.BorderGrayColor,
      flexGrow: 1,
    },
    title: {
      fontSize: RFPercentage(pxToPercentage(14)),
      fontFamily: Fonts.PoppinsSemiBold,
      color: theme.primaryTextColor,
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: hp(30),
    },
    clearFilterButton: {
      backgroundColor: theme.primaryColor,
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: hp(0.5),
    },
    clearFilterText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.4),
      color: theme.backgroundColor,
    },
  });
};

export default React.memo(DocumentManagement);
