import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Course
router.post("/", protect, createCourse);

// Get All Courses
router.get("/", protect, getCourses);

// Get Single Course
router.get("/:id", protect, getCourseById);

// Update Course
router.put("/:id", protect, updateCourse);

// Delete Course
router.delete("/:id", protect, deleteCourse);

export default router;
