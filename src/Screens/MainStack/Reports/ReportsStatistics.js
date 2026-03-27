import {t} from 'i18next';
import React, {useCallback, useRef, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import StackHeader from '@components/Header/StackHeader';
import {Fonts} from '@constants/Fonts';
import CompanyPerformance from './CompanyPerformance';
import {pxToPercentage} from '@utils/responsive';
import ReportsFilterBtmSheet from '@components/BottomSheets/ReportsFilterBtmSheet';
import {Svgs} from '@assets/Svgs/Svgs';
import {Text} from 'react-native-gesture-handler';
import DepartmentPerformance from './DepartmentPerformance';
import WorkerSchedule from './WorkerSchedule';
import WorkerDailyPerformance from './WorkerDailyPerformance';
import CompanyDailyPerformance from './CompanyDailyPerformance';
import UpgradeFeatureView from '@components/UpgradeFeatureView/UpgradeFeatureView';
import logger from '@utils/logger';


const getMonthStartEnd = () => {
  const now = new Date();

  // First day of month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  // Last day of month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Format YYYY-MM-DD
  const formatDate = date => date.toISOString().split('T')[0]; // gives 2025-10-03

  return {
    dateStart: formatDate(start),
    dateEnd: formatDate(end),
  };
};

const ReportsStatistics = ({navigation}) => {
  const features = useSelector(store => store.subscription?.features);
  const hasFeature = features?.includes('reports');
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);

  const {dateStart, dateEnd} = getMonthStartEnd();

  const [filters, setFilters] = useState({
    dateStart,
    dateEnd,
    filterApplied: false,
  });
  const filtersSheetRef = useRef();

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      dateStart: dateStart,
      dateEnd: dateEnd,
      filterApplied: false,
    }));
  }, []);
  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      dateStart: data.date_from ? data.date_from : dateStart,
      dateEnd: data.date_to ? data.date_to : dateEnd,
      filterApplied: true,
    }));
  }, []);
  return (
    <View style={styles.container}>
      {hasFeature === false && (
        <UpgradeFeatureView
          navigation={navigation}
          featureName="Reports"
          backIcon={true}
        />
      )}
      <StackHeader
        title={'Reports & Statistics'}
        headerTxtStyle={{
          textAlign: 'left',
          fontSize: RFPercentage(pxToPercentage(20)),
          fontFamily: Fonts.PoppinsSemiBold,
        }}
        headerStyle={{
          paddingTop: hp(2),
          backgroundColor: isDarkMode
            ? Colors.darkTheme.secondryColor
            : Colors.lightTheme.backgroundColor,
          paddingBottom: hp(0),
        }}
        onBackPress={() => navigation.goBack()}
        rightIcon={
          filters.filterApplied ? (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={clearFilters}>
              <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => filtersSheetRef.current?.open()}>
              <Svgs.filter />
            </TouchableOpacity>
          )
        }
      />


      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: hp(12)}}>
        <CompanyPerformance
          dateStart={filters.dateStart}
          dateEnd={filters.dateEnd}
        />
        <DepartmentPerformance
          dateStart={filters.dateStart}
          dateEnd={filters.dateEnd}
        />
        <WorkerSchedule
          dateStart={filters.dateStart}
          dateEnd={filters.dateEnd}
        />

        <CompanyDailyPerformance
          dateStart={filters.dateStart}
          dateEnd={filters.dateEnd}
        />
        <WorkerDailyPerformance
        dateStart={filters.dateStart}
        dateEnd={filters.dateEnd}
      />
      </ScrollView>

      <ReportsFilterBtmSheet
        refRBSheet={filtersSheetRef}
        onApplyFilters={onApplyFilters}
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

export default ReportsStatistics;
