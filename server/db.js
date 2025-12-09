// File: /api/koneksi-db.js atau file Serverless Function lainnya

const mysql = require("mysql2");

// Hapus semua nilai hardcode! 
// Ganti dengan mengambil dari Environment Variables Vercel (process.env)
const db = mysql.createConnection({
  host: process.env.DB_HOST,         // Mengambil nilai dari Vercel
  user: process.env.DB_USER,         // Mengambil nilai dari Vercel
  password: process.env.DB_PASSWORD, // Mengambil nilai dari Vercel
  database: process.env.DB_DATABASE, // Mengambil nilai dari Vercel
});

// Cek koneksi (hanya akan dijalankan di Server Vercel)
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    // Tambahkan log detail host jika perlu untuk debugging
    console.error("Attempted connection using host:", process.env.DB_HOST);
  } else {
    console.log("Connected to the database");
  }
});

module.exports = db;
