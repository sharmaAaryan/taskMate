import Complaint from "../models/Complaint.js";

// For Clients/Volunteers to submit a complaint
export const submitComplaint = async (req, res) => {
  try {
    const { userId, subject, description } = req.body;

    const complaint = await Complaint.create({
      user: userId,
      subject,
      description,
    });

    res.status(201).json({ message: "Complaint submitted successfully. An admin will review it soon.", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For Admin to get all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For Admin to update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: `Complaint marked as ${status} ✅`, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
