const express = require("express");
const router = express.Router();
const db = require("./db"); // pastikan path ini sesuai
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "your-secret-key"; // ganti sesuai kebutuhan

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM user WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });

    const user = results[0];

    // Bandingkan password yang diinput dengan hashed password dari database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Gagal memverifikasi password" });
      if (!isMatch) return res.status(401).json({ message: "Password salah" });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token, username: user.username });
    });
  });
});

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM user WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error saat cek username" });

    if (results.length > 0) {
      return res.status(400).json({ error: "Username sudah digunakan" });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: "Gagal mengenkripsi password" });

      db.query("INSERT INTO user (username, password) VALUES (?, ?)", [username, hashedPassword], (err2, result) => {
        if (err2) return res.status(500).json({ error: "Gagal menyimpan user" });

        res.json({ message: "Registrasi berhasil" });
      });
    });
  });
});


module.exports = router;

module.exports = router;
