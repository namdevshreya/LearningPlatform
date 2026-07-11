import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
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
        <h1>Set up once. Track everything after.</h1>
        <p>
          Students get a dashboard of progress, time spent, and trends.
          Mentors get a place to shape the courses and lessons behind it.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Create your account</h2>
          <p className="sub">Takes about thirty seconds.</p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="role-toggle">
              <div
                className={`role-option ${form.role === "student" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "student" })}
              >
                I'm a student
              </div>
              <div
                className={`role-option ${form.role === "mentor" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "mentor" })}
              >
                I'm a mentor
              </div>
            </div>
            <div className="field">
              <label>Full name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={onChange}
                placeholder="Jordan Lee"
              />
            </div>
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
                minLength={6}
                value={form.password}
                onChange={onChange}
                placeholder="At least 6 characters"
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <div className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
