const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\nUsers table columns:');
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
