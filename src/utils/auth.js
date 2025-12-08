export const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // atau gunakan useNavigate jika dalam komponen React
  };