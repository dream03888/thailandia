const XLSX = require('xlsx');
const { Client } = require('pg');

const config = { host: 'localhost', user: 'postgres', password: 'postgres', database: 'postgres', port: 5432 };
const filePath = 'C:\\Users\\user\\Downloads\\transfers_export_2026-03-25.xlsx';

function formatDate(val) {
  if (!val) return null;
  if (typeof val === 'string' && val.includes('-')) {
    const parts = val.split('-');
    if (parts[0].length === 4) return val;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
}

async function run() {
  const client = new Client(config);
  try {
    await client.connect();
    const wb = XLSX.readFile(filePath);
    const master = XLSX.utils.sheet_to_json(wb.Sheets['Transfers_Master']);
    const pricing = XLSX.utils.sheet_to_json(wb.Sheets['Transfer_Pricing']);

    console.log(`Importing ${master.length} transfers...`);
    for (const m of master) {
      let id;
      const res = await client.query('SELECT id FROM transfers WHERE description = $1 AND city = $2', [m.description, m.city]);
      if (res.rows.length > 0) {
        id = res.rows[0].id;
        await client.query('DELETE FROM transfer_pricing WHERE transfer_id = $1', [id]);
        await client.query('UPDATE transfers SET transfer_type=$1, departure=$2, arrival=$3, supplier_name=$4 WHERE id=$5', [m.transfer_type, m.departure, m.arrival, m.supplier_name, id]);
      } else {
        const ins = await client.query('INSERT INTO transfers (description, city, transfer_type, departure, arrival, supplier_name) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [m.description, m.city, m.transfer_type, m.departure, m.arrival, m.supplier_name]);
        id = ins.rows[0].id;
      }

      const pList = pricing.filter(p => p.transfer_description === m.description);
      for (const p of pList) {
        await client.query('INSERT INTO transfer_pricing (transfer_id, start_date, end_date, pax, price, cost) VALUES ($1,$2,$3,$4,$5,$6)', [id, formatDate(p.start_date), formatDate(p.end_date), p.pax, p.price, 0]);
      }
    }
    console.log('Transfers import complete.');
  } catch (err) { console.error(err); } finally { await client.end(); }
}
run();
