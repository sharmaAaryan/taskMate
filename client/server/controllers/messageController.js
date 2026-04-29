import Message from "../models/Message.js";

// Fetch all messages for a specific task
export const getMessagesByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const messages = await Message.find({ task: taskId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
