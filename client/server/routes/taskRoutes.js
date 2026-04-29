import express from "express";
import {
  getTasks,
  acceptApplicant,
  rejectApplicant,
  createTask,
  completeTask,
  deleteTask,
  getTaskById
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/create", createTask);
router.post("/accept", acceptApplicant);
router.post("/reject", rejectApplicant);
router.post("/complete", completeTask);
router.delete("/:id", deleteTask);

export default router;