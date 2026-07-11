# Ascent — Backend API

Express + MongoDB (Mongoose) API for the student progress dashboard.

## Setup

```bash
npm install
```

Edit `.env` if needed (defaults shown):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/studentDashboard
JWT_SECRET=studentdashboard123
```

Make sure MongoDB is running locally on that URI, then:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

Server runs at `http://localhost:5000`, all routes under `/api/...`.

### Sample data

To try the frontend without registering everything by hand:

```bash
npm run seed          # adds sample data, keeps anything already there
npm run seed:reset    # wipes users/courses/lessons/progress/activity first
```

This creates:
- `mentor@ascent.dev` / `password123` (role: mentor)
- `student@ascent.dev` / `password123` (role: student, partway through 2 of 3 seeded courses)
- 3 courses with 5–7 lessons each
- Progress + activity history for the sample student, dated over the last several days (so the dashboard's trend chart has something to show)

## Fixed for this build

- `models/user.js` was saved in lowercase but `authController.js` imports it as
  `../models/User.js`. That's harmless on Windows/macOS (case-insensitive
  filesystems) but throws `Cannot find module` on Linux and in most CI/hosting
  environments. Renamed the file to `models/User.js` to match the import.
- `getLessons`, `getAllProgress`, and `getActivities` now accept optional
  query filters (see below) instead of always returning the entire
  collection — the frontend uses these directly rather than filtering
  client-side.

## API reference

All routes except register/login require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role? }` | `role` is `student` (default) or `mentor` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET | `/api/auth/profile` | — | Current user, password excluded |

### Courses
| Method | Route | Body |
|---|---|---|
| GET | `/api/courses` | — |
| GET | `/api/courses/:id` | — |
| POST | `/api/courses` | `{ title, description, totalLessons, duration, level }` |
| PUT | `/api/courses/:id` | any subset of the above |
| DELETE | `/api/courses/:id` | — |

### Lessons
| Method | Route | Notes |
|---|---|---|
| GET | `/api/lessons?course=<id>` | `course` query param optional |
| GET | `/api/lessons/:id` | — |
| POST | `/api/lessons` | `{ title, description, course, duration, order, isPublished }` |
| PUT | `/api/lessons/:id` | — |
| DELETE | `/api/lessons/:id` | — |

### Progress
| Method | Route | Notes |
|---|---|---|
| GET | `/api/progress?student=<id>&course=<id>` | both query params optional |
| GET | `/api/progress/:id` | — |
| POST | `/api/progress` | `{ student, course, completedLessons, totalTimeSpent, progressPercentage }` |
| PUT | `/api/progress/:id` | — |
| DELETE | `/api/progress/:id` | — |

### Activity
| Method | Route | Notes |
|---|---|---|
| GET | `/api/activity?student=<id>&course=<id>&limit=<n>` | all query params optional |
| GET | `/api/activity/:id` | — |
| POST | `/api/activity` | `{ student, course, lesson, activityType, timeSpent }` |
| PUT | `/api/activity/:id` | — |
| DELETE | `/api/activity/:id` | — |

### Dashboard
| Method | Route | Notes |
|---|---|---|
| GET | `/api/dashboard` | Scoped to the logged-in student (`req.user.id`). Returns completed lesson count, total time, overall progress, per-course progress, pie chart data, recent activity, and a daily time-series for the trend chart. Mentors get an empty-ish result here today — the frontend's mentor dashboard builds its own view from the courses/lessons/progress/activity endpoints instead. |

## Still open (from the original requirement list)

- Automated tests
- A true mentor-scoped dashboard aggregate (frontend currently assembles this client-side)
