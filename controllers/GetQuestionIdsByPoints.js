const Topic = require("../models/Topics");

async function getTopicsWithQuestionCount() {
  return Topic.aggregate([
    {
      $lookup: {
        from: "questions", // The collection to join
        localField: "questions", // Field from the input documents
        foreignField: "_id", // Field from the documents of the "from" collection
        as: "questionsInfo", // Output array field
      },
    },
    {
      $project: {
        title: 1,
        questionsInfo: {
          $filter: {
            input: "$questionsInfo",
            as: "question",
            cond: { $in: ["$$question.type", ["twoPoints", "onePoint"]] }, // Filters to only include necessary types
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        twoPointsQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$questionsInfo",
                as: "question",
                cond: { $eq: ["$$question.type", "twoPoints"] },
              },
            },
            as: "question",
            in: "$$question._id",
          },
        },
        onePointQuestionIds: {
          $map: {
            input: {
              $filter: {
                input: "$questionsInfo",
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

module.exports = { getTopicsWithQuestionCount };
