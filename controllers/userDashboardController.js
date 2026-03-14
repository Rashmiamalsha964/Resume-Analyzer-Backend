// controllers/userDashboardController.js
import Resume from "../models/Resume.js";
import User from "../models/User.js";

export const getUserDashboardData = async (req, res) => {
 
  try {
    // 1. Find the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Find the MOST RECENT resume uploaded by this specific user
    const latestResume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    // 3. Send the exact JSON structure React is waiting for
    res.json({
      success: true,
      data: {
        user: {
          name: user.fullName,
          email: user.email,
          joinedDate: new Date(user.createdAt).toLocaleDateString(),
        },
        hasResume: !!latestResume, // true if they have a resume, false if null
        filename: latestResume ? latestResume.filename : "No resume uploaded yet",
        score: latestResume ? latestResume.score : 0,
        topSkills: latestResume ? latestResume.detectedSkills : [],
        suggestions: latestResume ? latestResume.suggestions : []
      }
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};