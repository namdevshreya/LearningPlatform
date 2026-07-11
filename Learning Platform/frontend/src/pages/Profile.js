import React, { useEffect, useState } from "react";
import { FiMail, FiUser, FiShield } from "react-icons/fi";
import api from "../api/axios";
import { Topbar } from "../components/Layout";
import { Loader } from "../components/Loader";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/auth/profile").then((res) => setProfile(res.data.user));
  }, []);

  if (!profile) return <Loader />;

  const initials = (profile.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Topbar title="Profile" sub="Your account details." />
      <div className="content">
        <div className="card" style={{ maxWidth: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                {profile.name}
              </div>
              <span className="badge badge-primary">{profile.role}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <FiUser color="var(--text-faint)" /> {profile.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <FiMail color="var(--text-faint)" /> {profile.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <FiShield color="var(--text-faint)" /> {profile.role} account
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
