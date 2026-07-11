// import Progress from "../models/Progress.js";
// import Activity from "../models/Activity.js";

// export const getDashboard = async (req, res) => {
//   try {
//     const studentId = req.user.id;

//     const progress = await Progress.find({ student: studentId })
//       .populate("course")
//       .populate("completedLessons");

//     const activities = await Activity.find({ student: studentId })
//       .populate("course")
//       .populate("lesson")
//       .sort({ completedAt: -1 })
//       .limit(5);

//     let totalCompletedLessons = 0;
//     let totalTimeSpent = 0;

//     const courseProgress = progress.map((item) => {
//       totalCompletedLessons += item.completedLessons.length;
//       totalTimeSpent += item.totalTimeSpent;

//       return {
//         course: item.course.title,
//         progress: item.progressPercentage,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       dashboard: {
//         completedLessons: totalCompletedLessons,
//         totalTimeSpent,
//         courseProgress,
//         recentActivities: activities,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
//=====================

import mongoose from "mongoose";
import Progress from "../models/Progress.js";
import Activity from "../models/Activity.js";

export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // ==========================
    // Progress Data
    // ==========================
    const progressData = await Progress.find({
      student: studentId,
    }).populate("course", "title");

    // ==========================
    // Recent Activities
    // ==========================
    const recentActivities = await Activity.find({
      student: studentId,
    })
      .populate("lesson", "title")
      .populate("course", "title")
      .sort({ completedAt: -1 })
      .limit(5);

    // ==========================
    // Dashboard Cards
    // ==========================
    let completedLessons = 0;
    let totalTimeSpent = 0;
    let overallProgress = 0;

    const courseProgress = progressData.map((item) => {
      completedLessons += item.completedLessons.length;
      totalTimeSpent += item.totalTimeSpent;
      overallProgress += item.progressPercentage;

      return {
        course: item.course.title,
        progress: item.progressPercentage,
      };
    });

    if (progressData.length > 0) {
      overallProgress = overallProgress / progressData.length;
    }

    // ==========================
    // Pie Chart Data
    // ==========================
    const pieChartData = progressData.map((item) => ({
      course: item.course.title,
      progress: item.progressPercentage,
    }));

    // ==========================
    // Time Series (Line Chart)
    // ==========================
    const timeSeries = await Activity.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedAt",
            },
          },
          minutes: {
            $sum: "$timeSpent",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // ==========================
    // Response
    // ==========================
    res.status(200).json({
      success: true,
      dashboard: {
        completedLessons,
        totalTimeSpent,
        overallProgress,

        courseProgress,

        pieChartData,

        recentActivities: recentActivities.map((activity) => ({
          lesson: activity.lesson?.title,
          course: activity.course?.title,
          activityType: activity.activityType,
          timeSpent: activity.timeSpent,
          completedAt: activity.completedAt,
        })),

        timeSeries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
