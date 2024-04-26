const Questions = require("../models/Questions");
const Options = require("../models/Options");
const Topics = require("../models/Topics");
const mongoose = require("mongoose");

const createQuestionWithOptions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { question, image, options, point, type, topicId } = req.body;

    const createdOptions = [];
    let correctOptionId = null;
    for (const optionData of options) {
      const option = new Options({
        text: optionData.text,
        isCorrect: optionData.isCorrect,
      });
      await option.save({ session });
      createdOptions.push(option);
      if (option.isCorrect) correctOptionId = option._id;
    }

    if (!correctOptionId) {
      throw new Error("No correct option provided");
    }

    const newQuestion = new Questions({
      question,
      image,
      options: createdOptions.map((option) => option._id),
      point,
      type,
      correctOption: correctOptionId,
    });

    await newQuestion.save({ session });

    const topic = await Topics.findById(topicId);
    topic.questions.push(newQuestion._id);
    await topic.save({ session });

    await session.commitTransaction();
    session.endSession();

    const responseOptions = createdOptions.map(({ _id, text }) => ({
      _id,
      text,
    }));
    res.status(201).json({
      message: "Question and options added successfully",
      question: {
        _id: newQuestion._id,
        question: newQuestion.question,
        image: newQuestion.image,
        options: responseOptions,
        point: newQuestion.point,
        type: newQuestion.type,
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
