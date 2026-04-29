import Task from "../models/Task.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, userId } = req.body;
    
    const task = await Task.create({
      title,
      description,
      budget,
      deadline,
      createdBy: userId,
    });

    res.status(201).json({ message: "Task Posted ✅", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Tasks */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ✅ Accept Applicant (Escrow Logic) */
export const acceptApplicant = async (req, res) => {
  const { taskId, userId } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const client = await User.findById(task.createdBy);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.walletBalance < task.budget) {
      return res.status(400).json({ message: "Insufficient balance to fund Escrow! ❌" });
    }

    // Deduct from Client (Hold in Escrow)
    client.walletBalance -= task.budget;
    await client.save();

    await Transaction.create({
      user: client._id,
      type: "escrow_deduction",
      amount: task.budget,
      description: `Held in escrow for task: ${task.title}`,
      taskId: task._id,
      relatedUser: userId,
    });

    task.selectedVolunteer = userId;
    task.status = "in-progress";

    await task.save();

    res.json({ message: `Applicant Accepted! ₹${task.budget} held in Escrow ✅` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ❌ Reject Applicant */
export const rejectApplicant = async (req, res) => {
  const { taskId, userId } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.applicants = task.applicants.filter(
      (app) => app.user.toString() !== userId
    );

    await task.save();

    res.json({ message: "Applicant Rejected ❌" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🏆 Complete Task & Review (Release Escrow) */
export const completeTask = async (req, res) => {
  const { taskId, score, review, byUserId } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "completed") {
      return res.status(400).json({ message: "Task is already completed" });
    }

    task.status = "completed";
    await task.save();

    if (task.selectedVolunteer) {
      const volunteer = await User.findById(task.selectedVolunteer);
      if (volunteer) {
        // Release Escrow to Volunteer
        volunteer.walletBalance += task.budget;

        await Transaction.create({
          user: volunteer._id,
          type: "credit",
          amount: task.budget,
          description: `Payment received for completing task: ${task.title}`,
          taskId: task._id,
          relatedUser: task.createdBy,
        });

        if (score) {
          volunteer.ratings.push({
            score: Number(score),
            review,
            taskId: task._id,
            byUser: byUserId,
          });
        }
        await volunteer.save();
      }
    }

    res.json({ message: `Task completed! ₹${task.budget} released to volunteer 🎉` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🗑️ Delete Task */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "in-progress") {
      return res.status(400).json({ message: "Cannot delete an in-progress task" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted successfully 🗑️" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Task By ID */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("selectedVolunteer", "name email");
      
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};