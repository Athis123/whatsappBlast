/* eslint-disable no-unused-vars */
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const db = require("./db");
const cron = require("node-cron");
const authRoutes = require("./auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();


const app = express();
const PORT = process.env.PORT || 5001;
const SECRET = "jwt_secret_key";
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());

// === Ini bagian penting ===
app.use("/api", authRoutes); // Maka endpoint-nya jadi: /api/login
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// Routes
const kontakRoutes = require("./KontakController");
const templateRoutes = require("./TemplateController");
const historyRoutes = require("./HistoryController");
app.use("/api", historyRoutes);
app.use("/api/kontak", kontakRoutes);
app.use("/api/template", templateRoutes);

// Import Kontak
app.post("/kontak", (req, res) => {
  const kontak = req.body;
  console.log("Data diterima dari frontend:", kontak);

  const query =
    "INSERT INTO kontak (kode, nama, telepon, total_tenor, angsuran_ke, sisa) VALUES ?";
  const values = kontak.map((k) => [
    k.kode,
    k.nama,
    k.telepon,
    k.totalTenor,
    k.angsuranKe,
    k.sisa,
  ]);

  db.query(query, [values], (err) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Gagal menyimpan kontak." });
    }
    res.status(201).json({ message: "Kontak berhasil disimpan!" });
  });
});

// Ambil Kontak
app.get("/kontak", (req, res) => {
  db.query("SELECT * FROM kontak", (err, result) => {
    if (err) {
      console.error("Error fetching kontak:", err);
      return res.status(500).json({ message: "Gagal mengambil kontak." });
    }
    res.status(200).json(result);
  });
});

