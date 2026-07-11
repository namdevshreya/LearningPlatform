import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiX,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Topbar } from "../components/Layout";
import { Loader, EmptyState } from "../components/Loader";
import ProgressRing from "../components/ProgressRing";

const emptyForm = { title: "", description: "", duration: 10, order: 1, isPublished: true };

function LessonModal({ courseId, initial, nextOrder, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial || { ...emptyForm, order: nextOrder },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial?._id);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : name === "duration" || name === "order"
          ? Number(value)
          : value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, course: courseId };
      if (isEdit) {
        await api.put(`/lessons/${initial._id}`, payload);
      } else {
        await api.post("/lessons", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEdit ? "Edit lesson" : "New lesson"}</h3>
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
            <textarea name="description" value={form.description} onChange={onChange} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Duration (min)</label>
              <input type="number" min="1" name="duration" value={form.duration} onChange={onChange} />
            </div>
            <div className="field">
              <label>Order</label>
              <input type="number" min="1" name="order" value={form.order} onChange={onChange} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add lesson"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CompleteModal({ lesson, onClose, onDone }) {
  const [minutes, setMinutes] = useState(lesson.duration || 10);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onDone(Number(minutes));
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <div className="modal-head">
          <h3>Mark as complete</h3>
          <button className="icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Minutes spent on "{lesson.title}"</label>
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Saving…" : "Confirm completion"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isMentor = user?.role === "mentor";

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [myProgress, setMyProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [completing, setCompleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const [courseRes, lessonsRes] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/lessons`, { params: { course: id } }),
    ]);
    setCourse(courseRes.data.course);
    setLessons(
      (lessonsRes.data.lessons || [])
        // belt-and-suspenders: filter client-side too, in case an older
        // backend build doesn't yet support the ?course= query param
        .filter((l) => l.course?._id === id)
        .sort((a, b) => a.order - b.order),
    );

    if (!isMentor) {
      const progressRes = await api.get("/progress", {
        params: { student: user.id, course: id },
      });
      const mine = (progressRes.data.progress || [])[0];
      setMyProgress(mine || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const completedIds = new Set((myProgress?.completedLessons || []).map((l) => l._id || l));

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    await api.delete(`/lessons/${lessonId}`);
    load();
  };

  const handleComplete = async (lesson, minutes) => {
    // 1) log the activity event
    await api.post("/activity", {
      student: user.id,
      course: id,
      lesson: lesson._id,
      activityType: "Lesson Completed",
      timeSpent: minutes,
    });

    // 2) upsert this student's progress record for the course
    const newCompleted = new Set(completedIds);
    newCompleted.add(lesson._id);
    const total = lessons.length || 1;
    const pct = Math.round((newCompleted.size / total) * 100);
    const totalTime = (myProgress?.totalTimeSpent || 0) + minutes;

    if (myProgress) {
      await api.put(`/progress/${myProgress._id}`, {
        completedLessons: Array.from(newCompleted),
        totalTimeSpent: totalTime,
        progressPercentage: pct,
        lastAccessed: new Date().toISOString(),
      });
    } else {
      await api.post("/progress", {
        student: user.id,
        course: id,
        completedLessons: Array.from(newCompleted),
        totalTimeSpent: totalTime,
        progressPercentage: pct,
      });
    }

    setCompleting(null);
    load();
  };

  if (loading) return <Loader />;
  if (!course) return <EmptyState title="Course not found" message="It may have been removed." />;

  return (
    <>
      <Topbar
        title={course.title}
        sub={
          <Link to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FiArrowLeft /> Back to courses
          </Link>
        }
        action={
          isMentor && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingLesson(null);
                setModalOpen(true);
              }}
            >
              <FiPlus /> New lesson
            </button>
          )
        }
      />
      <div className="content">
        <div className="grid grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-eyebrow">About</div>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {course.description}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <span className="badge badge-primary">{course.level}</span>
              <span className="badge badge-muted">{course.duration}m total</span>
              <span className="badge badge-muted">{lessons.length} lessons</span>
            </div>
          </div>
          {!isMentor && (
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <ProgressRing percent={myProgress?.progressPercentage || 0} size={72} stroke={7} />
              <div>
                <div className="card-title">Your progress</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {completedIds.size} of {lessons.length} lessons complete
                  <br />
                  {myProgress?.totalTimeSpent || 0} minutes logged
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            Lessons
          </div>
          {lessons.length === 0 ? (
            <EmptyState
              title="No lessons yet"
              message={isMentor ? "Add the first lesson for this course." : "Check back soon."}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {lessons.map((l, idx) => {
                const done = completedIds.has(l._id);
                return (
                  <div
                    key={l._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 4px",
                      borderBottom: idx < lessons.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    {!isMentor &&
                      (done ? (
                        <FiCheckCircle color="var(--accent)" size={19} />
                      ) : (
                        <FiCircle color="var(--text-faint)" size={19} />
                      ))}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {l.order}. {l.title}
                      </div>
                      {l.description && (
                        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                          {l.description}
                        </div>
                      )}
                    </div>
                    <span className="badge badge-muted">
                      <FiClock /> {l.duration}m
                    </span>
                    {isMentor ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setEditingLesson(l);
                            setModalOpen(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLesson(l._id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm"
                        style={{
                          background: done ? "var(--accent-soft)" : "var(--primary)",
                          color: done ? "var(--accent)" : "#fff",
                        }}
                        disabled={done}
                        onClick={() => setCompleting(l)}
                      >
                        {done ? "Completed" : "Mark complete"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <LessonModal
          courseId={id}
          initial={editingLesson}
          nextOrder={lessons.length + 1}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
      {completing && (
        <CompleteModal
          lesson={completing}
          onClose={() => setCompleting(null)}
          onDone={(minutes) => handleComplete(completing, minutes)}
        />
      )}
    </>
  );
}
