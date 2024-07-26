const Questions = require("../models/Questions");
const Options = require("../models/Options");
const Topics = require("../models/Topics");
const mongoose = require("mongoose");

const updateQuestionWithOptions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const questionId = req.params.id;
    const { question, image, options, type, language, topicId } = req.body;
    console.log(req.body);
    // Find the existing question
    const existingQuestion = await Questions.findById(questionId).session(
      session
    );
    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    const existingOptionsIds = existingQuestion.options.map((id) =>
      id.toString()
    );
    const updatedOptionsIds = options
      .map((option) => option._id)
      .filter((id) => id);

    const optionsToDelete = existingOptionsIds.filter(
      (id) => !updatedOptionsIds.includes(id)
    );
    const optionsToUpdate = options.filter((option) => option._id);
    const optionsToCreate = options.filter((option) => !option._id);

    // Delete removed options
    await Options.deleteMany({ _id: { $in: optionsToDelete } }).session(
      session
    );

    // Update existing options
    for (const optionData of optionsToUpdate) {
      await Options.findByIdAndUpdate(
        optionData._id,
        { text: optionData.text, isCorrect: optionData.isCorrect },
        { session }
      );
    }

    // Create new options
    const createdOptions = [];
    for (const optionData of optionsToCreate) {
      const option = new Options({
        text: optionData.text,
        isCorrect: optionData.isCorrect,
      });
      await option.save({ session });
      createdOptions.push(option);
    }

    const allOptions = [...optionsToUpdate, ...createdOptions];
    const correctOptionsIds = allOptions
      .filter((option) => option.isCorrect)
      .map((option) => option._id);

    if (type === "twoPoints" && correctOptionsIds.length !== 2) {
      throw new Error(
        "Two correct options are required for 'twoPoints' type questions"
      );
    } else if (type === "onePoint" && correctOptionsIds.length !== 1) {
      throw new Error(
        "One correct option is required for 'onePoint' type questions"
      );
    }

    const point = type === "twoPoints" ? 2 : 1;

    // Update the question
    existingQuestion.question = question;
    existingQuestion.image = image;
    existingQuestion.options = allOptions.map((option) => option._id);
    existingQuestion.point = point;
    existingQuestion.type = type;
    existingQuestion.correctOptions = correctOptionsIds;
    existingQuestion.language = language;

    await existingQuestion.save({ session });

    // Check and update topic's question references
    const topic = await Topics.findById(topicId).session(session);
    if (!topic) {
      throw new Error("Topic not found");
    }

    if (language === "ru") {
      topic.ru_questions = topic.ru_questions.filter(
        (id) => id.toString() !== questionId.toString()
      );
      topic.ru_questions.push(existingQuestion._id);
    } else if (language === "kz") {
      topic.kz_questions = topic.kz_questions.filter(
        (id) => id.toString() !== questionId.toString()
      );
      topic.kz_questions.push(existingQuestion._id);
    }
    await topic.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Question and options updated successfully",
      question: {
        _id: existingQuestion._id,
        question: existingQuestion.question,
        image: existingQuestion.image,
        options: allOptions.map((option) => ({
          _id: option._id,
          text: option.text,
        })),
        point: existingQuestion.point,
        type: existingQuestion.type,
        correctOptions: correctOptionsIds,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error updating question and options",
      error: error.message,
    });
  }
};

module.exports = { updateQuestionWithOptions };
