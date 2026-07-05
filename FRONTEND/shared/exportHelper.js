/* ============================================================
   EXPORT HELPER — shared Excel/PDF export for report tables + charts.
   ============================================================
   Load AFTER these CDN libraries (added per-page, only where export is used):
     <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>
     <script src="../../shared/exportHelper.js"></script>

   Uses ExcelJS (not plain SheetJS) so headers/borders/colors actually render
   as a formatted table, and so a chart image can be embedded on its own sheet.
   `columns`: [{ key, label }] — key reads from each row object, label is the
   header shown in Excel/PDF.
   ============================================================ */

const EXPORT_HEADER_FILL = 'FF1E3A8A';
const EXPORT_BORDER_COLOR = 'FFDDE5F2';

const EXPORT_MAX_COL_WIDTH = 45;

function styleWorksheetTable(sheet) {
  const headerRow = sheet.getRow(1);
  headerRow.height = 20;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXPORT_HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });
  sheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: EXPORT_BORDER_COLOR } },
        left: { style: 'thin', color: { argb: EXPORT_BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: EXPORT_BORDER_COLOR } },
        right: { style: 'thin', color: { argb: EXPORT_BORDER_COLOR } },
      };
      if (rowNumber > 1) cell.alignment = { vertical: 'top', wrapText: true };
    });
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

/** Column width sized to the longest value actually in that column (header or data), not just the header. */
function computeColumnWidth(column, rows) {
  const headerLen = column.label.length;
  const longestValue = rows.reduce((max, row) => {
    const val = row[column.key];
    const len = val == null ? 0 : String(val).length;
    return Math.max(max, len);
  }, 0);
  return Math.min(Math.max(headerLen, longestValue) + 2, EXPORT_MAX_COL_WIDTH);
}

function addTableSheet(workbook, sheetName, columns, rows) {
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map(c => ({ header: c.label, key: c.key, width: computeColumnWidth(c, rows) }));
  rows.forEach(r => sheet.addRow(r));
  styleWorksheetTable(sheet);
  return sheet;
}

/**
 * Adds a sheet containing only an embedded chart image (base64 PNG data URL).
 * `aspectRatio` (width/height) should come from the real chart canvas
 * (e.g. `chart.canvas.width / chart.canvas.height`) so the embedded image
 * isn't stretched/squished to a guessed ratio.
 */
function addChartImageSheet(workbook, sheetName, chartImageBase64, aspectRatio) {
  if (!chartImageBase64) return;
  const base64 = chartImageBase64.replace(/^data:image\/png;base64,/, '');
  const imageId = workbook.addImage({ base64, extension: 'png' });
  const sheet = workbook.addWorksheet(sheetName);
  const width = 1800; // spans roughly column A to AB at default column width
  const height = Math.round(width / (aspectRatio || 16 / 9));
  sheet.addImage(imageId, { tl: { col: 0.5, row: 0.5 }, ext: { width, height } });
}

async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Single-table Excel export (optionally with a chart image on a second sheet). */
async function exportToExcel(filename, sheetName, columns, rows, chartImageBase64) {
  if (typeof ExcelJS === 'undefined') {
    alert('Library Excel belum termuat. Coba refresh halaman.');
    return;
  }
  const workbook = new ExcelJS.Workbook();
  addTableSheet(workbook, sheetName, columns, rows);
  if (chartImageBase64) addChartImageSheet(workbook, 'Grafik', chartImageBase64);
  await downloadWorkbook(workbook, filename);
}

function addPdfTable(doc, startY, sectionTitle, columns, rows, headColor) {
  if (sectionTitle) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(20);
    doc.text(sectionTitle, 14, startY);
    startY += 4;
  }
  doc.autoTable({
    startY,
    head: [columns.map(c => c.label)],
    body: rows.map(row => columns.map(c => (row[c.key] ?? '—').toString())),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: headColor || [30, 58, 138] },
    alternateRowStyles: { fillColor: [245, 247, 251] },
  });
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Full report PDF: title, optional meta line, a table, and (if provided) a
 * chart image below the table. `chartAspectRatio` (width/height) should come
 * from the real chart canvas (e.g. `chart.canvas.width / chart.canvas.height`)
 * — guessing a ratio stretches/squishes the embedded image.
 */
function exportToPdf(filename, title, columns, rows, meta, chartImageBase64, chartAspectRatio) {
  if (typeof window.jspdf === 'undefined') {
    alert('Library PDF belum termuat. Coba refresh halaman.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' });

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 16);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 22);
  if (meta) doc.text(meta, 14, 27);

  const afterTableY = addPdfTable(doc, meta ? 33 : 28, null, columns, rows);

  if (chartImageBase64) {
    addPdfChartImage(doc, afterTableY, chartImageBase64, chartAspectRatio);
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Places a chart image below `startY`, preserving its real aspect ratio
 * (width/height from the source canvas) and adding a new page if it
 * wouldn't fit on the current one.
 */
function addPdfChartImage(doc, startY, chartImageBase64, chartAspectRatio, label) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const ratio = chartAspectRatio || 16 / 9;
  const maxWidth = pageWidth - 28;
  const maxHeight = pageHeight - 28;

  let imgWidth = maxWidth;
  let imgHeight = imgWidth / ratio;
  if (imgHeight > maxHeight) { imgHeight = maxHeight; imgWidth = imgHeight * ratio; }

  const fitsOnPage = startY + imgHeight <= pageHeight - 14;
  if (!fitsOnPage) doc.addPage();
  const y = fitsOnPage ? startY : 16;

  if (label) {
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(20);
    doc.text(label, 14, y);
    doc.addImage(chartImageBase64, 'PNG', 14, y + 4, imgWidth, imgHeight);
  } else {
    doc.addImage(chartImageBase64, 'PNG', 14, y, imgWidth, imgHeight);
  }
}
