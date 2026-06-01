import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    budget: Number,
    deadline: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
      },
    ],

    selectedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },

    progressReports: [
      {
        description: String,
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);