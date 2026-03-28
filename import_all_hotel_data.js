const XLSX = require('xlsx');
const { Client } = require('pg');

const config = {
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432,
};

const filePath = 'C:\\Users\\user\\Downloads\\hotels_export_2026-03-25.xlsx';

function formatDate(val) {
  if (!val) return null;
  if (typeof val === 'string' && val.includes('-')) {
    const parts = val.split('-');
    if (parts[0].length === 4) return val;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
}

async function importAllData() {
  const client = new Client(config);
  try {
    await client.connect();
    const workbook = XLSX.readFile(filePath);

    const hotelsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Hotels_Master']);
    const contactsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Hotel_Contacts']);
    const feesSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Hotel_Fees']);
    const roomsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Room_Types']);
    const promosSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Hotel_Promotions']);

    console.log(`Starting import for ${hotelsSheet.length} hotels on LOCALHOST...`);

    let importedCount = 0;

    for (const h of hotelsSheet) {
      let hotelId;
      const hotelRes = await client.query('SELECT id FROM hotels WHERE name = $1 AND city = $2', [h.name, h.city]);
      
      if (hotelRes.rows.length > 0) {
        hotelId = hotelRes.rows[0].id;
        await client.query('DELETE FROM hotel_contacts WHERE hotel_id = $1', [hotelId]);
        await client.query('DELETE FROM hotel_fees WHERE hotel_id = $1', [hotelId]);
        await client.query('DELETE FROM room_types WHERE hotel_id = $1', [hotelId]);
        await client.query('DELETE FROM hotel_promotions WHERE hotel_id = $1', [hotelId]);
        await client.query('UPDATE hotels SET address = $1, notes = $2 WHERE id = $3', [h.address, h.notes, hotelId]);
      } else {
        const insertRes = await client.query(
          'INSERT INTO hotels (name, city, address, notes) VALUES ($1, $2, $3, $4) RETURNING id',
          [h.name, h.city, h.address, h.notes]
        );
        hotelId = insertRes.rows[0].id;
      }

      // 2. Contacts
      const hotelContacts = contactsSheet.filter(c => c.hotel_name === h.name);
      for (const c of hotelContacts) {
        await client.query(
          'INSERT INTO hotel_contacts (hotel_id, contact_name, email, telephone, fax) VALUES ($1, $2, $3, $4, $5)',
          [hotelId, c.contact_name, c.email, c.telephone, c.fax]
        );
      }

      // 3. Fees
      const hotelFees = feesSheet.filter(f => f.hotel_name === h.name)[0];
      if (hotelFees) {
        await client.query(
          'INSERT INTO hotel_fees (hotel_id, late_checkout_fee, early_checkin_fee, christmas_dinner_fee, new_year_dinner_fee) VALUES ($1, $2, $3, $4, $5)',
          [hotelId, hotelFees.late_checkout_fee, hotelFees.early_checkin_fee, hotelFees.christmas_dinner_fee, hotelFees.new_year_dinner_fee]
        );
      }

      // 4. Room Types
      const hotelRooms = roomsSheet.filter(r => r.hotel_name === h.name);
      for (const r of hotelRooms) {
        await client.query(
          `INSERT INTO room_types (hotel_id, name, start_date, end_date, allotment, single_price, double_price, 
           extra_bed_adult, extra_bed_child, extra_bed_shared, food_adult_abf, food_adult_lunch, food_adult_dinner, 
           food_child_abf, food_child_lunch, food_child_dinner) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [hotelId, r.room_type_name, formatDate(r.start_date), formatDate(r.end_date), r.allotment, r.single_price, r.double_price, 
           r.extra_bed_adult, r.extra_bed_child, r.extra_bed_shared, r.food_adult_abf, r.food_adult_lunch, r.food_adult_dinner, 
           r.food_child_abf, r.food_child_lunch, r.food_child_dinner]
        );
      }

      // 5. Promotions
      const hotelPromos = promosSheet.filter(p => p.hotel_name === h.name);
      const seenPromos = new Set();
      for (const p of hotelPromos) {
        const promoKey = `${p.discount_amount}-${p.discount_type}`;
        if (seenPromos.has(promoKey)) continue;
        seenPromos.add(promoKey);

        await client.query(
          `INSERT INTO hotel_promotions (hotel_id, name, promotion_code, booking_date_from, booking_date_to, 
           early_bird_days, description, minimum_nights, enabled, discount_amount, discount_type, 
           valid_for_extra_beds, combinable, free_meals_abf, free_meals_lunch, free_meals_dinner) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [hotelId, p.promotion_name, p.promotion_code, formatDate(p.booking_date_from), formatDate(p.booking_date_to), 
           p.early_bird_days, p.description, p.minimum_nights, p.enabled, p.discount_amount, p.discount_type, 
           p.valid_for_extra_beds, p.combinable, p.free_meals_abf, p.free_meals_lunch, p.free_meals_dinner]
        );
      }

      importedCount++;
      if (importedCount % 50 === 0) console.log(`Processed ${importedCount} hotels...`);
    }

    console.log(`All data imported successfully to LOCALHOST! Total hotels: ${importedCount}`);

  } catch (err) {
    console.error('Error during LOCALHOST import:', err);
  } finally {
    await client.end();
  }
}

importAllData();
