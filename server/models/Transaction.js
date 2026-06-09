import mongoose from "mongoose";
import { sendEmail } from "../utils/emailService.js";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "escrow_deduction"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

transactionSchema.post("save", async function (doc) {
  try {
    const User = mongoose.model("User");
    const user = await User.findById(doc.user);
    if (!user || !user.email) return;

    const subject = `Taskmate - Wallet Transaction Alert`;
    const text = `Hello ${user.name},\n\n` +
      `This is a notification for a transaction on your Taskmate wallet:\n\n` +
      `Amount: ₹${doc.amount}\n` +
      `Type: ${doc.type.toUpperCase()}\n` +
      `Description: ${doc.description}\n\n` +
      `Your current wallet balance is: ₹${user.walletBalance}.\n\n` +
      `Thank you for using Taskmate!\n`;

    await sendEmail({ to: user.email, subject, text });
  } catch (error) {
    console.error("Error in Transaction post-save hook:", error);
  }
});

export default mongoose.model("Transaction", transactionSchema);
