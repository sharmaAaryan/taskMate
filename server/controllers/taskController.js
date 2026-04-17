import Task from "../models/Task.js";

/* Create Task */
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

    res.status(201).json(task);
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