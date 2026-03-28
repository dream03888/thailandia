const XLSX = require('xlsx');
const { Client } = require('pg');

const config = { host: 'localhost', user: 'postgres', password: 'postgres', database: 'postgres', port: 5432 };
const filePath = 'C:\\Users\\user\\Downloads\\excursions_export_2026-03-25.xlsx';

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
    const master = XLSX.utils.sheet_to_json(wb.Sheets['Excursions_Master']);
    const pricing = XLSX.utils.sheet_to_json(wb.Sheets['Excursion_Pricing']);

    console.log(`Importing ${master.length} excursions...`);
    for (const m of master) {
      let id;
      const res = await client.query('SELECT id FROM excursions WHERE name = $1 AND city = $2', [m.name, m.city]);
      if (res.rows.length > 0) {
        id = res.rows[0].id;
        await client.query('DELETE FROM excursion_pricing WHERE excursion_id = $1', [id]);
        await client.query('UPDATE excursions SET code=$1, description=$2, sic_price_adult=$3, sic_price_child=$4, walkin_price=$5, supplier_name=$6 WHERE id=$7', [m.code, m.description, m.sic_price_adult, m.sic_price_child, m.walkin_price, m.supplier_name, id]);
      } else {
        const ins = await client.query('INSERT INTO excursions (name, city, code, description, sic_price_adult, sic_price_child, walkin_price, supplier_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [m.name, m.city, m.code, m.description, m.sic_price_adult, m.sic_price_child, m.walkin_price, m.supplier_name]);
        id = ins.rows[0].id;
      }

      const pList = pricing.filter(p => p.excursion_name === m.name);
      for (const p of pList) {
        await client.query('INSERT INTO excursion_pricing (excursion_id, start_date, end_date, pax, price, cost) VALUES ($1,$2,$3,$4,$5,$6)', [id, formatDate(p.start_date), formatDate(p.end_date), p.pax, p.price, p.cost || 0]);
      }
    }
    console.log('Excursions import complete.');
  } catch (err) { console.error(err); } finally { await client.end(); }
}
run();
