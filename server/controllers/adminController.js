import Task from "../models/Task.js";
import User from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const tasks = await Task.find().populate("createdBy", "name email").populate("selectedVolunteers", "name email").sort({ createdAt: -1 });
    const users = await User.find().select("-password");

    // Calculate total money held in the Admin Escrow (Tasks in-progress)
    let totalEscrow = 0;
    tasks.forEach(task => {
      if (task.status === "in-progress" && task.selectedVolunteers) {
        totalEscrow += task.budget * task.selectedVolunteers.length;
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

export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.accountStatus === "permanently_banned") {
      return res.status(403).json({ message: "User is permanently banned and cannot be unblocked." });
    }

    user.accountStatus = "active";
    await user.save();

    res.json({ message: "User unblocked successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refundClientEscrow = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    if (task.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress tasks have escrow funds to refund." });
    }

    const client = await User.findById(task.createdBy);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Refund escrow to client
    const refundAmount = task.budget * task.selectedVolunteers.length;
    client.walletBalance += refundAmount;
    await client.save();

    // Create transaction record
    const Transaction = (await import("../models/Transaction.js")).default;
    await Transaction.create({
      user: client._id,
      type: "credit",
      amount: refundAmount,
      description: `Escrow forcefully refunded by Admin for task: ${task.title}`,
      taskId: task._id,
    });

    // Mark task as open again (or cancelled, but let's do open so they can hire someone else, or 'cancelled' if we want)
    task.status = "open";
    task.selectedVolunteers = []; // Unassign the volunteers
    task.applicants = []; // Clear applicants
    await task.save();

    res.json({ message: "Escrow successfully refunded to client. Task reopened. ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const releaseEscrowToVolunteer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    if (task.status !== "in-progress") {
      return res.status(400).json({ message: "Only in-progress tasks have escrow funds to release." });
    }

    if (!task.selectedVolunteers || task.selectedVolunteers.length === 0) {
       return res.status(400).json({ message: "No volunteer is assigned to this task." });
    }

    const Transaction = (await import("../models/Transaction.js")).default;

    for (let volId of task.selectedVolunteers) {
      const volunteer = await User.findById(volId);
      if (volunteer) {
        // Release escrow to volunteer
        volunteer.walletBalance += task.budget;
        await volunteer.save();

        // Create transaction record
        await Transaction.create({
          user: volunteer._id,
          type: "credit",
          amount: task.budget,
          description: `Escrow forcefully released by Admin for task: ${task.title}`,
          taskId: task._id,
          relatedUser: task.createdBy,
        });
      }
    }

    // Mark task as completed
    task.status = "completed";
    await task.save();

    res.json({ message: "Escrow successfully released to volunteer. Task completed. ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
