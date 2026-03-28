const XLSX = require('xlsx');

const filePath = 'C:\\Users\\user\\Downloads\\hotels_export_2026-03-25.xlsx';
try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} ---`);
    console.log('Headers:', data[0]);
    console.log('Sample Row:', data[1]);
  });
} catch (err) {
  console.error('Error reading excel:', err);
}
