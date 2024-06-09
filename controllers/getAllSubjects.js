const Subjects = require("../models/Subjects");

async function getAllSubjects(req, res) {
  try {
    const subjects = await Subjects.find().populate({
      path: "topics",
      select: "ru_title kz_title",
    });

    if (!subjects.length) {
      return res.status(200).send([]);
    }

    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
}

module.exports = { getAllSubjects };
