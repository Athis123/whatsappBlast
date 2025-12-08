import React, { useState } from "react";
import axios from "axios";
import { FaUserAlt, FaLock, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../dist/css/style.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username: email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
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

        <h2>Welcome Back</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="floating-label">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? <span className="loader"></span> : "Login"}
          </button>
        </form>

        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
