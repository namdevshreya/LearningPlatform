import React, { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Topbar } from "../components/Layout";
import { Loader, EmptyState } from "../components/Loader";
import StatCard from "../components/StatCard";
import ProgressRing from "../components/ProgressRing";

const PIE_COLORS = ["#4F46E5", "#16A34A", "#D97706", "#E11D48", "#0EA5E9", "#9333EA"];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data.dashboard))
      .catch((err) =>
        setError(err.response?.data?.message || "Couldn't load dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Dashboard unavailable" message={error} />;
  if (!data) return null;

  const trend = (data.timeSeries || []).map((t) => ({
    date: t._id?.slice(5) || "",
    minutes: t.minutes,
  }));
  const pie = (data.pieChartData || []).map((p) => ({
    name: p.course,
    value: p.progress,
  }));

  return (
    <>
      <div className="grid grid-stats" style={{ marginBottom: 20 }}>
        <StatCard
          icon={<FiCheckCircle />}
          label="Lessons completed"
          value={data.completedLessons ?? 0}
          foot="across all enrolled courses"
          color="var(--primary)"
        />
        <StatCard
          icon={<FiClock />}
          label="Time invested"
          value={`${data.totalTimeSpent ?? 0}m`}
          foot="total minutes logged"
          color="var(--warn)"
        />
        <StatCard
          icon={<FiTrendingUp />}
          label="Overall progress"
          value={`${Math.round(data.overallProgress ?? 0)}%`}
          foot="average across courses"
          color="var(--accent)"
        />
        <StatCard
          icon={<FiBookOpen />}
          label="Courses in progress"
          value={(data.courseProgress || []).length}
          foot="currently tracked"
          color="#0EA5E9"
        />
      </div>

      <div className="grid grid-charts" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Trend</div>
              <div className="card-title">Minutes studied over time</div>
            </div>
          </div>
          {trend.length === 0 ? (
            <EmptyState
              title="No activity yet"
              message="Complete a lesson to start your trend line."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="mins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E4E6F3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#666C93" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#666C93" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E4E6F3",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fill="url(#mins)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Distribution</div>
              <div className="card-title">Progress by course</div>
            </div>
          </div>
          {pie.length === 0 ? (
            <EmptyState title="Nothing to show" message="Enroll in a course to see this." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {pie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${Math.round(v)}%`}
                  contentStyle={{ borderRadius: 10, border: "1px solid #E4E6F3", fontSize: 13 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "#666C93" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Courses</div>
              <div className="card-title">Course-wise progress</div>
            </div>
          </div>
          {(data.courseProgress || []).length === 0 ? (
            <EmptyState title="No courses yet" message="Head to Courses to get started." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.courseProgress.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ProgressRing percent={c.progress} size={46} stroke={5} labelSize={10.5} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.course}</div>
                    <div className="bar-track" style={{ marginTop: 6 }}>
                      <div className="bar-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Recent</div>
              <div className="card-title">Latest activity</div>
            </div>
          </div>
          {(data.recentActivities || []).length === 0 ? (
            <EmptyState title="Nothing yet" message="Your recent lessons will show up here." />
          ) : (
            <div className="timeline">
              {data.recentActivities.map((a, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" />
                  <div className="timeline-title">
                    {a.activityType} — {a.lesson || a.course}
                  </div>
                  <div className="timeline-meta">
                    {a.course} · {a.timeSpent}m · {timeAgo(a.completedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MentorDashboard() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/courses"),
      api.get("/lessons"),
      api.get("/progress"),
      api.get("/activity"),
    ])
      .then(([c, l, p, a]) => {
        setCourses(c.data.courses || []);
        setLessons(l.data.lessons || []);
        setProgress(p.data.progress || []);
        setActivity(a.data.activities || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Couldn't load data"))
      .finally(() => setLoading(false));
  }, []);

  const learners = useMemo(() => {
    const ids = new Set(progress.map((p) => p.student?._id).filter(Boolean));
    return ids.size;
  }, [progress]);

  const avgProgress = useMemo(() => {
    if (progress.length === 0) return 0;
    return (
      progress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) /
      progress.length
    );
  }, [progress]);

  const courseAverages = useMemo(() => {
    const map = {};
    progress.forEach((p) => {
      const title = p.course?.title || "Untitled";
      if (!map[title]) map[title] = { total: 0, count: 0 };
      map[title].total += p.progressPercentage || 0;
      map[title].count += 1;
    });
    return Object.entries(map).map(([course, v]) => ({
      course,
      progress: v.total / v.count,
    }));
  }, [progress]);

  const activityTypeBreakdown = useMemo(() => {
    const map = {};
    activity.forEach((a) => {
      map[a.activityType] = (map[a.activityType] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activity]);

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Dashboard unavailable" message={error} />;

  return (
    <>
      <div className="grid grid-stats" style={{ marginBottom: 20 }}>
        <StatCard
          icon={<FiBookOpen />}
          label="Courses"
          value={courses.length}
          foot="published"
          color="var(--primary)"
        />
        <StatCard
          icon={<FiCheckCircle />}
          label="Lessons"
          value={lessons.length}
          foot="across all courses"
          color="var(--warn)"
        />
        <StatCard
          icon={<FiUsers />}
          label="Learners"
          value={learners}
          foot="with tracked progress"
          color="#0EA5E9"
        />
        <StatCard
          icon={<FiTrendingUp />}
          label="Avg. completion"
          value={`${Math.round(avgProgress)}%`}
          foot="across all learners"
          color="var(--accent)"
        />
      </div>

      <div className="grid grid-charts" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Courses</div>
              <div className="card-title">Average progress per course</div>
            </div>
          </div>
          {courseAverages.length === 0 ? (
            <EmptyState title="No data yet" message="Progress records will appear here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {courseAverages.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ProgressRing percent={c.progress} size={46} stroke={5} labelSize={10.5} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.course}</div>
                    <div className="bar-track" style={{ marginTop: 6 }}>
                      <div className="bar-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Distribution</div>
              <div className="card-title">Activity types logged</div>
            </div>
          </div>
          {activityTypeBreakdown.length === 0 ? (
            <EmptyState title="No activity yet" message="Learner activity will show up here." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={activityTypeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {activityTypeBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E4E6F3", fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#666C93" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-eyebrow">Recent</div>
            <div className="card-title">Latest learner activity</div>
          </div>
        </div>
        {activity.length === 0 ? (
          <EmptyState title="Nothing yet" message="Learner activity will appear here." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Lesson</th>
                <th>Type</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.slice(0, 8).map((a) => (
                <tr key={a._id}>
                  <td>{a.student?.name || "—"}</td>
                  <td>{a.course?.title || "—"}</td>
                  <td>{a.lesson?.title || "—"}</td>
                  <td>
                    <span className="badge badge-primary">{a.activityType}</span>
                  </td>
                  <td>{timeAgo(a.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <Topbar
        title={`Welcome back, ${user?.name?.split(" ")[0] || ""}`}
        sub={
          user?.role === "mentor"
            ? "Here's how your courses are performing."
            : "Here's where your learning stands today."
        }
      />
      <div className="content">
        {user?.role === "mentor" ? <MentorDashboard /> : <StudentDashboard />}
      </div>
    </>
  );
}
