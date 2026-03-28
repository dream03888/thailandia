const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432,
};

async function createAdmin() {
  const client = new Client(config);
  try {
    await client.connect();
    const hash = await bcrypt.hash('admin123', 10);
    
    // Check if user exists
    const check = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (check.rows.length > 0) {
      await client.query('UPDATE users SET password = $1, role = $2 WHERE username = $3', [hash, 'admin', 'admin']);
      console.log('Admin user updated.');
    } else {
      await client.query('INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)', 
        ['admin', hash, 'admin@thailandia.com', 'admin']);
      console.log('Admin user created.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createAdmin();
