import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {BarChart, LineChart, PieChart} from 'react-native-gifted-charts';
import {t} from 'i18next';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useAlert} from '@providers/AlertContext';
import {baseUrl} from '@constants/urls';
import Loader from '@components/Loaders/loader';
import {Svgs} from '@assets/Svgs/Svgs';
import ReportsFilterBtmSheet from '@components/BottomSheets/ReportsFilterBtmSheet';
import ReportTablePreviewModal from '@components/CustomModal/ReportTablePreviewModal';
import moment from 'moment';
import logger from '@utils/logger';

const WorkerDailyPerformance = ({dateStart, dateEnd}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, company, language} = useSelector(store => store.auth);
  const {workers} = useSelector(store => store.states);

  const [filters, setFilters] = useState({
    filterApplied: false,
    workerID: workers[0]?.value,
  });
  const {showAlert} = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const filtersSheetRef = useRef();
  const [visible, setVisible] = useState(false);

  const getReports = async (dateStart, dateEnd) => {
    const payload = {
      type: 'worker_daily',
      startDate: dateStart,
      endDate: dateEnd,
      companyId: company.id,
      showChartData: true,
      workerId: filters.workerID,
    };
    const {ok, data} = await fetchApis(
      `${baseUrl}/public/reports/generate`,
      'POST',
      setIsLoading,
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
    } else {
      setApiData(data.data.data);
    }
  };

  useEffect(() => {
    getReports(dateStart, dateEnd);
  }, [dateStart, dateEnd, filters.workerID]);

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      workerID: workers[0].value,
      filterApplied: false,
    }));
  }, []);
  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      workerID: data.workerID ? data.workerID : workers[0].value,
      filterApplied: true,
    }));
  }, []);

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'short'});
    return `${day < 10 ? '0' : ''}${day} ${month}`;
  };

  const hoursWorkedData = apiData.map(item => ({
    value: parseFloat(item.hours_worked),
    label: formatDate(item.report_date),
    labelTextStyle: {color: '#9CA3AF', fontSize: 10},
  }));

  const tasksCompletedData = apiData.map(item => ({
    value: parseFloat(item.tasks_completed),
  }));

  const efficiencyData = apiData.map(item => ({
    value: parseFloat(item.efficiency_percentage),
  }));

  const tableData = apiData?.map(item => ({
    date: moment(item?.report_date).format('DD-MMM-YYYY'),
    hoursWorked: item?.hours_worked,
    tasksCompleted: item?.tasks_completed,
    efficiency: `${item?.efficiency_percentage}%`,
  }));

  return (
    <View>
      <View style={styles.rowViewSB}>
        <Text style={styles.Heading}>{t('Employee Daily Performance')}</Text>
        {filters.filterApplied ? (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearFilters}>
            <Text style={styles.clearFilterText}>{t('Clear Filters')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => filtersSheetRef.current?.open()}>
            <Svgs.filter />
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading ? (
        <Loader size={wp(10)} />
      ) : (
        <>
          <View style={styles.CardContainer}>
            <View
              style={[
                styles.rowViewSB,
                {paddingHorizontal: 0, paddingVertical: 0},
              ]}>
              <Text style={styles.sectionHeading}>
                {t('Daily Performance Chart')}
              </Text>
              {apiData.length > 0 && (
                <TouchableOpacity
                  style={styles.chevron}
                  onPress={() => setVisible(true)}>
                  <Svgs.chevronRight />
                </TouchableOpacity>
              )}
            </View>

            <View style={{marginTop: hp(2), overflow: 'hidden'}}>
              <LineChart
                data={hoursWorkedData}
                data2={tasksCompletedData}
                data3={efficiencyData}
                height={250}
                width={1200}
                maxValue={100}
                noOfSections={5}
                color1="#3B82F6"
                color2="#10B981"
                color3="#F59E0B"
                thickness1={2}
                thickness2={2}
                thickness3={2}
                curved
                startFillColor1="#3B82F6"
                startFillColor2="#10B981"
                startFillColor3="#F59E0B"
                endFillColor1="#3B82F6"
                endFillColor2="#10B981"
                endFillColor3="#F59E0B"
                startOpacity={0.1}
                endOpacity={0.01}
                spacing={80}
                backgroundColor="white"
                rulesColor="#E5E7EB"
                rulesType="solid"
                xAxisColor="#E5E7EB"
                yAxisColor="#E5E7EB"
                yAxisTextStyle={{color: '#9CA3AF', fontSize: 10}}
                xAxisLabelTextStyle={{color: '#9CA3AF', fontSize: 10}}
                hideDataPoints1={false}
                hideDataPoints2={false}
                hideDataPoints3={false}
                dataPointsRadius1={3}
                dataPointsRadius2={3}
                dataPointsRadius3={3}
                dataPointsColor1="#3B82F6"
                dataPointsColor2="#10B981"
                dataPointsColor3="#F59E0B"
                showVerticalLines
                verticalLinesColor="#E5E7EB"
                initialSpacing={10}
                endSpacing={20}
                adjustToWidth={true}
              />
            </View>
          </View>
        </>
      )}

      <ReportsFilterBtmSheet
        refRBSheet={filtersSheetRef}
        onApplyFilters={onApplyFilters}
        showWorkers={true}
        height={hp(70)}
      />

      <ReportTablePreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Employee Daily Performance"
        theme="light"
        tableData={tableData}
      />
    </View>
  );
};

const dynamicStyles = (isDarkMode, Colors) =>
  StyleSheet.create({
    CardContainer: {
      paddingVertical: hp(2),
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      borderRadius: wp(5),
      marginTop: hp(2),
      marginBottom: hp(2),
      marginHorizontal: wp(2),
      overflow: 'hidden',
      paddingHorizontal: wp(3),
    },
    Heading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(18)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
        width: `60%`
    },
    sectionHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
        width: '70%'
    },
    ChartSubHeading: {
      fontFamily: Fonts.PoppinsMedium,
      fontSize: RFPercentage(pxToPercentage(14)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    ChartPercentageText: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(30)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
    },
    rowViewSB: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode
        ? Colors.darkTheme.secondryColor
        : Colors.lightTheme.backgroundColor,
      paddingVertical: hp(2),
      paddingHorizontal: wp(4),
    },
    chevron: {
      backgroundColor: Colors.lightTheme.primaryColor,
      paddingVertical: wp(1.5),
      paddingHorizontal: wp(3),
      borderRadius: wp(2),
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

export default WorkerDailyPerformance;
