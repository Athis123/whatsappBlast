// MessagePage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import ContactSelectModal from "../components/ContactSelectModal";
import MessageHistoryList from "../components/MessageHistoryList";
import { FaHistory } from "react-icons/fa";

const MessagePage = () => {
  const [allContacts, setAllContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [autoBlastStatus, setAutoBlastStatus] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("status");

  useEffect(() => {
    axios.get("http://localhost:5000/kontak")
      .then((res) => setAllContacts(res.data))
      .catch((err) => console.error("Gagal mengambil kontak:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/template")
      .then((res) => setTemplates(res.data))
      .catch((err) => console.error("Gagal mengambil template:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auto-blast-status")
      .then((res) => setAutoBlastStatus(res.data))
      .catch((err) => console.error("Gagal ambil status auto-blast:", err));
  }, []);

  const handleTemplateSelect = (e) => {
    const template = templates.find((t) => t.id === parseInt(e.target.value));
    setSelectedTemplate(template);
    setCustomContent(template?.isi || "");
    setIsEditing(true);
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !customContent.trim()) {
      alert("Pilih template dan isi pesan terlebih dahulu!");
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/template/${selectedTemplate.id}`, {
        nama_template: selectedTemplate.nama_template, // ✅ sesuaikan dengan nama kolom di DB
        isi: customContent,
      });      
  
      alert("✅ Template berhasil diperbarui.");
  
      // Refresh daftar template
      const res = await axios.get("http://localhost:5000/api/template");
      setTemplates(res.data);
    } catch (error) {
      console.error("Gagal update template:", error.response?.data || error.message);
      alert("❌ Gagal menyimpan perubahan template.");
    }
  };
  
  

  const handleSelectContacts = (contacts) => {
    const unique = Array.from(
      new Map(contacts.map((item) => [item.telepon, item])).values()
    );
    setSelectedContacts(unique);
  };

  const handleSendMessage = async () => {
    if (!selectedContacts.length || !customContent.trim()) {
      alert("Pilih kontak dan isi pesan terlebih dahulu!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/send-message", {
        kontak: selectedContacts,
        pesan: customContent,
        autoBlast: true,
        templateId: selectedTemplate?.id,
      });

      await axios.post("http://localhost:5000/api/set-auto-blast", {
        kontak: selectedContacts.map((c) => c.id),
        templateId: selectedTemplate?.id,
      });

      alert("✅ " + res.data.message);
      setSelectedContacts([]);
      setSelectedTemplate(null);
      setCustomContent("");
      setIsEditing(false);
      setIsModalOpen(false);

      const updated = await axios.get("http://localhost:5000/kontak");
      setAllContacts(updated.data);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      alert("❌ Gagal mengirim pesan");
    }
  };

  return (
    <div className="message-container">
      <div className="message-header" style={{ position: "relative" }}>
        <h1>📩 Kirim Pesan Broadcast</h1>
        <button
          onClick={() => setIsLogModalOpen(true)}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#333",
          }}
          title="Lihat Status & Riwayat"
        >
          <FaHistory />
        </button>
        <p>Pilih kontak terlebih dahulu, lalu pilih template untuk isi pesan.</p>
      </div>

      <div className="message-grid">
        <div className="message-column">
          <div className="message-card">
            <h2>Kontak</h2>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Pilih Kontak</button>
            {selectedContacts.length > 0 ? (
              <ul>{selectedContacts.map((c) => <li key={c.telepon}>{c.nama} ({c.telepon})</li>)}</ul>
            ) : <p>Belum ada kontak yang dipilih.</p>}
          </div>
          <div className="message-card">
            <h2>Template</h2>
            <select onChange={handleTemplateSelect} value={selectedTemplate ? selectedTemplate.id : ""}>
              <option value="">-- Pilih Template --</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.nama_template}</option>)}
            </select>
          </div>
        </div>

        <div className="message-column">
          <div className="message-card">
            <h2>Pesan</h2>
            {isEditing ? (
              <>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={6}
                />
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button className="btn-primary" onClick={handleUpdateTemplate}>💾 Simpan ke Template</button>
  <button className="btn-secondary" onClick={() => setIsEditing(false)}>Selesai Edit</button>
</div>

              </>
            ) : (
              <div>{customContent || "Pilih template terlebih dahulu."}</div>
            )}
            <button className="btn-success" onClick={handleSendMessage}>Kirim Pesan</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ContactSelectModal
          contacts={allContacts}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSelectContacts}
        />
      )}

{isLogModalOpen && (
  <div className="modal-history-overlay" onClick={() => setIsLogModalOpen(false)}>
    <div className="modal-history-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-history-close-button" onClick={() => setIsLogModalOpen(false)}>❌</button>

      <div style={{ marginBottom: "15px" }}>
        <button
          className={`tab-button ${modalTab === "status" ? "active" : ""}`}
          onClick={() => setModalTab("status")}
        >
          Status
        </button>
        <button
          className={`tab-button ${modalTab === "history" ? "active" : ""}`}
          onClick={() => setModalTab("history")}
        >
          Riwayat
        </button>
      </div>

      <div>
        {modalTab === "status" ? (
          <ul>
            {autoBlastStatus.map((item) => (
              <li key={item.id}>{item.nama} ({item.telepon}) - Sisa: {item.sisa}</li>
            ))}
          </ul>
        ) : (
          <MessageHistoryList />
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MessagePage;
