import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Svgs} from '@assets/Svgs/Svgs';
import {Fonts} from '@constants/Fonts';
import {useTranslation} from 'react-i18next';
import EmptyCard from '@components/Cards/EmptyCard';
import SchedulesCard from '@components/Cards/SchedulesCard';
import Loader from '@components/Loaders/loader';
import logger from '@utils/logger';

const AttendenceSettings = ({
  navigation,
  loadMoreData,
  apiData = [],
  isLoading,
  isLoadingMore,
  refRBSheet,
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
            contentContainerStyle={{flexGrow: 1}}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            ListHeaderComponent={
              <View style={styles.listHeaderContainer}>
                <View style={styles.listHeader}>
                  <Text style={styles.SubHeading}>{t('All Schedules')}</Text>
                  {/* {apiData.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        refRBSheet.current?.open();
                      }}>
                      <Svgs.filter />
                    </TouchableOpacity>
                  )} */}
                </View>
              </View>
            }
            renderItem={({item}) => <SchedulesCard item={item} />}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? <Loader size={wp(10)} /> : null
            }
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  backgroundColor: isDarkMode
                    ? Colors.darkTheme.secondryColor
                    : Colors.lightTheme.backgroundColor,
                  height: hp(70),
                }}>
                <EmptyCard
                  icon={<Svgs.emptyUser height={hp(10)} />}
                  heading="Empty!"
                  subheading={'No employees available yet'}
                />
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

export default AttendenceSettings;

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
  });
