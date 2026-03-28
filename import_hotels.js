const XLSX = require('xlsx');
const { Client } = require('pg');

const config = {
  host: '103.91.189.135',
  user: 'postgres',
  password: '#Pass@123SAFARI#',
  database: 'postgres',
  port: 5432,
};

const filePath = 'C:\\Users\\user\\Downloads\\hotels_export_2026-03-25.xlsx';

async function importHotels() {
  const client = new Client(config);
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} hotels in Excel.`);
    await client.connect();

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      // Check if hotel already exists by name and city
      const checkRes = await client.query(
        'SELECT id FROM hotels WHERE name = $1 AND city = $2',
        [row.name, row.city]
      );

      if (checkRes.rows.length > 0) {
        console.log(`Skipping existing hotel: ${row.name} (${row.city})`);
        skippedCount++;
        continue;
      }

      await client.query(
        'INSERT INTO hotels (name, city, address, notes) VALUES ($1, $2, $3, $4)',
        [row.name, row.city, row.address, row.notes]
      );
      importedCount++;
    }

    console.log(`Import complete!`);
    console.log(`- Imported: ${importedCount}`);
    console.log(`- Skipped (Duplicates): ${skippedCount}`);

  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await client.end();
  }
}

importHotels();
