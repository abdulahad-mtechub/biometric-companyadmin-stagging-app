import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors } from '@constants/themeColors';
import { Fonts } from '@constants/Fonts';
import { useAlert } from '@providers/AlertContext';
import { exportToExcelTable, exportToPDFTable } from '@utils/exportUtils';
import { t } from 'i18next';
import logger from '@utils/logger';

const ReportTablePreviewModal = ({
  visible,
  onClose,
  title = 'Employee Report',
  tableData = [],
  theme = 'light', // 'dark' or 'light'
}) => {
  const colorTheme = theme === 'dark' ? Colors.darkTheme : Colors.lightTheme;
  const {showAlert} = useAlert()

  const columnHeaders ={
    title: t('Report Preview'),
    date: t('Date'),
    hoursWorked: t('Hours Worked'),
    tasksCompleted: t('Tasks Completed'),
    efficiency: t('Efficiency %'),
  }
  const excelColumnHeaders =[
    t('Date'),
    t('Hours Worked'),
    t('Tasks Completed'),
    t('Efficiency %'),
  ]

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colorTheme.secondryColor },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: colorTheme.primaryTextColor,
                  fontFamily: Fonts.PoppinsSemiBold,
                  width: '80%',
                },
              ]}
            >
              {t(title)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{
                  fontSize: RFPercentage(2.8),
                  color: colorTheme.iconColor,
                  fontFamily: Fonts.PoppinsBold,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { borderBottomColor: colorTheme.BorderGrayColor },
            ]}
          />

          {/* Table Header */}
          <View
            style={[
              styles.tableHeader,
              { backgroundColor: colorTheme.backgroundColor },
            ]}
          >
            {['Date', 'Hours Worked', 'Tasks Completed', 'Efficiency %'].map(
              (col, index) => (
                <Text
                  key={index}
                  style={[
                    styles.headerText,
                    { color: colorTheme.primaryTextColor },
                  ]}
                >
                  {t(col)}
                </Text>
              )
            )}
          </View>

          {/* Table Body */}
          <ScrollView
            style={{ maxHeight: hp(55) }}
            showsVerticalScrollIndicator={false}
          >
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor:
                        index % 2 === 0
                          ? colorTheme.inputBackgroundColor
                          : colorTheme.secondryColor,
                      borderBottomColor: colorTheme.BorderGrayColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: colorTheme.primaryTextColor,
                        fontSize: RFPercentage(1.4),
                      },
                    ]}
                  >
                    {row.date}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      { color: colorTheme.primaryTextColor },
                    ]}
                  >
                    {row.hoursWorked}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      { color: colorTheme.primaryTextColor },
                    ]}
                  >
                    {row.tasksCompleted}
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color:
                          row.efficiency === '100%'
                            ? 'green'
                            : colorTheme.primaryTextColor,
                      },
                    ]}
                  >
                    {row.efficiency}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={{
                  color: colorTheme.secondryTextColor,
                  textAlign: 'center',
                  marginTop: hp(2),
                  fontFamily: Fonts.PoppinsRegular,
                }}
              >
                {t("No data available")}
              </Text>
            )}
          </ScrollView>

          {/* ===== Buttons Section ===== */}
          {tableData.length > 0 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.exportButton,
                  { backgroundColor: colorTheme.primaryBtn.BtnColor },
                ]}
                onPress={() => exportToPDFTable(tableData, showAlert, onClose, columnHeaders)}
              >
                <Text
                  style={{
                    color: colorTheme.primaryBtn.TextColor,
                    fontFamily: Fonts.PoppinsMedium,
                    fontSize: RFPercentage(1.8),
                  }}
                >
                  {t("Export to PDF")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.exportButton,
                  { backgroundColor: colorTheme.primaryBtn.BtnColor },
                ]}
                onPress={() => exportToExcelTable(tableData,showAlert, onClose, excelColumnHeaders)}
              >
                <Text
                  style={{
                    color: colorTheme.primaryBtn.TextColor,
                    fontFamily: Fonts.PoppinsMedium,
                    fontSize: RFPercentage(1.8),
                  }}
                >
                  {t("Export to Excel")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReportTablePreviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    borderRadius: wp(3),
    padding: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: RFPercentage(2.3),
  },
  divider: {
    borderBottomWidth: 1,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    borderBottomWidth: 1,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: RFPercentage(1.7),
    fontFamily: Fonts.PoppinsMedium,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
    borderBottomWidth: 0.5,
  },
  cellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: RFPercentage(1.6),
    fontFamily: Fonts.PoppinsRegular,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp(2),
  },
  exportButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
  },
});
