import Application from "../models/Application.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/* Apply to Task */
export const applyTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const alreadyApplied = task.applicants.find(
      (app) => app.user.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add applicant to task
    task.applicants.push({ user: userId, name: user.name });
    await task.save();

    // Maintain application record
    const app = await Application.create({ taskId, userId });

    // 🔔 Create Notification for the Client
    if (task.createdBy) {
      await Notification.create({
        userId: task.createdBy,
        message: `${user.name} applied to your task "${task.title}"`,
      });
    }

    res.status(201).json({
      message: "Applied successfully",
      app,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Applications for a Task */
export const getApplicationsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const apps = await Application.find({ taskId })
      .populate("userId", "name email");

    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Applications for a User */
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;

    const apps = await Application.find({ userId }).populate({
      path: "taskId",
      populate: { path: "createdBy", select: "name" },
    });

    const applicationsWithStatus = apps.map((app) => {
      const task = app.taskId;
      if (!task) return null;

      let status = "Pending";

      if (task.selectedVolunteer?.toString() === userId) {
        status = "Accepted";
      } else if (task.selectedVolunteer) {
        // Someone else was selected
        status = "Rejected";
      } else {
        // No one selected yet. Are they still in applicants?
        const stillApplicant = task.applicants.some(
          (a) => a.user.toString() === userId
        );
        if (!stillApplicant) {
          status = "Rejected";
        }
      }

      return {
        _id: app._id,
        task,
        status,
        appliedAt: app.createdAt,
      };
    }).filter((app) => {
      if (!app) return false;
      if (app.task.status === "completed") return false;
      if (app.status === "Rejected") return false;
      return true;
    });

    res.status(200).json(applicationsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};