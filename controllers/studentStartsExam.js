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

    // Retrieve the exam with selected subjects and their questions
    const exam = await Exams.findById(examId).populate({
      path: "subjects",
      match: {
        _id: {
          $in: selectedSubjectIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
      populate: {
        path: `${language}_questions`,
        populate: { path: "options" },
      },
    });

    if (!exam || !exam.subjects || exam.subjects.length === 0) {
      return res.status(404).json({ message: "Exam or subjects not found" });
    }

    let questionsBySubject = [];

    // Iterate over subjects and collect questions from the existing exam object
    exam.subjects.forEach((subject) => {
      if (selectedSubjectIds.includes(subject._id.toString())) {
        let localQuestionNumber = 1; // Reset question number for each subject
        const questions = (subject[language + "_questions"] || []).map(
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

        questionsBySubject.push({
          id: subject._id,
          subjectName: subject[language + "_subject"],
          questions: questions,
        });
      }
    });

    if (questionsBySubject.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the selected subjects." });
    }

    // Create a new result for the student
    const result = new Results({
      exam: examId,
      student: studentId,
      language: language, // Ensure language is set
      subjects: questionsBySubject.map((subject) => ({
        id: subject.id, // Corrected here
        name: subject.subjectName,
        results: [],
        totalPoints: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
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
    await exam.save();

    // Respond with the required format
    res.status(200).json({
      message: "Exam started successfully",
      exam: {
        _id: exam._id,
        status: "active", // Assuming the exam status is set to active when started
        startedAt: result.startedAt,
        finishedAt: exam.finishedAt, // Assuming there's a field indicating the exam finish time
        examType: exam.examType, // Assuming there's an examType field
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
