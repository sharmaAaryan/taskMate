import express from "express";
import {
  applyTask,
  getApplicationsByTask,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", applyTask);
router.get("/:taskId", getApplicationsByTask); // 👈 NEW

export default router;