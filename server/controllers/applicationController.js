import Application from "../models/Application.js";

/* Apply to Task */
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