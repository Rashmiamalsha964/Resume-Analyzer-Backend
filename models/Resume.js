// models/Resume.js (Add the userId field)
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // <-- ADD THIS LINE
  filename: String,
  jobRole: String,
  score: Number,
  detectedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  rewrittenBullets: [String]
}, { timestamps: true });

export default mongoose.model("Resume", resumeSchema);