import express from "express";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createLesson);

router.get("/", protect, getLessons);

router.get("/:id", protect, getLessonById);

router.put("/:id", protect, updateLesson);

router.delete("/:id", protect, deleteLesson);

export default router;
