import Task from "../models/Task.js";
import User from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const tasks = await Task.find().populate("createdBy", "name email").populate("selectedVolunteer", "name email").sort({ createdAt: -1 });
    const users = await User.find().select("-password");

    // Calculate total money held in the Admin Escrow (Tasks in-progress)
    let totalEscrow = 0;
    tasks.forEach(task => {
      if (task.status === "in-progress") {
        totalEscrow += task.budget;
      }
    });

    res.status(200).json({
      totalEscrow,
      totalTasks: tasks.length,
      totalUsers: users.length,
      tasks,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();
    
    res.json({ message: "User approved successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User rejected and removed ❌" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
