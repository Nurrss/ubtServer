const Results = require("../models/Results");
const Exams = require("../models/Exams");
const Questions = require("../models/Questions");

exports.assignExamToStudent = async (req, res) => {
  try {
    const { examId, studentId } = req.body;

    const newResult = new Results({
      exam: examId,
      student: studentId,
      score: 0,
    });

    await newResult.save();
    res
      .status(201)
      .json({ message: "Exam assigned to student successfully", newResult });
  } catch (error) {
    res.status(400).json({ message: "Error assigning exam to student", error });
  }
};

exports.addTopicsToExam = async (req, res) => {
  try {
    const { examId, topicIds } = req.body;
    const exam = await Exams.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Add topics to the exam
    topicIds.forEach((topicId) => {
      if (!exam.topics.includes(topicId)) {
        exam.topics.push(topicId);
      }
    });

    await exam.save();
    res
      .status(200)
      .json({ message: "Topics added to exam successfully", exam });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error adding topics to exam", error });
  }
};

exports.selectExamTopicsAndGetQuestions = async (req, res) => {
  try {
    const { mandatoryTopicsIds, optionalTopicsIds } = req.body; // получаем ID тем
    const questionsToReturn = [];

    // Добавляем все вопросы обязательных тем
    for (const topicId of mandatoryTopicsIds) {
      const questions = await Questions.find({ topic: topicId }).select(
        "-answer"
      );
      questionsToReturn.push(...questions);
    }

    // Добавляем случайные вопросы из выбранных необязательных тем
    for (const topicId of optionalTopicsIds) {
      const questions = await Questions.find({ topic: topicId }).select(
        "-answer"
      );
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      questionsToReturn.push(randomQuestion);
    }

    // Ответ сервера
    res.status(200).json({ data: questionsToReturn });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.submitAndCheckAnswers = async (req, res) => {
  try {
    const { resultsId, answers } = req.body; // answers should be an array of {questionId, optionId}

    const result = await Results.findById(resultsId);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    let score = 0;
    let questionResults = [];

    for (let answer of answers) {
      const question = await Questions.findById(answer.questionId).populate(
        "options"
      );
      const isCorrect = question.options.some(
        (option) =>
          option.isCorrect && String(option._id) === String(answer.optionId)
      );

      if (isCorrect) {
        score += question.point;
      }

      questionResults.push({
        questionId: answer.questionId,
        isCorrect: isCorrect,
      });
    }

    result.score = score;
    result.questionsAnswered = questionResults; // Assuming you have a field to store these in your schema
    await result.save();

    res
      .status(200)
      .json({ message: "Exam submitted and checked successfully", result });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error submitting and checking exam", error });
  }
};

exports.getResultByStudentId = async (req, res) => {
  const studentId = req.params.studentId;
  try {
    const results = await Results.find({ student: studentId }).populate("exam");
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this student." });
    }
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
