// seed_admin.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.db');

const username = 'admin';
const password = 'admin123'; // ganti kalau mau password lain

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;

  db.run(
    `INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`,
    [username, hash],
    function(err) {
      if (err) throw err;
      console.log(`Admin user created: ${username}`);
      db.close();
    }
  );
});