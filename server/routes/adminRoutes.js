import express from "express";
import { getAdminStats, approveUser, rejectUser, unblockUser } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.put("/users/:id/approve", approveUser);
router.delete("/users/:id/reject", rejectUser);
router.put("/users/:id/unblock", unblockUser);

export default router;
