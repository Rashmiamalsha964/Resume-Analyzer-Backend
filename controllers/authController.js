// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper function to generate a JWT Token
const generateToken = (id) => {
  // Make sure you add JWT_SECRET=your_secret_key to your .env file!
  return jwt.sign({ id }, process.env.JWT_SECRET || "super_secret_key", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 2. Create the user in the database
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || "user", // Default to user if not provided
    });

    // 3. Send back the token and user data
    if (user) {
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};