import express from "express";
import { getAdminStats, approveUser, rejectUser, unblockUser, refundClientEscrow, releaseEscrowToVolunteer } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.put("/users/:id/approve", approveUser);
router.delete("/users/:id/reject", rejectUser);
router.put("/users/:id/unblock", unblockUser);

// Dispute Resolution Routes
router.post("/disputes/:taskId/refund", refundClientEscrow);
router.post("/disputes/:taskId/release", releaseEscrowToVolunteer);

export default router;
