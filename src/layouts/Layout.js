// layouts/Layout.jsx
import NavbarComponent from "../components/NavbarComponents";
import SidebarComponent from "../components/SidebarComponent";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="d-flex">
      <SidebarComponent isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className="flex-grow-1"
      >
        <NavbarComponent />
        <main className={`layout-content ${!isSidebarOpen ? "collapsed" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
