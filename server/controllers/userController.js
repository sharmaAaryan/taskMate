import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { bio, skills } = req.body;
    
    // Convert comma-separated string to array if necessary
    let skillsArray = skills;
    if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { bio, skills: skillsArray },
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
