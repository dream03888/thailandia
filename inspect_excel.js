const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\user\\Downloads\\hotels_export_2026-03-25.xlsx';
try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Headers:', data[0]);
  console.log('Row 1:', data[1]);
  console.log('Row 2:', data[2]);
} catch (err) {
  console.error('Error reading excel:', err);
}
