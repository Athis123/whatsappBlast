const express = require("express");
const router = express.Router();
const db = require("./db");

// GET semua template
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM templates ORDER BY created_at DESC",
    (err, result) => {
      if (err) {
        console.error("Error getting templates:", err);
        return res.status(500).json({ message: "Gagal mengambil templates." });
      }
      res.status(200).json(result);
    }
  );
});

// POST template baru
router.post("/", (req, res) => {
  const { nama_template, isi } = req.body;

  // Cek jumlah template yang sudah ada
  db.query("SELECT COUNT(*) AS count FROM templates", (err, result) => {
    if (err) {
      console.error("Error checking template count:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengecek jumlah template." });
    }

    const templateCount = result[0].count;

    if (templateCount >= 3) {
      return res
        .status(400)
        .json({ message: "Jumlah template sudah mencapai batas maksimal 3." });
    }

    // Lanjutkan untuk menambah template jika jumlah belum mencapai 3
    const query = "INSERT INTO templates (nama_template, isi) VALUES (?, ?)";
    db.query(query, [nama_template, isi], (err, result) => {
      if (err) {
        console.error("Error saving template:", err);
        return res.status(500).json({ message: "Gagal menyimpan template." });
      }

      res.status(201).json({ message: "Template berhasil disimpan." });
    });
  });
});

// POST template baru
router.post("/", (req, res) => {
  const { nama_template, isi } = req.body;

  // ✅ Cek jumlah template yang sudah ada
  db.query("SELECT COUNT(*) AS count FROM templates", (err, result) => {
    if (err) {
      console.error("Error checking template count:", err);
      return res
        .status(500)
        .json({ message: "Gagal mengecek jumlah template." });
    }

    const templateCount = result[0].count;

    if (templateCount >= 3) {
      return res.status(400).json({
        message: "Jumlah template sudah mencapai batas maksimal 3.",
      });
    }

    // Simpan template kalau masih < 3
    const query = "INSERT INTO templates (nama_template, isi) VALUES (?, ?)";
    db.query(query, [nama_template, isi], (err, result) => {
      if (err) {
        console.error("Error saving template:", err);
        return res.status(500).json({ message: "Gagal menyimpan template." });
      }

      res.status(201).json({ message: "Template berhasil disimpan." });
    });
  });
});

// DELETE template
// DELETE template + riwayat pengiriman yang terkait
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  console.log("➡️ DELETE /api/template dengan ID:", id);

  // 1. Hapus riwayat pengiriman yang terkait
  const deleteHistoryQuery =
    "DELETE FROM pengiriman_history WHERE id_template = ?";
  db.query(deleteHistoryQuery, [id], (err) => {
    if (err) {
      console.error("❌ Gagal hapus history:", err);
      return res
        .status(500)
        .json({ message: "Gagal hapus riwayat pengiriman." });
    }

    // 2. Setelah riwayat dihapus, hapus template-nya
    const deleteTemplateQuery = "DELETE FROM templates WHERE id = ?";
    db.query(deleteTemplateQuery, [id], (err, result) => {
      if (err) {
        console.error("❌ Gagal hapus template:", err);
        return res.status(500).json({ message: "Gagal menghapus template." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Template tidak ditemukan." });
      }

      res
        .status(200)
        .json({ message: "Template dan riwayat berhasil dihapus." });
    });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nama_template, isi } = req.body;

  if (!nama_template || !isi) {
    return res
      .status(400)
      .json({ message: "Nama dan isi template wajib diisi." });
  }

  db.query(
    "UPDATE templates SET nama_template = ?, isi = ? WHERE id = ?",
    [nama_template, isi, id],

    (err, result) => {
      if (err) {
        console.error("❌ Gagal mengupdate template:", err);
        return res.status(500).json({ message: "Gagal update template." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Template tidak ditemukan." });
      }

      res.json({ message: "Template berhasil diperbarui." });
    }
  );
});

module.exports = router;
