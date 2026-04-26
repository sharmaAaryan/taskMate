import express from "express";
import { submitComplaint, getAllComplaints, updateComplaintStatus } from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", submitComplaint);
router.get("/", getAllComplaints);
router.put("/:id/status", updateComplaintStatus);

export default router;
