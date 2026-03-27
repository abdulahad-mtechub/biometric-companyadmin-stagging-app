import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import RequestFilterBtmSheet from '@components/BottomSheets/RequestFilterBtmSheet';
import EmptyCard from '@components/Cards/EmptyCard';
import RequestCard from '@components/Cards/RequestCard';
import StackHeader from '@components/Header/StackHeader';
import Loader from '@components/Loaders/loader';
import TxtInput from '@components/TextInput/Txtinput';
import {Fonts} from '@constants/Fonts';
import {SCREENS} from '@constants/Screens';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useApiData} from '@utils/Hooks/Hooks';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import logger from '@utils/logger';

const INITIAL_FILTERS = {
  worker: null,
  datefrom: null,
  dateto: null,
  filterApplied: false,
  searchText: null,
  status: null,
  showSearch: false,
  type: null,
};

const RequestManagement = ({navigation}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const {t} = useTranslation();
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, language, company} = useSelector(store => store.auth);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalRequests, setTotalRequests] = useState(0);
  const {workers} = useSelector(store => store.states);
  const filterSheetRef = useRef();
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('requests');
  const handleSearchTextChange = useCallback(value => {
    setFilters(prev => ({...prev, searchText: value}));
  }, []);

  const handleSearch = useCallback(async () => {
    await fetchData(true, false);
  }, [fetchData]);

  const resetSearch = useCallback(() => {
    setFilters(prev => ({...prev, searchText: null}));
    setFilters(prev => ({...prev, showSearch: false}));

    fetchData(true, true);
  }, [fetchData]);

  const renderSearchInput = useCallback(() => {
    if (!filters.showSearch) return null;

    return (
      <Animated.View style={{marginHorizontal: wp(1.2)}}>
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
    filters.showSearch,
    styles,
    t,
    handleSearchTextChange,
    filters.searchText,
    isDarkMode,
    resetSearch,
    handleSearch,
  ]);

  const {showAlert} = useAlert();

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

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      worker: null,
      datefrom: null,
      dateto: null,
      filterApplied: false,
      status: null,
      type: null,
    }));
  }, []);

  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      datefrom: data.date_from,
      dateto: data.date_to,
      worker: data.workerId,
      status: data.status,
      type: data.type,
      filterApplied: true,
    }));
  }, []);

  const buildApiUrl = (pageNumber, resetSearch = true) => {
    let url = `${baseUrl}/requests/v1/companies/${company?.id}/requests?page=${pageNumber}&limit=10`;

    const filterParams = [
      filters.datefrom && `start_date=${filters.datefrom}`,
      filters.dateto && `end_date=${filters.dateto}`,
      filters.worker && `worker=${filters.worker}`,
      filters.type && `type=${filters.type}`,
      filters.status && `status=${filters.status}`,
      !resetSearch && filters.searchText && `search=${filters.searchText}`,
    ].filter(Boolean);

    if (filterParams.length) {
      url += `&${filterParams.join('&')}`;
    }
    return url;
  };

  const fetchData = async (reset = false, resetSearch = true) => {
    if (isLoading || (!reset && !hasNext)) return;

    const loadingState = reset ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const currentPage = reset ? 1 : page;
      const url = buildApiUrl(currentPage, resetSearch);
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
          context: 'RequestManagement',
        });
        ApiResponse(showAlert, responseData, language);
        return;
      }

      const fetchedData = responseData?.data || [];
      const totalCount = responseData?.pagination?.total || 0;

      setApiData(prev => (reset ? fetchedData : [...prev, ...fetchedData]));
      setTotalRequests(totalCount);

      setHasNext(responseData?.pagination?.has_next || false);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      logger.error('Fetch error:', error, {context: 'RequestManagement'});
      showAlert('Network error occurred', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      if (reset) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    resetPagination();
    fetchData(true, false); // Pass false for resetSearch to preserve filters
  }, [resetPagination, fetchData]);

  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingMore && !isLoading) {
      fetchData(false);
    }
  }, [hasNext, isLoadingMore, isLoading, fetchData]);

  const renderRequestItem = useCallback(({item, index}) => {
    return (
      <RequestCard
        item={item}
        onPress={() => navigation.navigate(SCREENS.REQUESTDETAILS, {item})}
        key={`request-${item.id || index}`}
      />
    );
  }, []);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <Loader size={wp(10)} />
        </View>
      );
    }
    return null;
  }, [isLoadingMore, t, styles]);

  // Apply filters effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      resetPagination();
      fetchData(true);
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      resetPagination();
      fetchData(true);
    }, []),
  );

  return (
    <View style={styles.container}>
         {hasFeature === false && (
              <UpgradeFeatureView
                navigation={navigation}
                featureName="Request Management"
              />
            )}
      <StackHeader
        title={t('Request Management')}
        headerTxtStyle={styles.headerTxtStyle}
        onBackPress={() => navigation.goBack()}
        headerStyle={styles.headerStyle}
        // rightIconPress={() => {
        //   if (filters.showSearch) {
        //   } else {
        //   }
        // }}
      />

      <View style={styles.contentContainerStyle}>
        {renderSearchInput()}
        <View
          style={[
            styles.rowViewSB,
            {
              padding: hp(2),
              backgroundColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : Colors.lightTheme.backgroundColor,
              borderRadius: wp(3),
              borderWidth: 1,
              borderColor: isDarkMode
                ? Colors.darkTheme.BorderGrayColor
                : Colors.lightTheme.BorderGrayColor,
            },
          ]}>
          <Text style={styles.TabHeading}>
            {`${totalRequests} ${t('Requests')}`}
          </Text>
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

        <View style={styles.listContainer}>
          {isLoading && apiData.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('Loading...')}</Text>
            </View>
          ) : (
            <FlatList
              data={apiData || []}
              renderItem={renderRequestItem}
              keyExtractor={(item, index) => `request-${item.id || index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
              style={styles.flatListStyle}
              ListEmptyComponent={
                <EmptyCard
                  icon={<Svgs.emptyReportes height={hp(10)} width={hp(10)} />}
                  heading="Empty!"
                  subheading={'No Requests Found'}
                  containerStyle={{paddingVertical: hp(5)}}
                />
              }
            />
          )}
        </View>
      </View>

      <RequestFilterBtmSheet
        refRBSheet={filterSheetRef}
        workers={workers}
        height={hp(72)}
        onApplyFilters={onApplyFilters}
      />
    </View>
  );
};

export default RequestManagement;

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
    },
    headerTxtStyle: {
      textAlign: 'left',
      fontSize: RFPercentage(2),
      fontFamily: Fonts.PoppinsSemiBold,
    },

    contentContainerStyle: {
      paddingHorizontal: wp(5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.backgroundColor,
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
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      textAlign: 'center',
    },
    listContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(4),
      paddingTop: hp(2),
      flex: 1,
      marginBottom: hp(2),
    },
    flatListStyle: {
      flex: 1,
    },
    flatListContent: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
    },
    title: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.PoppinsSemiBold,
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
      marginTop: hp(1),
    },
    loadingContainer: {
      padding: hp(2),
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    loadingText: {
      fontSize: RFPercentage(1.6),
      fontFamily: Fonts.PoppinsRegular,
      color: isDarkMode
        ? Colors.darkTheme.secondryTextColor
        : Colors.lightTheme.secondryTextColor,
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
