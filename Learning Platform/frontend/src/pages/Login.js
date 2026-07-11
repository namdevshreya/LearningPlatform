import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-aside">
        <h1>Every lesson finished is one ring closer.</h1>
        <p>
          Ascent tracks the courses you're working through, the minutes you
          put in, and how that adds up over time — so momentum stays visible.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p className="sub">Log in to see where you left off.</p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <div className="auth-switch">
            New to Ascent? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
