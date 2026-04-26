import express from "express";
import { getAdminStats, approveUser, rejectUser } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.put("/users/:id/approve", approveUser);
router.delete("/users/:id/reject", rejectUser);

export default router;
