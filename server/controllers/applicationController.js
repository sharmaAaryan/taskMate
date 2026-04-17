import Application from "../models/Application.js";

export const applyTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const alreadyApplied = await Application.findOne({ taskId, userId });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const app = await Application.create({ taskId, userId });

    res.status(201).json({
      message: "Applied successfully",
      app,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};