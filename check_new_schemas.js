const { Client } = require('pg');

const config = {
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432,
};

const tables = [
  'transfers', 'transfer_pricing',
  'excursions', 'excursion_pricing',
  'tours', 'tour_pricing', 'tour_days', 'tour_services'
];

async function checkSchemas() {
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

checkSchemas();
