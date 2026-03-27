import {t} from 'i18next';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {Fonts} from '@constants/Fonts';
import {baseUrl} from '@constants/urls';
import {useAlert} from '@providers/AlertContext';
import {Svgs} from '@assets/Svgs/Svgs';
import ReportTablePreviewModal from '@components/CustomModal/ReportTablePreviewModal';
import Loader from '@components/Loaders/loader';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {pxToPercentage} from '@utils/responsive';
import logger from '@utils/logger';

const CompanyDailyPerformance = ({dateStart, dateEnd}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, company, language} = useSelector(store => store.auth);
  const {showAlert} = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [visible, setVisible] = useState(false);

  // ---------- Bar Chart Data ----------

  const getReports = async (dateStart, dateEnd) => {
    const payload = {
      type: 'company_daily',
      startDate: dateStart,
      endDate: dateEnd,
      companyId: company.id,
      showChartData: true,
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
  }, [dateStart, dateEnd]);

  // Format date for labels
  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'short'});
    return `${day < 10 ? '0' : ''}${day} ${month}`;
  };

  // Prepare data for the chart
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
        <Text style={styles.Heading}>{t('Company Daily Performance')}</Text>
      </View>
      {/* ----------- Card 1: Bar Chart ----------- */}
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
                {t('Performance Metrics')}
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
                width={500}
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
                spacing={50}
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

      <ReportTablePreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Company Daily Performance"
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
    },
    sectionHeading: {
      fontFamily: Fonts.PoppinsSemiBold,
      fontSize: RFPercentage(pxToPercentage(16)),
      color: isDarkMode
        ? Colors.darkTheme.primaryTextColor
        : Colors.lightTheme.primaryTextColor,
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

export default CompanyDailyPerformance;
