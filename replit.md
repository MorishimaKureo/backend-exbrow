# backend-exbrow

A Node.js/Express license management backend with an admin dashboard.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express 5
- **Database**: SQLite3 (local `database.db` file)
- **Views**: EJS templates
- **Auth**: bcrypt + express-session

## Project Structure

```
server.js        - Main Express application
db.js            - SQLite database setup and schema
seed_admin.js    - Script to seed default admin user
public/          - Static assets (CSS)
views/           - EJS templates (login, dashboard)
database.db      - SQLite database file
```

## Features

- Admin login/logout with session management
- License key generation, deactivation, and deletion
- Device binding for license keys
- `/activate` API endpoint for APK clients to validate/activate licenses

## Running Locally

```bash
npm start        # Starts server on port 5000
node seed_admin.js  # Seeds default admin (username: admin, password: admin123)
```

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

## Routes

- `GET /login` - Login page
- `POST /login` - Authenticate
- `GET /logout` - Logout
- `GET /dashboard` - Admin dashboard (auth required)
- `POST /admin/generate` - Generate new license key
- `POST /admin/disable/:key` - Disable a license key
- `POST /admin/delete/:key` - Delete a license key
- `POST /activate` - License activation endpoint (for APK clients)
