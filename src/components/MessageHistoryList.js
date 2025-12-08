import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../dist/MessageHistorylist.css"; // Pastikan CSS modal sudah sesuai

const MessageHistoryList = () => {
  const [history, setHistory] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // { type: 'one' | 'all', id: optional }

  // ✅ Gunakan useCallback agar tidak kena warning ESLint
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/message-history", {
        params: filterDate ? { date: filterDate } : {},
      });
      setHistory(res.data);
    } catch (err) {
      toast.error("Gagal mengambil data riwayat.");
    }
  }, [filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteOne = (id) => {
    setModalAction({ type: "one", id });
    setShowModal(true);
  };

  const handleDeleteAll = () => {
    setModalAction({ type: "all" });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (modalAction?.type === "one" && modalAction?.id) {
        await axios.delete(`http://localhost:5000/api/message-history/${modalAction.id}`);
        toast.success("Riwayat berhasil dihapus!");
      } else if (modalAction?.type === "all") {
        await axios.delete("http://localhost:5000/api/message-history");
        toast.success("Semua riwayat berhasil dihapus!");
      }
      fetchData(); // refresh data langsung
    } catch {
      toast.error("Terjadi kesalahan saat menghapus.");
    } finally {
      setShowModal(false);
    }
  };

  const getToday = () => new Date().toISOString().split("T")[0];

  return (
    <div className="history-card">
      <h2>📜 Riwayat Pengiriman Pesan</h2>

      {/* Filter dan Aksi */}
      <div className="history-filter-bar">
        <label>Filter Tanggal: </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="history-date-input"
        />
        <button className="history-btn-today" onClick={() => setFilterDate(getToday())}>
          Hari Ini
        </button>
        <button className="history-btn-reset" onClick={() => setFilterDate("")}>
          Reset
        </button>
        <button className="history-btn-delete-all" onClick={handleDeleteAll}>
          🗑️ Hapus Semua
        </button>
      </div>

      {/* Tabel Riwayat */}
      {history.length === 0 ? (
        <p className="history-empty">Belum ada riwayat pengiriman.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Kontak</th>
              <th>Nomor</th>
              <th>Template</th>
              <th>Status</th>
              <th>Waktu</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id_history}>
                <td>{item.kontak_nama || "—"}</td>
                <td>{item.nomor_tujuan}</td>
                <td>{item.nama_template || "Custom"}</td>
                <td>
                  <span
                    className={
                      item.status_kirim === "sukses"
                        ? "history-status-badge success"
                        : "history-status-badge failed"
                    }
                  >
                    {item.status_kirim}
                  </span>
                </td>
                <td>{new Date(item.waktu_kirim).toLocaleString()}</td>
                <td>
                  <button
                    className="history-btn-delete"
                    onClick={() => handleDeleteOne(item.id_history)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal Konfirmasi Transparan */}
      {showModal && (
        <div className="modal-overlay-history">
          <div className="modal-content-history">
            <h3>Konfirmasi</h3>
            <p>
              {modalAction?.type === "all"
                ? "Yakin ingin menghapus semua riwayat?"
                : "Yakin ingin menghapus riwayat ini?"}
            </p>
            <div className="modal-actions">
              <button className="modal-btn confirm" onClick={confirmDelete}>
                Ya, Hapus
              </button>
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default MessageHistoryList;
