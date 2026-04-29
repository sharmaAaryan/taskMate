import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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