const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const crypto = require('crypto');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

function generateLicense() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function isAuth(req, res, next) {
  if (!req.session.admin) return res.redirect('/login');
  next();
}

/* ---------- AUTH ---------- */

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM admins WHERE username = ?`, [username], async (err, user) => {
    if (!user) return res.redirect('/login');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/login');

    req.session.admin = user.id;
    res.redirect('/dashboard');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

/* ---------- DASHBOARD ---------- */

app.get('/dashboard', isAuth, (req, res) => {
  db.all(`SELECT * FROM licenses ORDER BY id DESC`, [], (err, rows) => {
    res.render('dashboard', { licenses: rows });
  });
});

/* ---------- LICENSE CONTROL ---------- */

app.post('/admin/generate', isAuth, (req, res) => {
  const key = generateLicense();
  db.run(`INSERT INTO licenses (license_key) VALUES (?)`, [key]);
  res.redirect('/dashboard');
});

app.post('/admin/disable/:key', isAuth, (req, res) => {
  db.run(`UPDATE licenses SET status = 'inactive' WHERE license_key = ?`,
    [req.params.key]);
  res.redirect('/dashboard');
});

app.post('/admin/delete/:key', isAuth, (req, res) => {
  db.run(`DELETE FROM licenses WHERE license_key = ?`,
    [req.params.key]);
  res.redirect('/dashboard');
});

/* ---------- ACTIVATE ENDPOINT (APK) ---------- */

app.post('/activate', (req, res) => {
  const { license_key, device_id } = req.body;

  db.get(`SELECT * FROM licenses WHERE license_key = ?`,
    [license_key],
    (err, row) => {

      if (!row) return res.json({ status: 'invalid' });
      if (row.status !== 'active') return res.json({ status: 'inactive' });

      if (!row.device_id) {
        db.run(`UPDATE licenses SET device_id = ? WHERE license_key = ?`,
          [device_id, license_key]);
        return res.json({ status: 'activated' });
      }

      if (row.device_id !== device_id)
        return res.json({ status: 'device_mismatch' });

      return res.json({ status: 'valid' });
    });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});