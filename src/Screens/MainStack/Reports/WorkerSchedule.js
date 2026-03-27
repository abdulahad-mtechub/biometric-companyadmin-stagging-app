import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {BarChart, PieChart} from 'react-native-gifted-charts';
import {t} from 'i18next';
import {Fonts} from '@constants/Fonts';
import {pxToPercentage} from '@utils/responsive';
import {ApiResponse, fetchApis} from '@utils/Helpers';
import {useAlert} from '@providers/AlertContext';
import {baseUrl} from '@constants/urls';
import Loader from '@components/Loaders/loader';
import {Svgs} from '@assets/Svgs/Svgs';
import ReportsFilterBtmSheet from '@components/BottomSheets/ReportsFilterBtmSheet';
import ReportsPreviewModal from '@components/CustomModal/ReportsPreviewModal';
import logger from '@utils/logger';

const WorkerSchedule = ({dateStart, dateEnd}) => {
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
  const [apiData, setApiData] = useState(null);
  const filtersSheetRef = useRef();

  const [visible, setVisible] = useState(false);


  const previewData = useMemo(() => {
    return [
      { label: "Employee ID", value: apiData?.worker_id },
      { label: "Employee Name", value: apiData?.worker_name },
      { label: "Employee ID", value: apiData?.employee_id },
      { label: "Company Name", value: apiData?.company_name },
      { label: "Total Scheduled Days", value: apiData?.total_scheduled_days },
      { label: "Days Attended", value: apiData?.days_attended },
      { label: "Days Absent", value: apiData?.days_absent },
      { label: "Total Scheduled Hours", value: `${apiData?.total_scheduled_hours} hrs` },
      { label: "Total Actual Hours", value: `${apiData?.total_actual_hours} hrs` },
      { label: "Total Hours Variance", value: `${apiData?.total_hours_variance} hrs` },
      { label: "Avg Scheduled Hours per Day", value: `${apiData?.avg_scheduled_hours_per_day} hrs` },
      { label: "Avg Actual Hours per Day", value: `${apiData?.avg_actual_hours_per_day} hrs` },
      { label: "Overall Compliance Percentage", value: `${apiData?.overall_compliance_percentage}%` },
      { label: "Attendance Rate Percentage", value: `${apiData?.attendance_rate_percentage}%` }
    ];
    ;
  }, [apiData]);

  // ---------- Bar Chart Data ----------

  const pieData = useMemo(() => {
    const actual = parseFloat(apiData?.total_actual_hours) || 0;
    const scheduled = parseFloat(apiData?.total_scheduled_hours) || 0;
    const variance = parseFloat(apiData?.total_hours_variance) || 0;

    const total = actual + scheduled + variance || 1; // prevent division by zero

    const actualPercent = (actual / total) * 100;
    const scheduledPercent = (scheduled / total) * 100;
    const variancePercent = (variance / total) * 100;

    return [
      {
        value: actualPercent,
        color: '#579DFF',
        gradientCenterColor: '#579DFF',
        text: `Actual Hours: ${actualPercent.toFixed(0)}%`,
      },
      {
        value: scheduledPercent,
        color: '#4BCE97',
        gradientCenterColor: '#4BCE97',
        text: `Scheduled Hours: ${scheduledPercent.toFixed(0)}%`,
      },
      {
        value: variancePercent,
        color: '#FEA362',
        gradientCenterColor: '#FEA362',
        text: `Hours Variance: ${variancePercent.toFixed(0)}%`,
      },
    ];
  }, [apiData]);

  const barData = useMemo(
    () => [
      {
        value: parseFloat(apiData?.total_scheduled_days) || 0,
        label: t('Total Days'),
        frontColor: '#579DFF',
      },
      {
        value: parseFloat(apiData?.days_attended) || 0,
        label: t('Attended'),
        frontColor: '#4BCE97',
      },
      {
        value: parseFloat(apiData?.days_absent) || 0,
        label: t('Absent'),
        frontColor: '#FF5630',
      },
    ],
    [apiData],
  );

  const getReports = async (dateStart, dateEnd) => {
    const payload = {
      type: 'schedule_compliance',
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
      setApiData(data.data.data[0]);
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

  const maxBarValue = Math.max(
    parseFloat(apiData?.total_scheduled_days) || 0,
    parseFloat(apiData?.days_attended) || 0,
    parseFloat(apiData?.days_absent) || 0,
  );

  return (
    <View>
      <View style={styles.rowViewSB}>
        <Text style={styles.Heading}>{t('Employee Schedule Compliance')}</Text>
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
              <Text style={styles.sectionHeading}>{t('Attendance Overview')}</Text>
              {
                apiData &&<TouchableOpacity style={styles.chevron} onPress={()=>setVisible(true)} >
                <Svgs.chevronRight />
              </TouchableOpacity>
              }
              
            </View>

            <View style={{marginTop: hp(2), overflow: 'hidden'}}>
              <BarChart
                data={barData}
                barWidth={wp(10)}
                spacing={wp(12)}
                roundedTop
                xAxisColor={'#999'}
                hideRules={false} // better to show gridlines for clarity
                yAxisLabelTexts={[0, Math.ceil(maxBarValue / 2), maxBarValue]}
                xAxisLabelTextStyle={{
                  color: '#666',
                  fontFamily: Fonts.PoppinsMedium,
                  fontSize: RFPercentage(1.8),
                }}
                yAxisTextStyle={{
                  color: '#666',
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(1.6),
                }}
                frontColor={Colors.lightTheme.primaryColor}
                maxValue={Math.ceil(maxBarValue)}
                stepValue={Math.ceil(maxBarValue / 5)} // optional for better tick spacing
              />
            </View>
          </View>

          {/* ----------- Card 2: Pie Chart ----------- */}
          <View style={styles.CardContainer}>
            <Text style={styles.sectionHeading}>
              {t('Hours & Compliance')}
            </Text>
            <View style={{alignItems: 'center'}}>
              <PieChart
                data={pieData}
                donut
                sectionAutoFocus
                innerRadius={85}
                innerCircleColor={
                  isDarkMode
                    ? Colors.darkTheme.secondryColor
                    : Colors.lightTheme.backgroundColor
                }
                strokeWidth={11}
                strokeColor={
                  isDarkMode
                    ? Colors.darkTheme.secondryColor
                    : Colors.lightTheme.backgroundColor
                }
                isAnimated
                animationDuration={1000}
                centerLabelComponent={() => (
                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text
                      style={{
                        fontFamily: Fonts.PoppinsSemiBold,
                        fontSize: RFPercentage(2.8),
                        color: isDarkMode
                          ? Colors.darkTheme.textPrimary
                          : Colors.lightTheme.textPrimary,
                      }}>
                      {parseFloat(apiData?.total_actual_hours || 0).toFixed(2)}{' '}
                      hrs
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.PoppinsMedium,
                        fontSize: RFPercentage(1.6),
                        color: isDarkMode
                          ? Colors.darkTheme.textSecondary
                          : Colors.lightTheme.textSecondary,
                      }}>
                      {t('Actual Hours')}
                    </Text>
                  </View>
                )}
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

<ReportsPreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={previewData}
        theme="light"
        onButtonPress={async () => {}}
        title={'Schedule Compliance'}
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
        width:wp(60)
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

export default WorkerSchedule;
