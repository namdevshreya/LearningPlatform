# Ascent — Student Progress Dashboard (Frontend)

A plain Create-React-App project (no Vite) that talks to your existing
Express + MongoDB backend.

## Setup

1. Make sure your backend is running on `http://localhost:5000`
   (or update `.env` below to match).
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Check `.env` — it already points to:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Change this if your backend runs elsewhere.
4. Start the dev server:
   ```bash
   npm start
   ```
   The app opens at `http://localhost:3000`.

## What's included

- **Auth** — register (student or mentor) and login, JWT stored in
  `localStorage`, attached to every request automatically.
- **Dashboard**
  - Student view: KPI cards, a minutes-studied trend chart, a
    progress-by-course donut, per-course progress rings, and a recent
    activity timeline — all from your `/api/dashboard` aggregate endpoint.
  - Mentor view: course/lesson/learner counts, average completion per
    course, activity-type breakdown, and a table of the latest learner
    activity — built client-side from `/api/courses`, `/api/lessons`,
    `/api/progress`, `/api/activity` (since the dashboard endpoint is
    scoped to students in the current backend).
- **Courses** — browse all courses; mentors get create/edit/delete.
- **Course detail** — lesson list; mentors manage lessons, students mark
  lessons complete (this logs an activity event **and** upserts the
  student's progress record, since the backend keeps those as separate
  resources).
- **Progress** — a student's own progress across courses, plus a
  **CSV export** button (stretch feature).
- **Activity** — full activity feed (mentors see everyone, students see
  their own).
- **Profile** — basic account info from `/api/auth/profile`.

## Syncing with the backend

This build targets the final backend (see its own README): `getLessons`,
`getAllProgress`, and `getActivities` now accept `?course=` / `?student=`
query params, and the frontend passes them. A light client-side filter is
still kept as a fallback in `CourseDetail.js`, `Progress.js`, and
`Activity.js` in case you ever point this at an older backend build that
doesn't support the query params yet.

Also note: the backend's `/api/auth/login` and `/api/auth/register`
responses use `user.id` (not `user._id`) for the current user's id — the
frontend relies on that consistently (e.g. when posting new activity/
progress records as the logged-in student).

## Folder structure

```
src/
  api/axios.js          — axios instance + auth interceptor
  context/AuthContext.js — login/register/logout/session state
  components/            — Sidebar, Layout, StatCard, ProgressRing, Loader
  pages/                 — Login, Register, Dashboard, Courses,
                            CourseDetail, Progress, Activity, Profile
  index.css              — design tokens + all component styles
```
