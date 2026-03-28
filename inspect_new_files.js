const XLSX = require('xlsx');

const files = [
  'C:\\Users\\user\\Downloads\\transfers_export_2026-03-25.xlsx',
  'C:\\Users\\user\\Downloads\\excursions_export_2026-03-25.xlsx',
  'C:\\Users\\user\\Downloads\\tours_export_2026-03-25.xlsx'
];

files.forEach(filePath => {
  try {
    const workbook = XLSX.readFile(filePath);
    console.log(`\n================================`);
    console.log(`FILE: ${filePath}`);
    console.log(`SHEETS: ${workbook.SheetNames}`);
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`\n--- [${sheetName}] ---`);
      console.log('Headers:', data[0]);
      console.log('Sample Row:', data[1]);
    });
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
});
