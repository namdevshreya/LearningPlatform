import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiClock, FiLayers, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Topbar } from "../components/Layout";
import { Loader, EmptyState } from "../components/Loader";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LEVEL_BADGE = {
  Beginner: "badge-accent",
  Intermediate: "badge-warn",
  Advanced: "badge-primary",
};

const emptyForm = {
  title: "",
  description: "",
  totalLessons: 0,
  duration: 0,
  level: "Beginner",
};

function CourseModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?._id);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "totalLessons" || name === "duration" ? Number(value) : value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/courses/${initial._id}`, form);
      } else {
        await api.post("/courses", form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? "Edit course" : "New course"}</h3>
          <button className="icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input name="title" required value={form.title} onChange={onChange} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={onChange}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Total lessons</label>
              <input
                type="number"
                min="0"
                name="totalLessons"
                value={form.totalLessons}
                onChange={onChange}
              />
            </div>
            <div className="field">
              <label>Duration (min)</label>
              <input
                type="number"
                min="0"
                name="duration"
                value={form.duration}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="field">
            <label>Level</label>
            <select name="level" value={form.level} onChange={onChange}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create course"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const { user } = useAuth();
  const isMentor = user?.role === "mentor";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/courses")
      .then((res) => setCourses(res.data.courses || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? This can't be undone.")) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <>
      <Topbar
        title="Courses"
        sub={isMentor ? "Create and manage your course catalog." : "Browse what's available to learn."}
        action={
          isMentor && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <FiPlus /> New course
            </button>
          )
        }
      />
      <div className="content">
        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            message={isMentor ? "Create your first course to get started." : "Check back soon."}
          />
        ) : (
          <div className="course-grid">
            {courses.map((c) => (
              <div className="course-card" key={c._id}>
                <div className="course-card-head">
                  <div className="course-title">{c.title}</div>
                  <span className={`badge ${LEVEL_BADGE[c.level] || "badge-muted"}`}>
                    {c.level}
                  </span>
                </div>
                <div className="course-desc">{c.description}</div>
                <div className="course-meta">
                  <span>
                    <FiLayers /> {c.totalLessons} lessons
                  </span>
                  <span>
                    <FiClock /> {c.duration}m
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <Link to={`/courses/${c._id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                    View lessons
                  </Link>
                  {isMentor && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalOpen && (
        <CourseModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </>
  );
}
