// components/NavbarComponent.jsx
import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { handleLogout } from "../utils/auth";

const NavbarComponent = () => {
  const [changeColor, setChangeColor] = useState(false);

  const changeBackgroundColor = () => {
    setChangeColor(window.scrollY > 10);
  };

  useEffect(() => {
    changeBackgroundColor();
    window.addEventListener("scroll", changeBackgroundColor);
    return () => window.removeEventListener("scroll", changeBackgroundColor);
  }, []);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`shadow-sm bg-white ${changeColor ? "color-active" : ""}`}
      style={{
        height: 72,
        zIndex: 1020, // di bawah sidebar yang 1040
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <Container fluid className="justify-content-end px-4">
        <Nav>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              className="fw-semibold rounded shadow-sm px-3 py-2"
            >
              👤 Profil
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                Keluar
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
