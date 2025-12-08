import React from "react";

const TemplateList = ({ templates, onEdit, onDelete }) => {
  return (
    <div className="template-list card">
      <h3>📄 Daftar Template</h3>

      {templates.length === 0 ? (
        <div className="empty-state">
          <img src="/no-data.svg" alt="No template" />
          <p>Belum ada template. Yuk buat satu!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Isi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_template}</td>
                  <td>{item.isi}</td>
                  <td>
                    <button className="edit-btn" onClick={() => onEdit(item)}>
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(item.id)}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplateList;
