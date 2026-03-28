const { Client } = require('pg');

const config = {
  host: '103.91.189.135',
  user: 'postgres',
  password: '#Pass@123SAFARI#',
  database: 'postgres',
  port: 5432,
};

const tables = ['hotels', 'room_types', 'hotel_contacts', 'hotel_fees', 'hotel_promotions'];

async function checkAllSchemas() {
  const client = new Client(config);
  try {
    await client.connect();
    for (const table of tables) {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.log(`\n--- Table: ${table} ---`);
      res.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type}`);
      });
    }
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await client.end();
  }
}

checkAllSchemas();
