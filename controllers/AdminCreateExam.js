const mongoose = require("mongoose");
const Exams = require("../models/Exams");
const Subjects = require("../models/Subjects");

// Improved shuffle function
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getRandomElements = (arr, count) => {
  if (arr.length <= count) {
    return arr;
  }
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, count);
};

const adminCreatesExamWithAllSubjects = async (req, res) => {
  try {
    const { started_at, finished_at, examType } = req.body;

    // Retrieve all subjects with their associated topics and questions
    const allSubjects = await Subjects.find().populate({
      path: "topics",
      populate: {
        path: "ru_questions kz_questions",
        select: "_id point createdAt", // Select _id, point, and createdAt fields
      },
    });

    const subject1Id = new mongoose.Types.ObjectId("666c2efb75d5524604b5bc10");
    const subject2Id = new mongoose.Types.ObjectId("666c2f0175d5524604b5bc13");
    const subject3Id = new mongoose.Types.ObjectId("666c32035970933c47ccd12e");

    const subject1 = allSubjects.find((subject) =>
      subject._id.equals(subject1Id)
    );
    const subject2 = allSubjects.find((subject) =>
      subject._id.equals(subject2Id)
    );
    const subject3 = allSubjects.find((subject) =>
      subject._id.equals(subject3Id)
    );
    const optionalSubjects = allSubjects.filter(
      (subject) =>
        !subject._id.equals(subject1Id) &&
        !subject._id.equals(subject2Id) &&
        !subject._id.equals(subject3Id)
    );

    const getQuestionsByPoints = (subject, onePointCount, twoPointsCount) => {
      const ruOnePointQuestions = [];
      const ruTwoPointsQuestions = [];
      const kzOnePointQuestions = [];
      const kzTwoPointsQuestions = [];

      subject.topics.forEach((topic) => {
        const now = new Date();
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

        topic.ru_questions.forEach((question) => {
          if (examType === "last" && new Date(question.createdAt) < lastMonth)
            return;
          if (question.point === 1) {
            ruOnePointQuestions.push(question._id);
          } else if (question.point === 2) {
            ruTwoPointsQuestions.push(question._id);
          }
        });
        topic.kz_questions.forEach((question) => {
          if (examType === "last" && new Date(question.createdAt) < lastMonth)
            return;
          if (question.point === 1) {
            kzOnePointQuestions.push(question._id);
          } else if (question.point === 2) {
            kzTwoPointsQuestions.push(question._id);
          }
        });
      });

      return {
        ru_questions: {
          onePoint: getRandomElements(ruOnePointQuestions, onePointCount),
          twoPoints: getRandomElements(ruTwoPointsQuestions, twoPointsCount),
        },
        kz_questions: {
          onePoint: getRandomElements(kzOnePointQuestions, onePointCount),
          twoPoints: getRandomElements(kzTwoPointsQuestions, twoPointsCount),
        },
      };
    };

    const createSubjectWithQuestions = (
      subject,
      onePointCount,
      twoPointsCount
    ) => {
      const questions = getQuestionsByPoints(
        subject,
        onePointCount,
        twoPointsCount
      );

      let ruQuestionNumber = 1;
      let kzQuestionNumber = 1;

      return {
        _id: subject._id,
        ru_subject: subject.ru_subject,
        kz_subject: subject.kz_subject,
        topics: subject.topics.map((topic) => topic._id),
        ru_questions: [
          ...questions.ru_questions.onePoint.map((question) => ({
            _id: question,
            questionNumber: ruQuestionNumber++,
          })),
          ...questions.ru_questions.twoPoints.map((question) => ({
            _id: question,
            questionNumber: ruQuestionNumber++,
          })),
        ],
        kz_questions: [
          ...questions.kz_questions.onePoint.map((question) => ({
            _id: question,
            questionNumber: kzQuestionNumber++,
          })),
          ...questions.kz_questions.twoPoints.map((question) => ({
            _id: question,
            questionNumber: kzQuestionNumber++,
          })),
        ],
      };
    };

    const subjectsWithQuestions = [
      createSubjectWithQuestions(subject1, 10, 0),
      createSubjectWithQuestions(subject2, 10, 0),
      createSubjectWithQuestions(subject3, 20, 0),
      ...optionalSubjects.map((subject) =>
        createSubjectWithQuestions(subject, 30, 10)
      ),
    ];

    const filteredSubjectsWithQuestions = subjectsWithQuestions.filter(
      (subject) =>
        subject.ru_questions.length > 0 || subject.kz_questions.length > 0
    );

    if (filteredSubjectsWithQuestions.length === 0) {
      return res
        .status(400)
        .json({ message: "No subjects with questions found" });
    }

    const newExam = new Exams({
      subjects: filteredSubjectsWithQuestions,
      startedAt: new Date(started_at),
      finishedAt: new Date(finished_at),
      examType: examType,
    });

    await newExam.save();

    res.status(201).json({
      message: "Exam with all subjects created successfully",
      exam: newExam,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error creating exam with all subjects", error });
  }
};

module.exports = { adminCreatesExamWithAllSubjects };
