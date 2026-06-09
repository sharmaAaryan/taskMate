import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

/* Register */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if registering user matches the ADMIN_EMAIL
    let finalRole = role || "user";
    let isApproved = false;
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
      finalRole = "admin";
      isApproved = true;
    }

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      isApproved,
    });

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Login */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is approved
    if (!user.isApproved && user.role !== "admin") {
      // Allow admin email to bypass and auto-approve just in case
      if (!(process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL)) {
        return res.status(403).json({ message: "Account pending admin approval." });
      }
    }

    // Check if user is the designated admin in .env via email
    let finalRole = user.role;
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
      finalRole = "admin";
      
      // Optionally update the DB so their role is permanently admin and approved
      if (user.role !== "admin" || !user.isApproved) {
        user.role = "admin";
        user.isApproved = true;
        await user.save();
      }
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: finalRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Forgot Password */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token and expiry on User model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Construct reset link
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email using centralized email service
    const subject = "Taskmate - Password Reset Request";
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const emailResult = await sendEmail({ to: user.email, subject, text });

    if (emailResult.devMode) {
      return res.status(200).json({
        message: "Password reset request initiated (development mode). Please check the server console or use the link below.",
        devMode: true,
        resetUrl,
      });
    }

    if (emailResult.success) {
      return res.status(200).json({
        message: "A password reset email has been sent.",
      });
    } else {
      return res.status(500).json({ message: "Failed to send reset email: " + emailResult.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Reset Password */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user new password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};