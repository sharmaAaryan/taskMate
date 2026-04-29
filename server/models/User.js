import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "helper", "admin"], // client, volunteer, or admin
      default: "user",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    ratings: [
      {
        score: { type: Number, required: true },
        review: { type: String },
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    walletBalance: {
      type: Number,
      default: 50000, // 50,000 INR starting fake money
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["active", "temporarily_blocked", "permanently_banned"],
      default: "active",
    },
    strikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);