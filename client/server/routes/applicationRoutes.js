import express from "express";
import {
  applyTask,
  getApplicationsByTask,
  getUserApplications,
} from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", applyTask);
router.get("/user/:userId", getUserApplications);
router.get("/:taskId", getApplicationsByTask);

export default router;