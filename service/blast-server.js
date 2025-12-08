// service/blast-server.js
import { query } from "../server/db";
import { formatPhoneNumber } from "../utils/utils";

let client = null;

function setClient(c) {
  client = c;
}

function autoBlast() {
  console.log("🚀 [AUTO BLAST] Mulai pengecekan...");

  if (!client) {
    console.warn("⚠️ WhatsApp client belum siap.");
    return;
  }

  query(
    `SELECT k.*, t.isi as template_isi 
     FROM kontak k 
     JOIN templates t ON k.auto_blast_template_id = t.id
     WHERE k.auto_blast = true 
       AND k.sisa <= 3 
       AND k.sisa > 0
       AND (k.last_blasted IS NULL OR DATE(k.last_blasted) < CURDATE())`,
    (err, results) => {
      if (err) {
        console.error("❌ Gagal ambil kontak:", err);
        return;
      }

      if (results.length === 0) {
        console.log("ℹ️ Tidak ada kontak yang perlu di-blast.");
        return;
      }

      results.forEach((contact) => {
        const nomor = formatPhoneNumber(contact.telepon);
        const pesan = contact.template_isi
          .replace("{nama}", contact.nama)
          .replace("{sisa}", contact.sisa);

        client
          .sendMessage(nomor, pesan)
          .then(() => {
            console.log(
              `✅ [AUTO BLAST] Terkirim ke ${contact.nama} (${contact.telepon})`
            );

            // Simpan ke history
            query(
              `INSERT INTO pengiriman_history 
               (id_user, id_kontak, id_template, nomor_tujuan, isi_pesan, status_kirim)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                1,
                contact.id,
                contact.auto_blast_template_id,
                nomor,
                pesan,
                "auto_blast",
              ],
              (err) => {
                if (err) {
                  console.error("❌ Gagal log pengiriman:", err);
                }
              }
            );

            // Update last_blasted
            query(
              "UPDATE kontak SET last_blasted = NOW() WHERE id = ?",
              [contact.id],
              (err) => {
                if (err) {
                  console.error("❌ Gagal update last_blasted:", err);
                }
              }
            );
          })
          .catch((error) => {
            console.error(
              `❌ Gagal kirim ke ${contact.telepon}:`,
              error.message
            );
          });
      });
    }
  );
}

module.exports = { autoBlast, setClient };
