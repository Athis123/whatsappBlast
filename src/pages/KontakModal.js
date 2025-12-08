import React, { useState, useEffect } from "react";

const KontakModal = ({ onClose, onSave, defaultValue }) => {
  const [form, setForm] = useState({
    id: null,
    kode: "",
    nama: "",
    telepon: "",
    totalTenor: "",
    angsuranKe: "",
    sisa: "",
  });

  useEffect(() => {
    if (defaultValue) {
      setForm({
        id: defaultValue.id || null,
        kode: defaultValue.kode || "",
        nama: defaultValue.nama || "",
        telepon: defaultValue.telepon || "",
        totalTenor: defaultValue.total_tenor || "",
        angsuranKe: defaultValue.angsuran_ke || "",
        sisa: defaultValue.sisa || "",
      });
    }
  }, [defaultValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (
      form.nama &&
      form.telepon &&
      form.totalTenor &&
      form.angsuranKe &&
      !isNaN(form.totalTenor) &&
      !isNaN(form.angsuranKe)
    ) {
      onSave(form);
    } else {
      alert("Semua field wajib diisi dengan benar!");
    }
  };

  const handleClose = () => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin membatalkan tanpa menyimpan?"
    );
    if (confirm) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{form.id ? "Edit Kontak" : "Tambah Kontak"}</h3>
        <input
          type="text"
          name="kode"
          placeholder="Kode"
          value={form.kode}
          onChange={handleChange}
        />
        <input
          type="text"
          name="nama"
          placeholder="Nama"
          value={form.nama}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telepon"
          placeholder="Telepon"
          value={form.telepon}
          onChange={handleChange}
        />
        <input
          type="number"
          name="totalTenor"
          placeholder="Total Tenor"
          value={form.totalTenor}
          onChange={handleChange}
        />
        <input
          type="number"
          name="angsuranKe"
          placeholder="Angsuran Ke"
          value={form.angsuranKe}
          onChange={handleChange}
        />
        <input
          type="text"
          name="sisa"
          placeholder="Sisa"
          value={form.sisa}
          onChange={handleChange}
        />
        <div className="modal-actions">
          <button
            onClick={handleSubmit}
            disabled={
              !form.nama ||
              !form.telepon ||
              !form.totalTenor ||
              !form.angsuranKe
            }
          >
            Simpan
          </button>
          <button className="danger" onClick={handleClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default KontakModal;
