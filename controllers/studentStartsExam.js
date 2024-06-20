const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Results = require("../models/Results");

const studentStartsExam = async (req, res) => {
  const { examId, selectedSubjectIds, studentId, language } = req.body;

  try {
    // Check if the student has already started this exam
    const existingResult = await Results.findOne({
      exam: examId,
      student: studentId,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "You have already started this exam.",
      });
    }

    // Retrieve the exam with selected subjects and their questions in a single query
    const exam = await Exams.findById(examId)
      .populate({
        path: "subjects",
        match: { _id: { $in: selectedSubjectIds } },
        populate: {
          path: `${language}_questions`,
          populate: { path: "options" },
        },
      })
      .lean(); // Use lean() to get plain JavaScript objects and improve performance

    if (!exam || !exam.subjects || exam.subjects.length === 0) {
      return res.status(404).json({ message: "Exam or subjects not found" });
    }

    const questionsBySubject = exam.subjects
      .map((subject) => {
        if (!selectedSubjectIds.includes(subject._id.toString())) return null;

        let localQuestionNumber = 1;
        const questions = (subject[`${language}_questions`] || []).map(
          (question) => ({
            _id: question._id,
            questionNumber: localQuestionNumber++,
            question: question.question,
            image: question.image,
            options: (question.options || []).map((option) => ({
              _id: option._id,
              text: option.text,
            })),
            point: question.point,
            type: question.type,
          })
        );

        return {
          id: subject._id,
          subjectName: subject[`${language}_subject`],
          questions,
        };
      })
      .filter((subject) => subject !== null);

    if (questionsBySubject.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the selected subjects." });
    }

    // Create a new result for the student
    const result = new Results({
      exam: examId,
      student: studentId,
      language,
      subjects: questionsBySubject.map((subject) => ({
        id: subject.id,
        name: subject.subjectName,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        missedPoints: 0,
        percent: "0%",
      })),
      overallScore: 0,
      totalCorrect: 0,
      missedPoints: 0,
      totalIncorrect: 0,
      overallPercent: "0%",
      startedAt: new Date(),
    });

    await result.save();

    // Add the result to the exam's results
    exam.results.push(result._id);
    await Exams.findByIdAndUpdate(examId, { $push: { results: result._id } });

    // Respond with the required format
    res.status(200).json({
      message: "Exam started successfully",
      exam: {
        _id: exam._id,
        status: "active",
        startedAt: result.startedAt,
        finishedAt: exam.finishedAt,
        examType: exam.examType,
        subjects: questionsBySubject,
      },
      resultId: result._id,
      startedAt: result.startedAt,
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    res
      .status(400)
      .json({ message: "Error starting exam", error: error.message });
  }
};

module.exports = { studentStartsExam };
