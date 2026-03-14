// controllers/dashboardController.js
import Resume from "../models/Resume.js";

export const getDashboardData = async (req, res) => {
  try {
    // Fetch all resumes sorted by newest first
    const resumes = await Resume.find().sort({ createdAt: -1 });

    // 1. Total Resumes
    const totalResumes = resumes.length;

    // 2. Average Score
    const totalScore = resumes.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = totalResumes > 0 ? Math.round(totalScore / totalResumes) : 0;

    // 3. Tally Skills & Suggestions
    const skillCounts = {};
    let pendingSuggestions = 0;

    resumes.forEach(resume => {
      // Count every skill found
      resume.detectedSkills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
      // Count total suggestions given
      pendingSuggestions += resume.suggestions.length;
    });

    // 4. Sort skills to find the Top Skill and populate Pie Chart
    const sortedSkills = Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topSkill = sortedSkills.length > 0 ? sortedSkills[0].name : "None";
    
    // Grab top 4 skills, lump the rest into "Other" for the Pie Chart
    let pieChartData = sortedSkills.slice(0, 4);
    if (sortedSkills.length > 4) {
      const otherValue = sortedSkills.slice(4).reduce((acc, curr) => acc + curr.value, 0);
      pieChartData.push({ name: "Other", value: otherValue });
    }

    // 5. Score Trends (Bar Chart) - Group by Month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const scoresByMonth = {};

    resumes.forEach(resume => {
      const month = monthNames[new Date(resume.createdAt).getMonth()];
      if (!scoresByMonth[month]) scoresByMonth[month] = [];
      scoresByMonth[month].push(resume.score);
    });

    // Format for Recharts
    const scoreData = Object.keys(scoresByMonth).map(month => ({
      month,
      score: Math.round(scoresByMonth[month].reduce((a, b) => a + b, 0) / scoresByMonth[month].length)
    }));

    // 6. Recent Resumes (DataGrid Table)
    const recentResumes = resumes.slice(0, 10).map((resume) => ({
      id: resume._id,
      name: resume.filename,
      date: new Date(resume.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score: resume.score
    }));

    // Send everything to the frontend!
    res.json({
      success: true,
      data: {
        totalResumes,
        averageScore,
        topSkill,
        pendingSuggestions,
        skillsData: pieChartData.length > 0 ? pieChartData : [{ name: "No Data", value: 1 }],
        scoreData,
        recentResumes
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};