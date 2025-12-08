jest.mock("../whatsapp-client", () => {
  return jest.fn(() => ({
    sendMessage: jest.fn().mockResolvedValue(true),
  }));
});

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const createClient = require("../whatsapp-client");
const mockClient = createClient(); // ini akan memanggil versi mock

const app = express();
app.use(bodyParser.json());

app.post("/api/send-message", async (req, res) => {
  const { kontak, pesan } = req.body;

  if (!kontak || !pesan) {
    return res.status(400).json({ error: "Kontak dan pesan wajib diisi" });
  }

  try {
    for (const item of kontak) {
      await mockClient.sendMessage(item.telepon + "@c.us", pesan);
    }
    return res.status(200).json({
      status: "success",
      message: "Pesan berhasil dikirim",
    });
  } catch (error) {
    return res.status(500).json({ error: "Gagal kirim pesan" });
  }
});

describe("POST /api/send-message", () => {
  it("should send message to all contacts", async () => {
    const response = await request(app)
      .post("/api/send-message")
      .send({
        kontak: [{ telepon: "08123456789" }],
        pesan: "Halo!",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Pesan berhasil dikirim");
    expect(mockClient.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("should return 400 if kontak or pesan is missing", async () => {
    const response = await request(app)
      .post("/api/send-message")
      .send({ kontak: [] });

    expect(response.statusCode).toBe(400);
  });
});
