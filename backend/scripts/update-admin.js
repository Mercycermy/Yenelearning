const path = require('path');
const { Client } = require(path.join(__dirname, '..', 'node_modules', 'pg'));
const bcrypt = require(path.join(__dirname, '..', 'node_modules', 'bcrypt'));

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '045422',
  database: 'yene_teacher'
});

async function main() {
  await client.connect();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin12345678!', salt);
  const res = await client.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'admin@example.com']);
  console.log('Update result row count:', res.rowCount);
  await client.end();
}
main().catch(console.error);
