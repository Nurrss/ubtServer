const Subjects = require("../models/Subjects");
const {
  getTopicsWithQuestionCount,
} = require("../controllers/GetQuestionIdsByPoints");

async function getSubjectById(req, res) {
  try {
    const subject = await Subjects.findById(req.params.id).populate({
      path: "topics",
      select: "_id",
    });

    if (!subject) {
      return res.status(404).send({ message: "Subject not found" });
    }

    const topicsWithCounts = await getTopicsWithQuestionCount(
      subject.topics.map((topic) => topic._id)
    );

    res.json({
      ...subject.toObject(),
      topics: topicsWithCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
}

module.exports = { getSubjectById };
