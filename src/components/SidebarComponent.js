// components/SidebarComponent.jsx
import { Link, useLocation } from "react-router-dom";
import {
  FaQrcode,
  FaAddressBook,
  FaPaperPlane,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
} from "react-icons/fa";

const SidebarComponent = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: <FaQrcode />, label: "QR Code" },
    { to: "/kontak", icon: <FaAddressBook />, label: "List Kontak" },
    { to: "/send-message", icon: <FaPaperPlane />, label: "Kirim Pesan" },
    { to: "/template", icon: <FaPaperPlane />, label: "Buat Template" },
  ];

  return (
    <div
      className="d-flex flex-column shadow-sm"
      style={{
        width: isOpen ? 250 : 80,
        transition: "width 0.3s ease",
        background: "#f4f8fb",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1040,
        borderRight: "1px solid #ddd",
        padding: "1rem 0.5rem",
        overflowX: "hidden",
      }}
    >
      {/* Brand + Toggle */}
      <div className="d-flex justify-content-between align-items-center px-3 mb-4">
        {isOpen ? (
          <h5 className="fw-bold text-primary d-flex align-items-center gap-2 mb-0">
            <FaBolt /> Blast WhatsApp
          </h5>
        ) : (
          <FaBolt size={24} className="text-primary" />
        )}
        <button
          onClick={toggleSidebar}
          className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: "0.75rem",
          }}
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="d-flex flex-column gap-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`d-flex align-items-center gap-2 px-3 py-2 rounded ${
              location.pathname === item.to
                ? "bg-primary text-white"
                : "text-dark"
            }`}
            style={{
              textDecoration: "none",
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto text-center text-muted px-2" style={{ fontSize: 12 }}>
        {isOpen && <>&copy; {new Date().getFullYear()} Fiona Jessika</>}
      </div>
    </div>
  );
};

export default SidebarComponent;
