const Questions = require("../models/Questions");
const Options = require("../models/Options");
const Topics = require("../models/Topics");
const mongoose = require("mongoose");

exports.createQuestion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { question, image, options, point, status, type, answer, topicId } =
      req.body;

    const createdOptions = await Promise.all(
      options.map(async (optionData) => {
        const option = new Options({ ...optionData });
        await option.save({ session });
        return option._id;
      })
    );

    const newQuestion = new Questions({
      question,
      image,
      options: createdOptions,
      point,
      status,
      type,
      answer,
    });

    await newQuestion.save({ session });

    const topic = await Topics.findById(topicId);
    topic.questions.push(newQuestion._id);
    await topic.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Question and options added successfully",
      data: newQuestion,
      topic: topic,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(400)
      .json({ message: "Error adding question and options", error });
  }
};