app.get("/api/message-history", (req, res) => {
  const query = `
    SELECT ph.*, k.nama AS kontak_nama, t.nama_template
    FROM pengiriman_history ph
    LEFT JOIN kontak k ON ph.id_kontak = k.id
    LEFT JOIN templates t ON ph.id_template = t.id
    ORDER BY ph.waktu_kirim DESC
    LIMIT 100
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Error mengambil riwayat:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows);
  });
});

// Register endpoint
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  // Cek apakah username sudah ada
  const checkQuery = "SELECT * FROM user WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.status(500).json({ message: "Gagal mengenkripsi password" });
      }

      // Simpan ke database
      const insertQuery = "INSERT INTO user (username, password) VALUES (?, ?)";
      db.query(insertQuery, [username, hashedPassword], (err) => {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ message: "Gagal mendaftarkan pengguna" });
        }

        res.json({ message: "Registrasi berhasil" });
      });
    });
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM user WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(401).json({ message: "Login failed" });

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ username: user.username }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Hapus log file
const logPath = "./.wwebjs_auth/session/Default/chrome_debug.log";
if (fs.existsSync(logPath)) {
  try {
    fs.unlinkSync(logPath);
    console.log("🧹 File chrome_debug.log berhasil dihapus.");
  } catch (e) {
    console.warn("⚠️ Gagal hapus chrome_debug.log:", e.message);
  }
}

// === WhatsApp Client State ===
let client = null;
let lastQrCode = null;
let isClientAuthenticated = false;
let isInitializing = false;

// Buat Client Baru
function createNewClient() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    },
  });

  // 🚫 Hapus baris ini, karena safeInitialize() yang akan manggil .initialize()
  // client.initialize();

  client.on("qr", (qr) => {
    console.log("📸 QR Code diterima!");
    lastQrCode = qr;
    io.emit("qr", qr);
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp siap digunakan!");
    isClientAuthenticated = true;
    io.emit("ready", true);
  });

  client.on("authenticated", () => {
    console.log("🔐 WhatsApp terautentikasi.");
    isClientAuthenticated = true;
  });

  client.on("auth_failure", (msg) => {
    console.error("🚫 Autentikasi gagal!", msg);
    isClientAuthenticated = false;
  });

  client.on("disconnected", async (reason) => {
    console.log("⚠️ WhatsApp terputus:", reason);
    isClientAuthenticated = false;

    try {
      await client.destroy();
      console.log("🧹 Client lama dihancurkan.");
    } catch (err) {
      console.warn("⚠️ Gagal destroy client:", err.message);
    }

    setTimeout(() => {
      console.log("🔁 Re-inisialisasi client...");
      safeInitialize();
    }, 3000);
  });
}


// Inisialisasi Client
async function safeInitialize() {
  if (isInitializing) {
    console.log("⏳ Inisialisasi sedang berjalan, tunggu...");
    return;
  }

  isInitializing = true;
  console.log("🔧 Mulai inisialisasi ulang WhatsApp client...");

  try {
    if (client) {
      try {
        if (client.pupBrowser) {
          await client.pupBrowser.close();
        }
        await client.destroy();
        console.log("🧹 Client lama dihancurkan.");
      } catch (e) {
        console.warn("⚠️ Gagal destroy client:", e.message);
      }
    }

    isClientAuthenticated = false;
    lastQrCode = null;
    createNewClient();

    console.log("⚙️ Memulai client.initialize()...");
    await client.initialize();
    console.log("✅ Selesai client.initialize()");
  } catch (err) {
    console.error("❌ Gagal inisialisasi:", err.message);
  } finally {
    isInitializing = false;
  }
}

function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, ""); // Hapus semua non-digit
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1); // Ganti 0 jadi 62
  }
  return cleaned + "@c.us";
}

app.get("/api/auto-blast-status", (req, res) => {
  db.query(
    `
    SELECT k.*, t.nama_template
    FROM kontak k
    LEFT JOIN templates t ON k.auto_blast_template_id = t.id
    WHERE k.auto_blast = true
  `,
    (err, rows) => {
      if (err) {
        console.error("❌ Gagal ambil status auto-blast:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows);
    }
  );
});

app.post("/api/send-message", async (req, res) => {
  const { kontak, pesan, templateId } = req.body;

  if (!client || !isClientAuthenticated) {
    return res.status(503).json({ error: "WhatsApp belum siap." });
  }

  let results = [];

  for (const k of kontak) {
    const nomorTujuan = formatPhoneNumber(k.telepon);

    const isiPesan = pesan
      .replace(/{{\s*nama\s*}}/gi, k.nama)
      .replace(/{{\s*telepon\s*}}/gi, k.telepon)
      .replace(/{{\s*sisa\s*}}/gi, k.sisa)
      .replace(/{{\s*angsuran_ke\s*}}/gi, k.angsuran_ke)
      .replace(/{{\s*total_tenor\s*}}/gi, k.total_tenor)
      .replace(/{{\s*kode\s*}}/gi, k.kode);

    try {
      // kirim pesan
      const response = await client.sendMessage(nomorTujuan, isiPesan);

      // log sukses
      db.query(
        `INSERT INTO pengiriman_history 
        (id_user, id_kontak, id_template, nomor_tujuan, isi_pesan, status_kirim) 
        VALUES (?, ?, ?, ?, ?, 'sukses')`,
        [1, k.id, templateId || null, nomorTujuan, isiPesan]
      );

      console.log(`✅ Pesan terkirim ke ${nomorTujuan}`);
      results.push({ nomor: nomorTujuan, status: "sukses", id: response.id.id });
    } catch (err) {
      // log gagal
      db.query(
        `INSERT INTO pengiriman_history 
        (id_user, id_kontak, id_template, nomor_tujuan, isi_pesan, status_kirim) 
        VALUES (?, ?, ?, ?, ?, 'gagal')`,
        [1, k.id, templateId || null, nomorTujuan, isiPesan]
      );

      console.error(`❌ Gagal kirim ke ${nomorTujuan}:`, err.message);
      results.push({ nomor: nomorTujuan, status: "gagal", error: err.message });
    }
  }

  res.json({
    message: "Pengiriman selesai diproses.",
    results,
  });
});




app.post("/api/set-auto-blast", (req, res) => {
  const { kontak, templateId } = req.body;

  if (!Array.isArray(kontak) || !templateId) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  db.query(
    "SELECT isi FROM templates WHERE id = ?",
    [templateId],
    (err, templateRows) => {
      if (err) {
        console.error("❌ Gagal ambil template:", err);
        return res.status(500).json({ message: "Gagal ambil template" });
      }

      if (templateRows.length === 0) {
        return res.status(404).json({ message: "Template tidak ditemukan" });
      }

      const templateIsi = templateRows[0].isi;

      db.query(
        "SELECT * FROM kontak WHERE id IN (?)",
        [kontak],
        (err, kontakRows) => {
          if (err) {
            console.error("❌ Gagal ambil kontak:", err);
            return res.status(500).json({ message: "Gagal ambil kontak" });
          }

          let done = 0;

          kontakRows.forEach((item) => {
            const nomor = formatPhoneNumber(item.telepon);
            const pesan = templateIsi
              .replace("{nama}", item.nama)
              .replace("{sisa}", item.sisa);

            db.query(
              `UPDATE kontak SET auto_blast = true, auto_blast_template_id = ? WHERE id = ?`,
              [templateId, item.id],
              (err) => {
                if (err) console.error("❌ Gagal update kontak:", err);
              }
            );

            db.query(
              `INSERT INTO pengiriman_history 
           (id_user, id_kontak, id_template, nomor_tujuan, isi_pesan, status_kirim)
           VALUES (?, ?, ?, ?, ?, ?)`,
              [1, item.id, templateId, nomor, pesan, "auto_blast_set"],
              (err) => {
                if (err) console.error("❌ Gagal simpan log auto blast:", err);

                done++;
                if (done === kontakRows.length) {
                  res.json({
                    message: "Auto-blast berhasil diatur dan disimpan.",
                  });
                }
              }
            );
          });
        }
      );
    }
  );
});

// Auto Blast: Setiap Senin, Rabu, Jumat pukul 08:00 dan 15:00 cek kontak yang memenuhi syarat
cron.schedule("0 8,15 * * 1,3,5", () => {
  console.log(
    "⏰ [AUTO BLAST] Cek kontak setiap Senin, Rabu, Jumat pada jam 08:00 dan 15:00..."
  );

  db.query(
    `SELECT k.*, t.isi as template_isi FROM kontak k 
    JOIN templates t ON k.auto_blast_template_id = t.id
    WHERE k.auto_blast = true AND k.sisa <= 3 AND k.sisa > 0
    AND (k.last_blasted IS NULL OR DATE(k.last_blasted) < CURDATE())`,
    (err, results) => {
      if (err) return console.error("❌ Gagal ambil kontak auto-blast:", err);

      results.forEach((contact) => {
        const nomor = formatPhoneNumber(contact.telepon);
        const pesan = contact.template_isi
          .replace("{nama}", contact.nama)
          .replace("{sisa}", contact.sisa);

        client
          .sendMessage(nomor, pesan)
          .then(() => {
            console.log(
              `✅ [AUTO BLAST] Pesan terkirim ke ${contact.nama} (${contact.telepon})`
            );

            // 🟢 Tambahkan log pengiriman di sini
            db.query(
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
                if (err) console.error("❌ Gagal log blast otomatis:", err);
              }
            );

            // Update last_blasted setelah pesan terkirim
            db.query(
              "UPDATE kontak SET last_blasted = NOW() WHERE id = ?",
              [contact.id],
              (err) => {
                if (err) {
                  console.error(
                    `❌ Gagal update last_blasted untuk ID ${contact.id}:`,
                    err.message
                  );
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
});

// Socket Handler
io.on("connection", (socket) => {
  console.log("📲 Client connected:", socket.id);

  // ✅ Kirim status saat ini ke client yang baru connect
  if (isClientAuthenticated) {
    socket.emit("ready", true); // langsung kasih tahu kalau sudah ready
  } else if (lastQrCode) {
    socket.emit("qr", lastQrCode); // kalau belum ready tapi QR masih ada
  }

  socket.on("request-new-qr", async () => {
    console.log("🔁 Client minta QR baru");

    try {
      if (client && isClientAuthenticated) {
        await client.logout();
        console.log("✅ Logout sukses");
      }
    } catch (err) {
      console.warn("⚠️ Gagal logout:", err.message);
    }

    setTimeout(() => {
      lastQrCode = null;
      safeInitialize();
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Logout Endpoint
app.get("/logout", async (req, res) => {
  console.log("🧾 Endpoint logout diakses");
  safeInitialize();
  res.send("Logout diproses, QR akan dihasilkan ulang.");
});

// Error Handler Global
process.on("uncaughtException", (err) => {
  console.error("🛑 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🛑 Unhandled Rejection:", reason);
});

// Start Server
server.listen(5000, () => {
  console.log("🚀 Server berjalan di http://localhost:5000");

  // Delay 1.5 detik sebelum init, jika memang perlu
  setTimeout(() => {
    safeInitialize();
  }, 1500);
});
