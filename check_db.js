const { Client } = require('pg');

const config = {
  host: '103.91.189.135',
  user: 'postgres',
  password: '#Pass@123SAFARI#',
  database: 'postgres',
  port: 5432,
};

const client = new Client(config);

async function checkSchema() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    console.log('Columns for hotels:');
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await client.end();
  }
}

checkSchema();
