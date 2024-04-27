const Questions = require("../models/Questions");
const Options = require("../models/Options");
const Topics = require("../models/Topics");
const mongoose = require("mongoose");

const createQuestionWithOptions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { question, image, options, type, topicId } = req.body;

    const createdOptions = [];
    let correctOptionsIds = [];
    let ball = 0;
    for (const optionData of options) {
      const option = new Options({
        text: optionData.text,
        isCorrect: optionData.isCorrect,
      });
      await option.save({ session });
      createdOptions.push(option);
      if (option.isCorrect) correctOptionsIds.push(option._id);
    }

    if (type === "twoPoints" && correctOptionsIds.length !== 2) {
      throw new Error(
        "Two correct options are required for 'twoPoints' type questions"
      );
    } else if (type === "onePoint" && correctOptionsIds.length !== 1) {
      throw new Error(
        "One correct option is required for 'onePoint' type questions"
      );
    }

    if (type === "twoPoints" && correctOptionsIds.length == 2) {
      ball = 2;
    } else if (type === "onePoint" && correctOptionsIds.length == 1) {
      ball = 1;
    }

    const newQuestion = new Questions({
      question,
      image,
      options: createdOptions.map((option) => option._id),
      point: ball,
      type,
      correctOptions: correctOptionsIds,
    });

    await newQuestion.save({ session });

    const topic = await Topics.findById(topicId);
    topic.questions.push(newQuestion._id);
    await topic.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Question and options added successfully",
      question: {
        _id: newQuestion._id,
        question: newQuestion.question,
        image: newQuestion.image,
        options: createdOptions.map((option) => ({
          _id: option._id,
          text: option.text,
        })),
        point: newQuestion.point,
        type: newQuestion.type,
        correctOptions: correctOptionsIds,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(400)
      .json({ message: "Error adding question and options", error });
  }
};

module.exports = { createQuestionWithOptions };
