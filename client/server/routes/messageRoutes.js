import express from "express";
import { getMessagesByTask } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:taskId", getMessagesByTask);

export default router;
