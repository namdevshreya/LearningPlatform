import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBookOpen,
  FiTrendingUp,
  FiActivity,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <svg className="brand-mark" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="15.5" stroke="#4F46E5" strokeWidth="2.4" />
          <path
            d="M17 4.5A12.5 12.5 0 0 1 29.5 17"
            stroke="#16A34A"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <div className="brand-name">Ascent</div>
          <div className="brand-sub">learning progress</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">
          <FiGrid /> Dashboard
        </NavLink>
        <NavLink to="/courses" className="nav-link">
          <FiBookOpen /> Courses
        </NavLink>
        {user?.role === "student" && (
          <NavLink to="/progress" className="nav-link">
            <FiTrendingUp /> Progress
          </NavLink>
        )}
        <NavLink to="/activity" className="nav-link">
          <FiActivity /> Activity
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          <FiUser /> Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut /> Log out
        </button>
      </div>
    </aside>
  );
}
