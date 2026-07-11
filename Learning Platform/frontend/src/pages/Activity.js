import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Topbar } from "../components/Layout";
import { Loader, EmptyState } from "../components/Loader";

const TYPE_BADGE = {
  "Lesson Completed": "badge-accent",
  "Course Started": "badge-primary",
  "Course Completed": "badge-warn",
};

export default function Activity() {
  const { user } = useAuth();
  const isMentor = user?.role === "mentor";
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = isMentor ? {} : { student: user.id };
    api
      .get("/activity", { params })
      .then((res) => {
        const all = res.data.activities || [];
        setActivity(isMentor ? all : all.filter((a) => a.student?._id === user.id));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Topbar
        title="Activity"
        sub={isMentor ? "Every logged event, across all students." : "Everything you've logged so far."}
      />
      <div className="content">
        <div className="card">
          {loading ? (
            <Loader />
          ) : activity.length === 0 ? (
            <EmptyState title="No activity yet" message="Completed lessons will show up here." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {isMentor && <th>Student</th>}
                  <th>Course</th>
                  <th>Lesson</th>
                  <th>Type</th>
                  <th>Time spent</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a) => (
                  <tr key={a._id}>
                    {isMentor && <td>{a.student?.name || "—"}</td>}
                    <td>{a.course?.title || "—"}</td>
                    <td>{a.lesson?.title || "—"}</td>
                    <td>
                      <span className={`badge ${TYPE_BADGE[a.activityType] || "badge-muted"}`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td>{a.timeSpent}m</td>
                    <td>{new Date(a.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
