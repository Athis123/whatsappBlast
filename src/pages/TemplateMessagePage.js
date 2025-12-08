import React, { useEffect, useState } from "react";
import axios from "axios";
import TemplateForm from "../components/TemplateForm";
import TemplateList from "../components/TemplateList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TemplateMessagePage = () => {
  const [templates, setTemplates] = useState([]);
  const [namaTemplate, setNamaTemplate] = useState("");
  const [isiTemplate, setIsiTemplate] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/template");
      setTemplates(res.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nama_template: namaTemplate,
      isi: isiTemplate,
    };

    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/template/${editId}`,
          payload
        );
        toast.success("Template berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:5000/api/template", payload);
        toast.success("Template berhasil ditambahkan!");
      }

      resetForm();
      fetchTemplates();
    } catch (error) {
      // 🔥 Tambahkan ini untuk tangani error jumlah maksimal
      if (error.response?.status === 400) {
        toast.error(error.response.data.message); // ← tampilkan pesan dari server
      } else {
        toast.error("Terjadi kesalahan saat menyimpan.");
      }
    }
  };

  const resetForm = () => {
    setNamaTemplate("");
    setIsiTemplate("");
    setEditId(null);
  };

  const handleEdit = (template) => {
    setNamaTemplate(template.nama_template);
    setIsiTemplate(template.isi);
    setEditId(template.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus template ini?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/template/${id}`
        );
        fetchTemplates(); // Memperbarui daftar template setelah dihapus
        toast.success("Template berhasil dihapus!");
      } catch (error) {
        toast.error("Gagal menghapus template.");
        console.error("Error deleting template:", error); // Menampilkan error di console
      }
    }
  };

  return (
    <div className="template-container">
      <div className="template-grid">
        <TemplateForm
          namaTemplate={namaTemplate}
          isiTemplate={isiTemplate}
          onChangeNama={setNamaTemplate}
          onChangeIsi={setIsiTemplate}
          onSubmit={handleSubmit}
          editId={editId}
        />

        <TemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default TemplateMessagePage;
