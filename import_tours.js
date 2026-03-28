const XLSX = require('xlsx');
const { Client } = require('pg');

const config = { host: 'localhost', user: 'postgres', password: 'postgres', database: 'postgres', port: 5432 };
const filePath = 'C:\\Users\\user\\Downloads\\tours_export_2026-03-25.xlsx';

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
    const master = XLSX.utils.sheet_to_json(wb.Sheets['Tours_Master']);
    const pricing = XLSX.utils.sheet_to_json(wb.Sheets['Tour_Pricing']);
    const days = XLSX.utils.sheet_to_json(wb.Sheets['Tour_Days']);
    const services = XLSX.utils.sheet_to_json(wb.Sheets['Tour_Services']);

    console.log(`Importing ${master.length} tours...`);
    for (const m of master) {
      let id;
      const res = await client.query('SELECT id FROM tours WHERE name = $1', [m.name]);
      if (res.rows.length > 0) {
        id = res.rows[0].id;
        await client.query('DELETE FROM tour_pricing WHERE tour_id = $1', [id]);
        await client.query('DELETE FROM tour_days WHERE tour_id = $1', [id]);
        await client.query('DELETE FROM tour_services WHERE tour_id = $1', [id]);
        await client.query('UPDATE tours SET category=$1, description=$2, duration=$3, route=$4, departures=$5, code=$6, city=$7, supplier_name=$8 WHERE id=$9', [m.category, m.description + (m.date ? ' (Starts: ' + m.date + ')' : ''), m.duration, m.route, m.tot || 'SIC', m.code || '', m.city, m.supplier_name, id]);
      } else {
        const ins = await client.query('INSERT INTO tours (name, category, description, duration, route, departures, code, city, supplier_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [m.name, m.category, m.description + (m.date ? ' (Starts: ' + m.date + ')' : ''), m.duration, m.route, m.tot || 'SIC', m.code || '', m.city, m.supplier_name]);
        id = ins.rows[0].id;
      }

      // Pricing
      const pList = pricing.filter(p => p.tour_name === m.name);
      for (const p of pList) {
        await client.query('INSERT INTO tour_pricing (tour_id, start_date, end_date, single_room_price, double_room_price, triple_room_price) VALUES ($1,$2,$3,$4,$5,$6)', [id, formatDate(p.start_date), formatDate(p.end_date), p.single_price, p.double_price, p.triple_price]);
      }

      // Days
      const dList = days.filter(d => d.tour_name === m.name);
      for (const d of dList) {
        await client.query('INSERT INTO tour_days (tour_id, day, itinerary) VALUES ($1,$2,$3)', [id, d.day, d.itinerary]);
      }

      // Services
      const sList = services.filter(s => s.tour_name === m.name);
      for (const s of sList) {
        await client.query('INSERT INTO tour_services (tour_id, day, city, service_type, service_name, from_time, to_time, room_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, s.day, s.city, s.service_type, s.service_name, s.from_time, s.to_time, s.room_type]);
      }
    }
    console.log('Tours import complete.');
  } catch (err) { console.error(err); } finally { await client.end(); }
}
run();
