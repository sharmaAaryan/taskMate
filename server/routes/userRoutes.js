import express from "express";
import { getUserProfile, updateUserProfile, addFunds } from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);
router.post("/:id/add-funds", addFunds);

export default router;
