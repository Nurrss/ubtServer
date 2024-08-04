const Subjects = require("../models/Subjects");
const mongoose = require("mongoose");
const Topic = require("../models/Topics");

async function getTopicsWithQuestionCount(topicIds) {
  return Topic.aggregate([
    {
      $match: {
        _id: { $in: topicIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "ru_questions",
        foreignField: "_id",
        as: "ruQuestionsInfo",
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "kz_questions",
        foreignField: "_id",
        as: "kzQuestionsInfo",
      },
    },
    {
      $lookup: {
        from: "options",
        localField: "ruQuestionsInfo.options",
        foreignField: "_id",
        as: "ruQuestionsOptions",
      },
    },
    {
      $lookup: {
        from: "options",
        localField: "kzQuestionsInfo.options",
        foreignField: "_id",
        as: "kzQuestionsOptions",
      },
    },
    {
      $project: {
        kz_title: 1,
        ru_title: 1,
        ruQuestionsInfo: 1,
        kzQuestionsInfo: 1,
        ru_twoPointsQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$ruQuestionsInfo",
                as: "question",
                cond: { $eq: ["$$question.type", "twoPoints"] },
              },
            },
            as: "question",
            in: "$$question._id",
          },
        },
        ru_onePointQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$ruQuestionsInfo",
                as: "question",
                cond: { $eq: ["$$question.type", "onePoint"] },
              },
            },
            as: "question",
            in: "$$question._id",
          },
        },
        kz_twoPointsQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$kzQuestionsInfo",
                as: "question",
                cond: { $eq: ["$$question.type", "twoPoints"] },
              },
            },
            as: "question",
            in: "$$question._id",
          },
        },
        kz_onePointQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$kzQuestionsInfo",
                as: "question",
                cond: { $eq: ["$$question.type", "onePoint"] },
              },
            },
            as: "question",
            in: "$$question._id",
          },
        },
      },
    },
  ]);
}

async function getSubjectById(req, res) {
  try {
    const subject = await Subjects.findById(req.params.id).populate({
      path: "topics",
      select: "_id kz_title ru_title",
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
