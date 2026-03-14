// controllers/resumeController.js
import pdf from "pdf-extraction";
import Groq from "groq-sdk";
import Resume from "../models/Resume.js";

export const uploadResumes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const jobRole = req.body.jobRole || "Software Engineer"; 

    // Initialize Groq inside the function
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing from .env file!");
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const results = await Promise.all(
      req.files.map(async (file) => {
        const data = await pdf(file.buffer);
        const rawText = data.text || "";

        if (rawText.trim() === "") {
          return {
            filename: file.originalname,
            score: 0,
            detectedSkills: [],
            missingSkills: [],
            suggestions: ["Error: Could not read text from this PDF."],
          };
        }

        const prompt = `
          You are a strict, highly experienced Tech Recruiter and Applicant Tracking System (ATS).
          You are analyzing the following Resume against the Target Job Role.
          Be highly critical. Do not give a high score unless they are a near-perfect match.
          
          Target Job Role: ${jobRole}
          Resume Text: ${rawText}
          
          Return ONLY a raw JSON object. Use this exact structure:
          {
            "score": (a strict number between 0 and 100 representing their true match),
            "detectedSkills": [(array of strings: skills the candidate ACTUALLY has)],
            "missingSkills": [(array of strings: critical skills the job needs but candidate lacks)],
            "suggestions": [(array of 3 harsh but actionable tips to improve the formatting or content)],
            "rewrittenBullets": [(array of 2 highly professional, ATS-optimized bullet points using the XYZ formula that they can use to replace weak points in their resume)]
          }
        `;

        try {
          // Send the prompt to Groq (using Meta's Llama model)
          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Powerful, fast, and free tier friendly
            response_format: { type: "json_object" }, // This forces perfect JSON!
          });

          const aiText = chatCompletion.choices[0].message.content;
          const analysisData = JSON.parse(aiText);

          const newResume = new Resume({
            userId: req.user.id,
            filename: file.originalname,
            jobRole: jobRole,
            score: analysisData.score || 0,
            detectedSkills: analysisData.detectedSkills || [],
            missingSkills: analysisData.missingSkills || [],
            suggestions: analysisData.suggestions || [],
            rewrittenBullets: analysisData.rewrittenBullets || []
          });
          await newResume.save();

          return {
            filename: file.originalname,
            ...analysisData
          };

        } catch (aiError) {
          console.error(">>> Groq AI Error for file:", file.originalname, aiError);
          return {
            filename: file.originalname,
            score: 0,
            detectedSkills: [],
            missingSkills: [],
            suggestions: ["AI analysis failed for this document."],
          };
        }
      })
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Batch Resume Analysis Error:", error);
    res.status(500).json({ message: "Resume analysis failed" });
  }
};