import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/users", { replace: true });
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) setError("Invalid email or password");
        else if (status === 403) setError("Account blocked");
        else setError(err.response.data.message || "Login error");
      } else {
        setError("Server unavailable");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      <div className="card p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <p className="text-muted mb-1">Start your journey</p>
        <h2 className="mb-4 text-center">Sign In to The App</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember Me
            </label>
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
            <p>
              Don't have an account?{" "}
              <a href="#" onClick={() => navigate("/register")}>
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
