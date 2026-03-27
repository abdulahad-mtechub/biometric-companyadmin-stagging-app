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

const INITIAL_FILTERS = {
  filterApplied: false,
  departmentID: 45,
};
const DepartmentPerformance = ({dateStart, dateEnd}) => {
  const {isDarkMode, Colors} = useSelector(store => store.theme);
  const styles = dynamicStyles(isDarkMode, Colors);
  const {token, company, language} = useSelector(store => store.auth);
const {departments} = useSelector(store => store.states);
  const [filters, setFilters] = useState({
    filterApplied: false,
    departmentID: departments[0]?.value,
  });
  const {showAlert} = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const filtersSheetRef = useRef();

  const [visible, setVisible] = useState(false);


  const previewData = useMemo(() => {
    return [
      { label: "Department Name", value: apiData?.department_name },
      { label: "Start Date", value: new Date(apiData?.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
      { label: "End Date", value: new Date(apiData?.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
      { label: "Tasks Assigned", value: apiData?.tasks_assigned },
      { label: "Tasks Completed", value: apiData?.tasks_completed },
      { label: "Productive Tasks", value: apiData?.productive_tasks },
      { label: "Average Task Time (Hours)", value: apiData?.average_task_time_hours },
      { label: "Hours Worked", value: apiData?.hours_worked },
      { label: "Compliance Percentage", value: `${apiData?.compliance_percentage}%` },
      { label: "Productivity Percentage", value: `${apiData?.productivity_percentage}%` },
      { label: "Efficiency Percentage", value: `${apiData?.efficiency_percentage}%` }
    ];
    ;
  }, [apiData]);




  const pieData = useMemo(() => {
    const efficiency = parseFloat(apiData?.efficiency_percentage) || 0;
    const compliance = parseFloat(apiData?.compliance_percentage) || 0;
    const productivity = parseFloat(apiData?.productivity_percentage) || 0;

    return [
      {
        value: efficiency,
        color: '#FEA362',
        gradientCenterColor: '#FEA362',
        text: `${efficiency}%`,
      },
      {
        value: compliance,
        color: '#579DFF',
        gradientCenterColor: '#579DFF',
        text: `${compliance}%`,
      },
      {
        value: productivity,
        color: '#4BCE97',
        gradientCenterColor: '#4BCE97',
        text: `${productivity}%`,
      },
    ];
  }, [apiData]);

  // Average (or overall performance)
  const overall =
    (parseFloat(apiData?.efficiency_percentage || 0) +
      parseFloat(apiData?.compliance_percentage || 0) +
      parseFloat(apiData?.productivity_percentage || 0)) /
    3;

  const barData = useMemo(
    () => [
      {
        value: apiData?.tasks_assigned,
        label: t('Assigned'),
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: RFPercentage(1.6),
              color: isDarkMode
                ? Colors.darkTheme.primaryColor
                : Colors.lightTheme.primaryColor,
              fontFamily: Fonts.PoppinsSemiBold,
            }}>
            {apiData?.tasks_assigned}
          </Text>
        ),
      },
      {
        value: apiData?.tasks_completed,
        label: t('Completed'),
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: RFPercentage(1.6),
              color: isDarkMode
                ? Colors.darkTheme.primaryColor
                : Colors.lightTheme.primaryColor,
              fontFamily: Fonts.PoppinsSemiBold,
            }}>
            {apiData?.tasks_completed}
          </Text>
        ),
      },
      {
        value: apiData?.productive_tasks,
        label: t('Productive'),
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: RFPercentage(1.6),
              color: isDarkMode
                ? Colors.darkTheme.primaryColor
                : Colors.lightTheme.primaryColor,
              fontFamily: Fonts.PoppinsSemiBold,
            }}>
            {apiData?.productive_tasks}
          </Text>
        ),
      },
    ],
    [apiData],
  );

  const getReports = async (dateStart, dateEnd) => {
    const payload = {
      type: 'department_performance',
      startDate: dateStart,
      endDate: dateEnd,
      companyId: company.id,
      showChartData: true,
      department: filters.departmentID,
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
  }, [dateStart, dateEnd, filters.departmentID]);


  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      departmentID: departments[0].value,
      filterApplied: false,
    }));
  }, []);
  const onApplyFilters = useCallback(data => {
    setFilters(prev => ({
      ...prev,
      departmentID: data.department? data.department : departments[0].value,
      filterApplied: true,
    }));
  }, []);
  return (
    <View>
      <View style={styles.rowViewSB}>
        <Text style={styles.Heading}>{t('Department Performance')}</Text>
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
              <Text style={styles.sectionHeading}>{t('Task Summary')}</Text>
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
                hideRules
                xAxisColor={'#999'}
                xAxisLabelTextStyle={{
                  color: '#666',
                  fontFamily: Fonts.PoppinsMedium,
                  fontSize: RFPercentage(1.8),
                }}
                frontColor={Colors.lightTheme.primaryColor}
                yAxisTextStyle={{
                  color: '#666',
                  fontFamily: Fonts.PoppinsRegular,
                  fontSize: RFPercentage(1.6),
                }}
                maxValue={10}
                stepValue={2}
              />
            </View>
          </View>

          {/* ----------- Card 2: Pie Chart ----------- */}
          <View style={styles.CardContainer}>
            <Text style={styles.sectionHeading}>
              {t('Performance Metrics')}
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
                        fontSize: RFPercentage(3),
                        color: isDarkMode
                          ? Colors.darkTheme.textPrimary
                          : Colors.lightTheme.textPrimary,
                      }}>
                      {overall.toFixed(2)}%
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.PoppinsMedium,
                        fontSize: RFPercentage(1.6),
                        color: isDarkMode
                          ? Colors.darkTheme.textSecondary
                          : Colors.lightTheme.textSecondary,
                      }}>
                      {t('Overall performance')}
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
        showDepartments={true}
        height={hp(40)}
      />

<ReportsPreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={previewData}
        theme="light"
        onButtonPress={async () => {}}
        title={'Department Performance'}
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

export default DepartmentPerformance;
