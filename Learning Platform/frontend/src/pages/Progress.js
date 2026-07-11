import React, { useEffect, useState } from "react";
import { FiDownload, FiClock, FiBookOpen } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Topbar } from "../components/Layout";
import { Loader, EmptyState } from "../components/Loader";
import ProgressRing from "../components/ProgressRing";

function downloadCSV(rows) {
  const header = ["Course", "Completed Lessons", "Total Time (min)", "Progress %", "Last Accessed"];
  const lines = [header.join(",")];
  rows.forEach((r) => {
    lines.push(
      [
        `"${r.course?.title || ""}"`,
        r.completedLessons?.length || 0,
        r.totalTimeSpent || 0,
        Math.round(r.progressPercentage || 0),
        r.lastAccessed ? new Date(r.lastAccessed).toISOString().slice(0, 10) : "",
      ].join(","),
    );
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-progress.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Progress() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/progress", { params: { student: user.id } })
      .then((res) => {
        const mine = (res.data.progress || []).filter((p) => p.student?._id === user.id);
        setRecords(mine);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <>
      <Topbar
        title="Your progress"
        sub="Every course you've started, at a glance."
        action={
          records.length > 0 && (
            <button className="btn btn-ghost" onClick={() => downloadCSV(records)}>
              <FiDownload /> Export CSV
            </button>
          )
        }
      />
      <div className="content">
        {loading ? (
          <Loader />
        ) : records.length === 0 ? (
          <EmptyState
            title="No progress tracked yet"
            message="Complete a lesson from a course to start building your record."
          />
        ) : (
          <div className="course-grid">
            {records.map((r) => (
              <div className="course-card" key={r._id}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ProgressRing percent={r.progressPercentage} size={54} stroke={6} />
                  <div>
                    <div className="course-title">{r.course?.title}</div>
                    <div className="course-meta" style={{ marginTop: 4 }}>
                      <span>
                        <FiBookOpen /> {r.completedLessons?.length || 0} lessons
                      </span>
                      <span>
                        <FiClock /> {r.totalTimeSpent || 0}m
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${r.progressPercentage || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
