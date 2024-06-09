const mongoose = require("mongoose");
const Topic = require("../models/Topics");

async function getTopicsWithQuestionCount() {
  return Topic.aggregate([
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
      $addFields: {
        debug: {
          kz_title: "$kz_title",
          ru_title: "$ru_title",
        },
      },
    },
    {
      $project: {
        title: 1,
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

module.exports = { getTopicsWithQuestionCount };
