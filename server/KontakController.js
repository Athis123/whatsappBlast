const express = require("express");
const router = express.Router();
const db = require("./db");

// GET semua kontak
router.get("/", (req, res) => {
  db.query("SELECT * FROM kontak", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// POST tambah satu kontak
router.post("/", (req, res) => {
  const { kode, nama, telepon, totalTenor, angsuranKe, sisa } = req.body;

  // Jika menerima array, arahkan ke endpoint /bulk
  if (Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Gunakan endpoint POST /kontak/bulk untuk import banyak data",
    });
  }

  db.query(
    "INSERT INTO kontak (kode, nama, telepon, total_tenor, angsuran_ke, sisa) VALUES (?, ?, ?, ?, ?, ?)",
    [kode, nama, telepon, totalTenor, angsuranKe, sisa],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Kontak ditambahkan", id: result.insertId });
    }
  );
});

// POST bulk kontak (import excel)
router.post("/bulk", (req, res) => {
  const kontakArray = req.body;

  if (!Array.isArray(kontakArray)) {
    return res.status(400).json({ error: "Data harus berupa array" });
  }

  const values = kontakArray.map((item) => [
    item.kode,
    item.nama,
    item.telepon,
    item.totalTenor,
    item.angsuranKe,
    item.sisa,
  ]);

  db.query(
    "INSERT INTO kontak (kode, nama, telepon, total_tenor, angsuran_ke, sisa) VALUES ?",
    [values],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Kontak berhasil diimport", affectedRows: result.affectedRows });
    }
  );
});

// PUT update kontak
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { kode, nama, telepon, totalTenor, angsuranKe, sisa } = req.body;
  db.query(
    "UPDATE kontak SET kode=?, nama=?, telepon=?, total_tenor=?, angsuran_ke=?, sisa=? WHERE id=?",
    [kode, nama, telepon, totalTenor, angsuranKe, sisa, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Kontak diupdate" });
    }
  );
});

// DELETE satu kontak
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM kontak WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Kontak dihapus" });
  });
});

// ✅ DELETE semua kontak
router.delete("/", (req, res) => {
  db.query("DELETE FROM kontak", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Semua kontak berhasil dihapus", affectedRows: result.affectedRows });
  });
});

module.exports = router;
