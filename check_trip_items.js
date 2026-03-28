const { Client } = require('pg');

const config = {
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432,
};

async function check() {
  const client = new Client(config);
  try {
    await client.connect();
    const tables = ['hotel_trip_items', 'transfer_trip_items', 'excursion_trip_items', 'tour_trip_items', 'flight_trip_items', 'other_trip_items'];
    for (const t of tables) {
      const res = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', [t]);
      console.log(`--- ${t} ---`);
      res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
