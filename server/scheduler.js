// scheduler.js
const cron = require("node-cron");
const db = require("./db");

// Fungsi kirim pesan (mock)
const kirimPesan = async (nomor, pesan) => {
  console.log(`Mengirim ke ${nomor}: ${pesan}`);
  return true; // Misal sukses
};

cron.schedule("* * * * *", async () => {
  console.log("Cek jadwal pengiriman...");

  const [rows] = await db.query(`
    SELECT jp.*, k.telepon 
    FROM jadwal_pengiriman jp
    JOIN kontak k ON jp.id_kontak = k.id
    WHERE jp.status = 'menunggu' AND jp.jadwal_kirim <= NOW()
  `);

  for (const row of rows) {
    const sukses = await kirimPesan(row.telepon, row.isi_pesan);
    const status = sukses ? "sukses" : "gagal";

    await db.query(
      `
      INSERT INTO pengiriman_history 
      (id_user, id_kontak, id_template, nomor_tujuan, isi_pesan, status_kirim) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        row.id_user,
        row.id_kontak,
        row.id_template,
        row.telepon,
        row.isi_pesan,
        status,
      ]
    );

    await db.query(`UPDATE jadwal_pengiriman SET status = ? WHERE id = ?`, [
      status,
      row.id,
    ]);
  }
});
