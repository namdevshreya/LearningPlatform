import express from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createActivity);
router.get("/", protect, getActivities);
router.get("/:id", protect, getActivityById);
router.put("/:id", protect, updateActivity);
router.delete("/:id", protect, deleteActivity);

export default router;
