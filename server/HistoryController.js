const express = require("express");
const router = express.Router();
const db = require("./db");

// GET /api/message-history => dengan optional ?date=YYYY-MM-DD
router.get("/message-history", (req, res) => {
  const { date } = req.query;

  let whereClause = "";
  const params = [];

  if (date) {
    whereClause = "WHERE DATE(ph.waktu_kirim) = ?";
    params.push(date);
  }

  const query = `
    SELECT ph.id_history, ph.id_kontak, ph.id_template, ph.nomor_tujuan, ph.isi_pesan, ph.status_kirim, ph.waktu_kirim,
           k.nama AS kontak_nama,
           t.nama_template
    FROM pengiriman_history ph
    LEFT JOIN kontak k ON ph.id_kontak = k.id
    LEFT JOIN templates t ON ph.id_template = t.id
    ${whereClause}
    ORDER BY ph.waktu_kirim DESC
    LIMIT 100
  `;

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("❌ Error ambil riwayat:", err);
      return res.status(500).json({ error: "Gagal mengambil riwayat." });
    }
    res.json(rows);
  });
});

// DELETE satu riwayat berdasarkan ID (gunakan id_history)
router.delete("/message-history/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "ID tidak valid." });
  }

  db.query("DELETE FROM pengiriman_history WHERE id_history = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Gagal hapus riwayat:", err);
      return res.status(500).json({ message: "Gagal hapus riwayat." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Riwayat tidak ditemukan." });
    }

    res.json({ message: "Riwayat berhasil dihapus." });
  });
});

// DELETE semua riwayat
router.delete("/message-history", (req, res) => {
  db.query("DELETE FROM pengiriman_history", (err) => {
    if (err) {
      console.error("❌ Gagal hapus semua riwayat:", err);
      return res.status(500).json({ message: "Gagal hapus semua riwayat." });
    }

    res.json({ message: "Semua riwayat berhasil dihapus." });
  });
});

module.exports = router;
