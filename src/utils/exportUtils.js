import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx';
import RNHTMLtoPDF, {generatePDF} from 'react-native-html-to-pdf';
import uuid from 'react-native-uuid';
import logger from '@utils/logger';
import { t } from 'i18next';
import {capitalize} from '@utils/Helpers';

const urlToBase64 = async imageUrl => {
  try {
    const fileName = imageUrl.split('/').pop();
    const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // Download image locally
    await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: localPath,
    }).promise;

    // Convert to base64
    return await RNFS.readFile(localPath, 'base64');
  } catch (error) {
    logger.log('Image Base64 Error:', error, { context:'exportUtils' });
    return null;
  }
};

export const exportToExcelTable = async (
  tableData,

  showAlert,
  onClose,
  excelColumnHeaders
) => {
  try {
    // Step 1: Convert JSON → sheet
    const ws = XLSX.utils.json_to_sheet(tableData);

    XLSX.utils.sheet_add_aoa(ws, [excelColumnHeaders], { origin: "A1" });

    // Step 3: Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // Step 4: Write Excel file
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const uniqueId = uuid.v4();

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;
    const filePath = `${directoryPath}/Report_${uniqueId}.xlsx`;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    await RNFS.writeFile(filePath, wbout, "base64");

    logger.log("Excel file saved to:", filePath, { context:'exportUtils' });
    showAlert?.(`Excel file saved to: ${filePath}`, "success");
    onClose?.();
  } catch (err) {
    logger.error("Excel Export Error:", err, { context:'exportUtils' });
  }
};

