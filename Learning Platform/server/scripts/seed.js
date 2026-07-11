/**
 * Seed sample data for local development / demoing the dashboard.
 *
 * Usage:
 *   node scripts/seed.js          (adds sample data, keeping existing docs)
 *   node scripts/seed.js --reset  (wipes the 6 collections first, then seeds)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import Activity from "../models/Activity.js";

dotenv.config();

const RESET = process.argv.includes("--reset");

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  if (RESET) {
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Progress.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log("Existing data cleared");
  }

  // ---------------- Users ----------------
  const password = await bcrypt.hash("password123", 10);

  const mentor =
    (await User.findOne({ email: "mentor@ascent.dev" })) ||
    (await User.create({
      name: "Priya Sharma",
      email: "mentor@ascent.dev",
      password,
      role: "mentor",
    }));

  const student =
    (await User.findOne({ email: "student@ascent.dev" })) ||
    (await User.create({
      name: "Arjun Mehta",
      email: "student@ascent.dev",
      password,
      role: "student",
    }));

  console.log("Users ready:", mentor.email, student.email);

  // ---------------- Courses ----------------
  const courseDefs = [
    {
      title: "JavaScript Foundations",
      description: "Variables, functions, closures, and the event loop — the core of the language.",
      level: "Beginner",
      duration: 180,
      lessons: [
        "Variables & Data Types",
        "Functions & Scope",
        "Arrays & Objects",
        "Closures",
        "The Event Loop",
        "Async/Await",
      ],
    },
    {
      title: "React Essentials",
      description: "Components, state, hooks, and routing — build real interfaces with React.",
      level: "Intermediate",
      duration: 240,
      lessons: [
        "Components & Props",
        "State & useState",
        "useEffect & Side Effects",
        "React Router",
        "Forms & Controlled Inputs",
        "Context API",
        "Performance Basics",
      ],
    },
    {
      title: "MongoDB & Mongoose",
      description: "Schemas, queries, aggregation pipelines, and relationships for real apps.",
      level: "Advanced",
      duration: 200,
      lessons: [
        "Schemas & Models",
        "CRUD Queries",
        "Population & References",
        "Aggregation Pipelines",
        "Indexes & Performance",
      ],
    },
  ];

  const courses = [];
  for (const def of courseDefs) {
    let course = await Course.findOne({ title: def.title });
    if (!course) {
      course = await Course.create({
        title: def.title,
        description: def.description,
        level: def.level,
        duration: def.duration,
        totalLessons: def.lessons.length,
      });
    }
    courses.push({ course, lessonTitles: def.lessons });
  }
  console.log("Courses ready:", courses.map((c) => c.course.title).join(", "));

  // ---------------- Lessons ----------------
  const allLessons = []; // [{course, lessons: [doc,...]}]
  for (const { course, lessonTitles } of courses) {
    const lessonDocs = [];
    for (let i = 0; i < lessonTitles.length; i++) {
      let lesson = await Lesson.findOne({ course: course._id, title: lessonTitles[i] });
      if (!lesson) {
        lesson = await Lesson.create({
          title: lessonTitles[i],
          description: `Covers ${lessonTitles[i].toLowerCase()} with hands-on examples.`,
          course: course._id,
          duration: 15 + i * 5,
          order: i + 1,
        });
      }
      lessonDocs.push(lesson);
    }
    allLessons.push({ course, lessons: lessonDocs });
  }
  console.log("Lessons ready:", allLessons.reduce((n, c) => n + c.lessons.length, 0), "total");

  // ---------------- Progress + Activity for the sample student ----------------
  // Student is partway through course 1, has started course 2, hasn't touched course 3.
  const progressPlans = [
    { courseIndex: 0, completedCount: 6, minutesPer: 18 }, // finished JS Foundations
    { courseIndex: 1, completedCount: 3, minutesPer: 22 }, // partway through React
  ];

  for (const plan of progressPlans) {
    const { course, lessons } = allLessons[plan.courseIndex];
    const completed = lessons.slice(0, plan.completedCount);

    const existing = await Progress.findOne({ student: student._id, course: course._id });
    const totalTimeSpent = completed.length * plan.minutesPer;
    const progressPercentage = Math.round((completed.length / lessons.length) * 100);

    if (!existing) {
      await Progress.create({
        student: student._id,
        course: course._id,
        completedLessons: completed.map((l) => l._id),
        totalTimeSpent,
        progressPercentage,
      });
    }

    // One activity event per completed lesson, spread across the last few days
    for (let i = 0; i < completed.length; i++) {
      const already = await Activity.findOne({
        student: student._id,
        lesson: completed[i]._id,
      });
      if (already) continue;

      await Activity.create({
        student: student._id,
        course: course._id,
        lesson: completed[i]._id,
        activityType: "Lesson Completed",
        timeSpent: plan.minutesPer,
        completedAt: daysAgo(completed.length - i),
      });
    }
  }

  console.log("Progress & activity seeded for", student.email);
  console.log("\nDone. Sample logins:");
  console.log("  mentor@ascent.dev  / password123");
  console.log("  student@ascent.dev / password123");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
