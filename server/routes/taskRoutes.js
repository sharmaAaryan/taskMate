import express from "express";
import {
  getTasks,
  acceptApplicant,
  rejectApplicant,
  createTask,
  completeTask,
  deleteTask,
  getTaskById,
  submitProgress,
  updateExpiredTask
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/create", createTask);
router.post("/accept", acceptApplicant);
router.post("/reject", rejectApplicant);
router.post("/complete", completeTask);
router.post("/progress", submitProgress);
router.put("/update-expired/:id", updateExpiredTask);
router.delete("/:id", deleteTask);

export default router;