import React, { useState } from "react";
import { FaUserAlt, FaLock, FaMoon, FaSun } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../dist/css/style.css";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/register", {
        username,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("light-mode");
  };

  return (
    <div className={`login-container alt ${darkMode ? "" : "light"}`}>
      <div className="mode-toggle" onClick={toggleMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </div>

      <div className="login-form neumorphic">

        <h2>Register New Account</h2>

        <form onSubmit={handleRegister}>
          <div className="floating-label">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
            <FaUserAlt className="input-icon" />
          </div>

          <div className="floating-label">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <FaLock className="input-icon" />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <span className="loader"></span> : "Sign Up"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