export const exportToPDFTable = async (tableData, showAlert, onClose, columnHeaders) => {
  try {
    // Build HTML table
    const rows = tableData
      .map(
        item => `
        <tr>
          <td>${item.date}</td>
          <td>${item.hoursWorked}</td>
          <td>${item.tasksCompleted}</td>
          <td>${item.efficiency}</td>
        </tr>`,
      )
      .join('');

    const html = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: Arial; }
            th, td { border: 1px solid #888; padding: 8px; text-align: center; }
            th { background: #f2f2f2; font-weight: bold; }
            h2 { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>${columnHeaders.title}</h2>
          <table>
            <tr>
              <th>${columnHeaders.date}</th>
              <th>${columnHeaders.hoursWorked}</th>
              <th>${columnHeaders.tasksCompleted}</th>
              <th>${columnHeaders.efficiency}</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;

    // const pdf = await RNHTMLtoPDF.convert();

    const pdf = await generatePDF({
      html,
      fileName: 'Report',
      base64: false,
    });
    logger.log(pdf, { context:'exportUtils' });
    const uniqueId = uuid.v4(); // e.g., 'a3b2d1f4-...'

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    const downloadDest = `${directoryPath}/Report_${uniqueId}.pdf`;
    await RNFS.moveFile(pdf.filePath, downloadDest);

    logger.log('PDF saved to:', downloadDest, { context:'exportUtils' });
    showAlert?.(`PDF file saved to: ${downloadDest}`, 'success');
    onClose?.();

    // await Share.open({
    //   url: `file://${pdf.filePath}`,
    //   type: 'application/pdf',
    //   filename: 'Report',
    // });
  } catch (err) {
    logger.error('PDF Export Error:', err, { context:'exportUtils' });
  }
};

export const exportToPDFReportPreview = async (
  previewData,
  showAlert,
  onClose,
  Heading,
  column1Heading,
  column2Heading,
  companyLogo // <-- added logo param
) => {
  try {
    const base64Logo = await urlToBase64(companyLogo);

    const logoTag = base64Logo
      ? `<img src="data:image/png;base64,${base64Logo}" class="company-logo" />`
      : '';
    
    // Create HTML string for PDF
    const htmlContent = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: Arial;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
            }
            th {
              background-color: #f2f2f2;
            }
            h2 {
              text-align: center;
            }

            
            .logo-container {
              width: 100%;
              text-align: center;
              margin-bottom: 15px;
            }
            .company-logo {
              width: 120px;
              height: auto;
              object-fit: contain;
            }
          </style>
        </head>

        <body>
          <div class="logo-container">
            ${logoTag}
          </div>

          <h2>${Heading}</h2>

          <table>
            <tr>
              <th>${column1Heading}</th>
              <th>${column2Heading}</th>
            </tr>

            ${previewData
              .map(
                item =>
                  `<tr>
                      <td>${item.label}</td>
                      <td>${item.value ?? "-"}</td>
                  </tr>`
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    // Generate PDF
    const file = await generatePDF({
      html: htmlContent,
      fileName: "ReportPreview",
      base64: false,
    });

    const uniqueId = uuid.v4();

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    const downloadDest = `${directoryPath}/Report_${uniqueId}.pdf`;

    await RNFS.moveFile(file.filePath, downloadDest);

    showAlert?.(`PDF file saved to: ${downloadDest}`, "success");
    console.log("PDF saved to:", downloadDest);

    onClose?.();
  } catch (error) {
    logger.error("PDF export error:", error, { context:'exportUtils' });
    showAlert?.("Failed to generate PDF", "error");
  }
};


export const exportToExcelPreview = async (
  previewData,
  showAlert,
  onClose,
  column1Heading,
  column2Heading,
) => {
  try {
    // Convert previewData to a 2D array
    const sheetData = [
      [column1Heading, column2Heading],
      ...previewData.map(item => [item.label, item.value]),
    ];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Write the file
    const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
    const uniqueId = uuid.v4(); // e.g., 'a3b2d1f4-...'

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;
    const path = `${directoryPath}/Report_${uniqueId}.xlsx`;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    await RNFS.writeFile(path, wbout, 'base64');

    logger.log('Excel file saved to:', path, { context:'exportUtils' });

    showAlert?.(`Excel file saved to: ${path}`, 'success');
    onClose?.();
    // Optional: Share the file
    //   await Share.share({
    //   });

    logger.log('Excel saved at:', path, { context:'exportUtils' });
  } catch (error) {
    logger.error('Excel export error:', error, { context:'exportUtils' });
  }
};

const formatAbsenceData = apiData => {
  return apiData?.map(item => ({
    ID: item.id,
    WorkerName: item?.worker?.name ?? '-',
    EmployeeID: item?.worker?.employeeId ?? '-',
    Department: item?.worker?.department ?? '-',
    AbsenceType: item?.absence?.type?.name ?? '-',
    Paid: item?.absence?.type?.isPaid ? 'Yes' : 'No',
    StartDate: new Date(item?.absence?.startDate).toLocaleDateString('en-GB'),
    EndDate: new Date(item?.absence?.endDate).toLocaleDateString('en-GB'),
    Source: item?.absence?.source ?? '-',
    IsPartial: item?.absence?.isPartial ? 'Yes' : 'No',
    PartialStart: item?.absence?.partialTimes?.start ?? '-',
    PartialEnd: item?.absence?.partialTimes?.end ?? '-',
    Comment: item?.absence?.comment ?? '-',
    CreatedAt: new Date(item?.createdAt).toLocaleString(),
  }));
};

export const exportAbsenceExcel = async (apiData, showAlert, columnHeaders) => {
  try {
    const tableData = formatAbsenceData(apiData); // your data formatter

    const headerRow = columnHeaders;

    // Create worksheet manually
    const ws = XLSX.utils.json_to_sheet([headerRow], {skipHeader: true});

    // Append table data below the header row
    XLSX.utils.sheet_add_json(ws, tableData, {
      skipHeader: true,
      origin: -1, // Append after existing content
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Absences');

    const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});

    const fileName = `AbsenceReport_${uuid.v4()}.xlsx`;

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;
    const filePath = `${directoryPath}/${fileName}`;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    await RNFS.writeFile(filePath, wbout, 'base64');
    console.log(filePath)

    showAlert?.(`Excel file saved: ${filePath}`, 'success');
  } catch (error) {
    logger.error('Excel Export Error:', error, { context:'exportUtils' });
    showAlert?.('Failed to export Excel', 'error');
  }
};

export const exportAbsencePDF = async (
  apiData,
  showAlert,
  heading,
  columns,
  companyLogo,
) => {
  try {
    const tableData = formatAbsenceData(apiData);
    const base64Logo = await urlToBase64(companyLogo);

    const logoTag = base64Logo
      ? `<img src="data:image/png;base64,${base64Logo}" class="company-logo" />`
      : '';
    const rowsHtml = tableData
      .map(
        row => `
        <tr>
          <td>${row.ID}</td>
          <td>${row.WorkerName}</td>
          <td>${row.EmployeeID}</td>
          <td>${row.Department}</td>
          <td>${row.AbsenceType}</td>
          <td>${row.Paid}</td>
          <td>${row.StartDate}</td>
          <td>${row.EndDate}</td>
          <td>${row.Source}</td>
          <td>${row.IsPartial}</td>
          <td>${row.PartialStart}</td>
          <td>${row.PartialEnd}</td>
          <td>${row.Comment}</td>
          <td>${row.CreatedAt}</td>
        </tr>
      `,
      )
      .join('');

      const htmlContent = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              font-family: Arial;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th { background-color: #f4f4f4; }
            h2 { text-align: center; }
      
            
            .logo-container {
              width: 100%;
              text-align: center;
              margin-bottom: 15px;
            }
      
            .company-logo {
              width: 120px;
              height: auto;
            }
          </style>
        </head>
      
        <body>
          <div class="logo-container">
            ${logoTag}
          </div>
      
          <h2>${heading}</h2>
      
          <table>
            <tr>
              <th>${columns.ID}</th>
              <th>${columns.Worker}</th>
              <th>${columns.Emp}</th>
              <th>${columns.Department}</th>
              <th>${columns.Type}</th>
              <th>${columns.Paid}</th>
              <th>${columns.Start}</th>
              <th>${columns.End}</th>
              <th>${columns.Source}</th>
              <th>${columns.Partial}</th>
              <th>${columns.PartialS}</th>
              <th>${columns.PartialE}</th>
              <th>${columns.Comment}</th>
              <th>${columns.Created}</th>
            </tr>
      
            ${rowsHtml}
          </table>
        </body>
      </html>
      `;
      

    const pdfName = `AbsenceReport_${uuid.v4()}`;

    const file = await generatePDF({
      html: htmlContent,
      fileName: pdfName,
      base64: false,
    });

    // Use DocumentDirectoryPath which is more reliable across platforms
    const directoryPath = RNFS.DocumentDirectoryPath;

    // Ensure directory exists
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    const downloadDest = `${directoryPath}/AbsenceReport_${uuid.v4()}.pdf`;
    await RNFS.moveFile(file.filePath, downloadDest);
    console.log(downloadDest);
    showAlert?.(`PDF exported: ${downloadDest}`, 'success');
  } catch (error) {
    logger.error('PDF Export Error:', error, { context:'exportUtils' });
    showAlert?.('Failed to export PDF', 'error');
  }
};

// Expense Export Functions

const formatExpenseDataForExport = (data, isPayroll = false) => {
  if (isPayroll) {
    return data?.map(item => ({
      ID: item.id,
      Employee: item?.worker?.name || '-',
      EmployeeID: item?.worker?.id || '-',
      PaymentDate: item?.paid_at
        ? new Date(item.paid_at).toLocaleDateString()
        : '-',
      Amount: `$${item.amount || 0}`,
      Type: t('Salary') || '-',
      Status: t('Paid') || '-',
      Note: item?.note || '-',
      Proof: item?.attachment_url ? t('Available') : t('Unavailable'),
    }));
  }
  return data?.map(item => ({
    ID: item.id,
    Employee: item?.worker?.name || '-',
    EmployeeID: item?.worker?.id || '-',
    Date: item?.date_of_expense
      ? new Date(item.date_of_expense).toLocaleDateString()
      : '-',
    Amount: `$${item.amount || 0}`,
    Description: item?.description || '-',
    Status: t(capitalize(item?.status)) || '-',
    PaymentState: item?.payment_state === 'sent' ? t('Sent') : t('Not Sent'),
    Proof: item?.receipt_url ? t('Available') : t('Unavailable'),
  }));
};

export const exportExpensePDF = async (
  apiData,
  showAlert,
  heading,
  columns,
  isPayroll = false,
) => {
  try {
    const tableData = formatExpenseDataForExport(apiData, isPayroll);

    const rowsHtml = tableData
      .map(
        row => `
        <tr>
          <td>${row.ID}</td>
          <td>${row.Employee}</td>
          <td>${row.EmployeeID}</td>
          <td>${isPayroll ? row.PaymentDate : row.Date}</td>
          <td>${row.Amount}</td>
          ${isPayroll ? `<td>${row.Type}</td>` : ''}
          <td>${isPayroll ? row.Note : row.Description}</td>
          <td>${row.Status}</td>
          ${!isPayroll ? `<td>${row.PaymentState}</td>` : ''}
          <td>${row.Proof}</td>
        </tr>
      `,
      )
      .join('');

    const headerCols = isPayroll
      ? `<th>${columns.ID}</th><th>${columns.Employee}</th><th>${columns.EmployeeID}</th><th>${columns.Date}</th><th>${columns.Amount}</th><th>${columns.Type}</th><th>${columns.Note}</th><th>${columns.Status}</th><th>${columns.Proof}</th>`
      : `<th>${columns.ID}</th><th>${columns.Employee}</th><th>${columns.EmployeeID}</th><th>${columns.Date}</th><th>${columns.Amount}</th><th>${columns.Description}</th><th>${columns.Status}</th><th>${columns.PaymentState}</th><th>${columns.Proof}</th>`;

    const htmlContent = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: Arial; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
            th { background-color: #f4f4f4; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>${heading}</h2>
          <table>
            <tr>
              ${headerCols}
            </tr>
            ${rowsHtml}
          </table>
        </body>
      </html>
    `;

    const pdfName = `ExpenseReport_${uuid.v4()}`;
    const file = await generatePDF({
      html: htmlContent,
      fileName: pdfName,
      base64: false,
    });

    const directoryPath = RNFS.DocumentDirectoryPath;
    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    

    const downloadDest = `${directoryPath}/ExpenseReport_${uuid.v4()}.pdf`;
    await RNFS.moveFile(file.filePath, downloadDest);
    console.log(downloadDest)

    showAlert?.(`PDF exported: ${downloadDest}`, 'success');
  } catch (error) {
    logger.error('Expense PDF Export Error:', error, { context: 'exportUtils' });
    showAlert?.('Failed to export PDF', 'error');
  }
};

export const exportExpenseExcel = async (
  apiData,
  showAlert,
  columnHeaders,
  isPayroll = false,
) => {
  try {
    const tableData = formatExpenseDataForExport(apiData, isPayroll);
    const headerRow = Object.keys(tableData?.[0] || {});

    const ws = XLSX.utils.json_to_sheet([headerRow], { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, tableData, {
      skipHeader: true,
      origin: -1,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `ExpenseReport_${uuid.v4()}.xlsx`;

    const directoryPath = RNFS.DocumentDirectoryPath;
    const filePath = `${directoryPath}/${fileName}`;
    console.log(filePath)

    const dirExists = await RNFS.exists(directoryPath);
    if (!dirExists) {
      await RNFS.mkdir(directoryPath);
    }

    await RNFS.writeFile(filePath, wbout, 'base64');
    showAlert?.(`Excel file saved: ${filePath}`, 'success');
  } catch (error) {
    logger.error('Expense Excel Export Error:', error, { context: 'exportUtils' });
    showAlert?.('Failed to export Excel', 'error');
  }
};
