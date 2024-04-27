const cron = require("node-cron");
const Exams = require("../models/Exams");

const checkExamStatus = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        console.log("cron is working");
        const now = new Date();
        const result = await Exams.updateMany(
          { finishedAt: { $lt: now }, status: "active" },
          { status: "inactive" }
        );
        if (result.nModified) {
          console.log(`${result.nModified} exams were set to inactive`);
        }
      } catch (error) {
        console.error("Error in cron job:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Almaty",
    }
  );
};

module.exports = { checkExamStatus };
