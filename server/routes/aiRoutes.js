import express from "express";
import { enhanceDescription } from "../controllers/aiController.js";

const router = express.Router();

router.post("/enhance-description", enhanceDescription);

export default router;