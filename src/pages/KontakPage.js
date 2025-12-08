import React, { useState, useEffect } from "react";
import KontakModal from "./KontakModal";
import * as XLSX from "xlsx";

const KontakPage = () => {
  const [kontakList, setKontakList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingKontak, setEditingKontak] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/kontak");
      const data = await res.json();
      setKontakList(data);
    } catch (err) {
      console.error("Gagal ambil kontak:", err);
    }
  };

  const handleAddClick = () => {
    setEditingKontak(null);
    setShowModal(true);
  };

  const handleEditClick = (kontak) => {
    setEditingKontak(kontak);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus kontak ini?");
    if (confirm) {
      try {
        await fetch(`http://localhost:5000/api/kontak/${id}`, {
          method: "DELETE",
        });
        fetchData();
      } catch (err) {
        console.error("Gagal hapus kontak:", err);
      }
    }
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm("Yakin ingin menghapus SEMUA kontak?");
    if (confirm) {
      try {
        await fetch("http://localhost:5000/api/kontak", {
          method: "DELETE",
        });
        fetchData();
        alert("Semua kontak berhasil dihapus.");
      } catch (err) {
        console.error("Gagal hapus semua kontak:", err);
      }
    }
  };

  const handleSave = async (kontakBaru) => {
    try {
      if (kontakBaru.id) {
        const res = await fetch(
          `http://localhost:5000/api/kontak/${kontakBaru.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(kontakBaru),
          }
        );
        if (res.ok) fetchData();
      } else {
        const res = await fetch("http://localhost:5000/api/kontak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(kontakBaru),
        });
        if (res.ok) fetchData();
      }
    } catch (err) {
      console.error("Gagal simpan kontak:", err);
    }

    setShowModal(false);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return alert("File tidak ditemukan!");

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });

        const cleanHeaders = (data) => {
          return data.map((item) => {
            const newItem = {};
            for (const key in item) {
              const cleanKey = key.trim().toLowerCase();
              newItem[cleanKey] = item[key];
            }
            return newItem;
          });
        };

        json = cleanHeaders(json);

        const imported = json.map((item, index) => {
          return {
            kode: item["no. kontrak"] || `K00${index + 1}`,
            nama: item["cust_name"] || "-",
            telepon: item["cust_mobphone"] || "-",
            totalTenor: item["total tenor"] ? parseInt(item["total tenor"]) : 0,
            angsuranKe: item["ang ke"] ? parseInt(item["ang ke"]) : 0,
            sisa: item["sisa"] || "-",
          };
        });

        const res = await fetch("http://localhost:5000/kontak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(imported),
        });

        if (!res.ok) throw new Error("Gagal simpan ke database");

        alert("Import data berhasil!");
        fetchData();
      } catch (error) {
        console.error("Error saat import file:", error);
        alert("Terjadi kesalahan saat mengimpor file.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="kontak-page">
      <div className="kontak-header">
        <h2>List Kontak</h2>
        <div className="kontak-actions">
          <button onClick={handleAddClick}>+ Add Kontak</button>
          <label className="import-label">
            Import CSV/Excel
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImport}
              hidden
            />
          </label>
          <button onClick={handleDeleteAll} className="danger">
            🗑️ Hapus Semua
          </button>
        </div>
      </div>

      <table className="kontak-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Telepon</th>
            <th>Total Tenor</th>
            <th>Angsuran Ke</th>
            <th>Sisa</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {kontakList.map((kontak) => (
            <tr key={kontak.id}>
              <td>{kontak.kode}</td>
              <td>{kontak.nama}</td>
              <td>{kontak.telepon}</td>
              <td>{kontak.total_tenor}</td>
              <td>{kontak.angsuran_ke}</td>
              <td>{kontak.sisa}</td>
              <td>
                <button
                  onClick={() => handleEditClick(kontak)}
                  className="edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(kontak.id)}
                  className="danger"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <KontakModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          defaultValue={editingKontak}
        />
      )}
    </div>
  );
};

export default KontakPage;
