import express from "express";
import { applyTask } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", applyTask);

export default router;