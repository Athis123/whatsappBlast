import React from "react";

const TemplateForm = ({
  namaTemplate,
  isiTemplate,
  onChangeNama,
  onChangeIsi,
  onSubmit,
  editId,
}) => {
  const insertVariable = (variable) => {
    onChangeIsi(isiTemplate + `{{${variable}}}`);
  };

  return (
    <div className="template-form card">
      <h2>📝 {editId ? "Edit Template" : "Tambah Template Baru"}</h2>

      <input
        type="text"
        placeholder="Nama Template"
        value={namaTemplate}
        onChange={(e) => onChangeNama(e.target.value)}
      />

      <textarea
        rows="5"
        placeholder="Isi pesan template"
        value={isiTemplate}
        onChange={(e) => onChangeIsi(e.target.value)}
      />

      <div className="var-buttons">
        {["nama", "telepon", "angsuranKe"].map((v) => (
          <button type="button" key={v} onClick={() => insertVariable(v)}>
            {"{{" + v + "}}"}
          </button>
        ))}
      </div>

      <div className="form-actions">
        <button className="save-btn" onClick={onSubmit}>
          {editId ? "💾 Simpan Perubahan" : "✅ Simpan Template"}
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;
