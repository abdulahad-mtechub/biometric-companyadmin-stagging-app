import { Svgs } from '@assets/Svgs/Svgs';
import AttendanceHistoryCard from '@components/Cards/AttendanceHistoryCard';
import EmptyCard from '@components/Cards/EmptyCard';
import SymbolCard from '@components/Cards/SymbolCard';
import Loader from '@components/Loaders/loader';
import {
  AttendanceHistorySymbols
} from '@constants/DummyData';
import { Fonts } from '@constants/Fonts';
import { SCREENS } from '@constants/Screens';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
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

const AttendanceHistory = ({
  navigation,
  loadMoreData,
  apiData = [],
  isLoading,
  isLoadingMore,
  refRBSheet,
  filterApplied,
  clearfilters,
  onRefresh,
  refreshing,
}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {t} = useTranslation();

  return (
    <View style={styles.contentContainerStyle}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode
              ? Colors.darkTheme.backgroundColor
              : Colors.lightTheme.backgroundColor,
          }}>
          <Loader size={wp(10)} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={apiData}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            refreshControl={
              <RefreshControl
                colors={[Colors.darkTheme.primaryColor]}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            ListHeaderComponent={
              <View style={styles.listHeaderContainer}>
                <View style={styles.punchHeader}>
                  <Text style={styles.punchHeaderText}>
                    {apiData.length} {t('Punches')}
                  </Text>
                  {filterApplied ? (
                    <TouchableOpacity
                      style={styles.clearFilterButton}
                      onPress={clearfilters}>
                      <Text style={styles.clearFilterText}>
                        {t('Clear Filters')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => refRBSheet.current?.open()}>
                      <Svgs.filter />
                    </TouchableOpacity>
                  )}
                </View>

                <SymbolCard
                  heading={'Attendence Symbols'}
                  array={AttendanceHistorySymbols}
                  contianerStyle={styles.symbolCardContainer}
                />
              </View>
            }
            renderItem={({item, index}) => (
              <AttendanceHistoryCard
                key={index}
                item={item}
                onPress={() => {
                  navigation.navigate(SCREENS.WORKERATTENDENCEDETAILS, {
                    status: item.status,
                    item,
                  });
                }}
              />
            )}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? <Loader size={wp(10)} /> : null
            }
            ListEmptyComponent={
              <EmptyCard
                icon={<Svgs.emptyUser height={hp(10)} />}
                heading="Empty!"
                subheading={'No employees available yet'}
                containerStyle={{
                  flex: 1,
                  justifyContent: 'center',
                  backgroundColor: isDarkMode
                    ? Colors.darkTheme.secondryColor
                    : Colors.lightTheme.backgroundColor,
                  height: hp(40),
                }}
              />
            }
          />
        </View>
      )}
    </View>
  );
};

export default AttendanceHistory;

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    contentContainerStyle: {
      flex: 1,
    },
    listHeaderContainer: {},

    rowSb: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    punchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(3),
      paddingVertical: hp(2),
      borderRadius: wp(2),
      marginTop: hp(1.5),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },

    punchHeaderText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(2),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },

    symbolCardContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
    },

    listContainer: {
      backgroundColor: isDarkMode
        ? Colors.darkTheme.backgroundColor
        : Colors.lightTheme.secondryColor,
      padding: hp(2),
      borderRadiusBottom: wp(2),
    },

    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode
        ? Colors.darkTheme.BorderGrayColor
        : Colors.lightTheme.BorderGrayColor,
      paddingBottom: hp(1),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      padding: hp(2),
      borderTopLeftRadius: wp(2),
      borderTopRightRadius: wp(2),
    },

    listHeaderText: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(1.9),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },

    SubHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(1.9),
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
  });
