const router = require("express").Router();
const _ = require("lodash");

const Questions = require("../models/Questions");
const Options = require("../models/Options");
const Topics = require("../models/Topics");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { createQuestionWithOptions } = require("../controllers/createQuestion");
const {
  updateQuestionWithOptions,
} = require("../controllers/updateQuestionWithOptions");
const { uploadFileToDrive } = require("../controllers/googleDriveService");
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const questions = new ApiOptimizer(Questions);
const modelName = "Questions";
const upload = multer();

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       required:
 *         - text
 *         - isCorrect
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the option.
 *         text:
 *           type: string
 *           description: The text of the option.
 *         isCorrect:
 *           type: boolean
 *           description: Indicates if the option is the correct answer.
 *
 *     Question:
 *       type: object
 *       required:
 *         - question
 *         - options
 *         - point
 *         - type
 *         - language
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the question.
 *         question:
 *           type: string
 *           description: The text of the question.
 *         image:
 *           type: string
 *           description: URL of an image associated with the question, if any.
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *           description: A list of options for the question.
 *         point:
 *           type: number
 *           description: The number of points the question is worth.
 *         type:
 *           type: string
 *           enum: [twoPoints, onePoint]
 *           description: The type of question based on the scoring system.
 *         correctOptions:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of IDs referencing the correct options.
 *         language:
 *           type: string
 *           enum: [kz, ru]
 *           description: The language of the question.
 *
 * /questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *
 * /question/add:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Add a new question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request, invalid input
 *
 * /questions/{id}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get a specific question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *
 *   put:
 *     tags:
 *       - Questions
 *     summary: Update a specific question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request, invalid input
 *
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete a specific question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */

router.post(
  "/createQuestionWithImage",
  upload.single("image"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        question,
        options: optionsString,
        type,
        topicId,
        language,
      } = req.body;
      let imageUrl = null;
      let options = [];

      try {
        options = JSON.parse(optionsString);
      } catch (e) {
        throw new Error("Options must be a valid JSON string");
      }

      if (!Array.isArray(options)) {
        throw new Error("Options must be an array");
      }

      // Загрузка изображения на Google Drive
      if (req.file) {
        const file = req.file;
        const result = await uploadFileToDrive(file);
        imageUrl = result.webViewLink; // Ссылка на изображение
        console.log("Image uploaded to Google Drive: ", imageUrl);
      }

      console.log(options);
      console.log(typeof options);
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
        if (option.isCorrect) await correctOptionsIds.push(option._id);
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

      // Создание вопроса
      const newQuestion = new Questions({
        question,
        image: imageUrl,
        options: createdOptions.map((option) => option._id),
        point: ball,
        type,
        correctOptions: correctOptionsIds,
        language,
      });

      await newQuestion.save({ session });
      console.log("Question saved: ", newQuestion);

      const topic = await Topics.findById(topicId);
      if (!topic) {
        throw new Error(`Topic with ID ${topicId} not found`);
      }
      if (language === "ru") {
        topic.ru_questions.push(newQuestion._id);
      } else if (language === "kz") {
        topic.kz_questions.push(newQuestion._id);
      }
      await topic.save({ session });
      console.log("Topic updated: ", topic);

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
      console.error("Error during transaction: ", error);
      res
        .status(400)
        .json({ message: "Error adding question and options", error });
    }
  }
);

router.route("/").get(async (req, res) => {
  try {
    await questions.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", createQuestionWithOptions);
router.put("/:id", updateQuestionWithOptions);

router.route("/:id").delete(async (req, res) => {
  try {
    const question = await Questions.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();

    res
      .status(200)
      .json({ message: "Question and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await questions.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
