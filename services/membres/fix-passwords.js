const pool = require('./src/database/db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const membreHash = await bcrypt.hash('membre123', 10);
    
    await pool.query('UPDATE members SET password_hash = $1 WHERE email = $2', [adminHash, 'admin@cogarden.com']);
    await pool.query('UPDATE members SET password_hash = $1 WHERE email = $2', [membreHash, 'membre@cogarden.com']);
    
    console.log('✅ Passwords updated!');
    console.log('Admin: admin@cogarden.com / admin123');
    console.log('Membre: membre@cogarden.com / membre123');
    
    // Verify
    const result = await pool.query('SELECT email, password_hash FROM members');
    for (const row of result.rows) {
      console.log(`${row.email}: ${row.password_hash.substring(0, 30)}...`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixPasswords();
