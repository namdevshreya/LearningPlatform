import express from "express";
import {
  createProgress,
  getAllProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
} from "../controllers/progressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProgress);

router.get("/", protect, getAllProgress);

router.get("/:id", protect, getProgressById);

router.put("/:id", protect, updateProgress);

router.delete("/:id", protect, deleteProgress);

export default router;
