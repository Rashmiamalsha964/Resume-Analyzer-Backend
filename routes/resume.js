// routes/resumeRoutes.js
import express from "express";
import multer from "multer";
import { uploadResumes } from "../controllers/resumeController.js";
import { getDashboardData } from "../controllers/dashboardController.js";
import { getUserDashboardData } from "../controllers/userDashboardController.js";
import { protect } from "../middleware/authMiddleware.js"; // <-- 1. IMPORT THIS

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/dashboard", getDashboardData);
router.get("/my-dashboard",protect, getUserDashboardData);

// POST /api/resume/upload-multiple
router.post("/upload-multiple", protect, upload.array("resumes", 10), uploadResumes);
// "resumes" = field name in form, max 10 files per request

export default router;