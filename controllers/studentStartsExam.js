const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Exams = require("../models/Exams");
const Results = require("../models/Results");

const studentStartsExam = async (req, res) => {
  const { examId, selectedSubjectIds, studentId, language } = req.body;

  try {
    const existingResult = await Results.findOne({
      exam: examId,
      student: studentId,
    });

    if (existingResult) {
      return res.status(200).json({
        message: "You have already started this exam.",
      });
    }

    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      match: { _id: { $in: selectedSubjectIds.map((id) => new ObjectId(id)) } },
      populate: {
        path: "topics",
        populate: {
          path: language === "ru" ? "ru_questions" : "kz_questions",
          populate: { path: "options", select: "text" },
        },
      },
    });

    if (!exam || !exam.subjects || exam.subjects.length === 0) {
      return res.status(404).json({ message: "Exam or subjects not found" });
    }

    let questionsBySubject = [];
    let globalQuestionNumber = 1;

    exam.subjects.forEach((subject) => {
      if (
        selectedSubjectIds.includes(subject._id.toString()) &&
        subject.topics
      ) {
        const questions = subject.topics.flatMap((topic) =>
          topic[language + "_questions"]
            ? topic[language + "_questions"].map((question) => ({
                _id: question._id,
                questionNumber: globalQuestionNumber++,
                question: question.question,
                image: question.image,
                options: question.options.map((option) => ({
                  _id: option._id,
                  text: option.text,
                })),
                point: question.point,
                type: question.type,
              }))
            : []
        );

        questionsBySubject.push({
          id: subject._id,
          subjectName: subject[language + "_subject"],
          questions: questions,
        });
      }
    });

    const result = new Results({
      exam: examId,
      student: studentId,
      subjects: questionsBySubject.map((subject) => ({
        name: subject.subjectName,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        percent: "0%",
      })),
      overallScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      overallPercent: "0%",
    });

    await result.save();

    exam.results.push(result._id);
    await exam.save();

    res.status(200).json({ questionsBySubject, resultId: result._id });
    console.log(questionsBySubject);
  } catch (error) {
    console.error("Error starting exam:", error);
    res
      .status(400)
      .json({ message: "Error starting exam", error: error.message });
  }
};

module.exports = { studentStartsExam };
