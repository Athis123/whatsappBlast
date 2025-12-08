import React, { useState, useMemo } from "react";

const ContactSelectModal = ({ contacts, onClose, onSave }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter berdasarkan nama / nomor
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) =>
      `${c.nama} ${c.telepon}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  // Cek apakah semua yang ditampilkan terpilih
  const isAllSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) =>
      selectedContacts.some((sel) => sel.telepon === c.telepon)
    );

  // Toggle centang individual
  const handleCheckboxChange = (contact) => {
    const isSelected = selectedContacts.some(
      (c) => c.telepon === contact.telepon
    );
    setSelectedContacts((prev) =>
      isSelected
        ? prev.filter((item) => item.telepon !== contact.telepon)
        : [...prev, contact]
    );
  };

  // Tombol "Select All"
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Unselect yang terlihat
      setSelectedContacts((prev) =>
        prev.filter(
          (c) => !filteredContacts.some((fc) => fc.telepon === c.telepon)
        )
      );
    } else {
      // Merge semua yang terlihat (hindari duplikat)
      const merged = [...selectedContacts];
      filteredContacts.forEach((contact) => {
        if (!merged.some((c) => c.telepon === contact.telepon)) {
          merged.push(contact);
        }
      });
      setSelectedContacts(merged);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Pilih Kontak</h3>

        <input
          type="text"
          placeholder="Cari nama atau nomor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="select-all-container">
          <button className="btn-small" onClick={handleSelectAll}>
            {isAllSelected ? "Unselect Semua" : "Pilih Semua yang Ditampilkan"}
          </button>
        </div>

        <div className="contact-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <label key={contact.telepon} className="contact-item">
                <span className="contact-name">
                  {contact.nama}{" "}
                  <small style={{ color: "#888" }}>({contact.telepon})</small>
                </span>
                <input
                  type="checkbox"
                  checked={selectedContacts.some(
                    (c) => c.telepon === contact.telepon
                  )}
                  onChange={() => handleCheckboxChange(contact)}
                  className="contact-checkbox"
                />
              </label>
            ))
          ) : (
            <p style={{ color: "#888", fontStyle: "italic", marginTop: "8px" }}>
              Tidak ada kontak ditemukan.
            </p>
          )}
        </div>

        <div style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
          {selectedContacts.length} kontak dipilih.
        </div>

        <div className="modal-actions">
          <button className="danger" onClick={onClose}>
            Tutup
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSave(selectedContacts);
              onClose();
            }}
            disabled={selectedContacts.length === 0}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSelectModal;
