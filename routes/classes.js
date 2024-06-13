const router = require("express").Router();
const _ = require("lodash");

const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const clases = new ApiOptimizer(Classes);
const modelName = "Classes";

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the class
 *         studentsCount:
 *           type: number
 *           description: The number of students in the class
 *         literal:
 *           type: string
 *           description: The literal representation of the class
 *         className:
 *           type: string
 *           description: The name of the class
 *         students:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of the students in the class
 *
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     tags: [Classes]
 *     summary: Get all classes
 *     responses:
 *       200:
 *         description: A list of all classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 * /classes/add:
 *   post:
 *     tags: [Classes]
 *     summary: Add a new class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentsCount:
 *                 type: number
 *                 description: The number of students in the class
 *               literal:
 *                 type: string
 *                 description: The literal representation of the class
 *               className:
 *                 type: string
 *                 description: The name of the class
 *     responses:
 *       201:
 *         description: Class added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *
 * /classes/{id}:
 *   get:
 *     tags: [Classes]
 *     summary: Get a class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The class
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 *   put:
 *     tags: [Classes]
 *     summary: Update a class by ID
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
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad request
 *   delete:
 *     tags: [Classes]
 *     summary: Delete a class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       404:
 *         description: Class not found
 */

router.route("/").get(async (req, res) => {
  try {
    await clases.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const classs = Classes.findById(req.params.id);
    if (!classs) {
      res.status(400).json({ message: "Class not found" });
    }
    await clases.getById(req, res, modelName);
    res.status(200).json({ clases });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/add").post(async (req, res) => {
  try {
    const { studentsCount, literal, className } = req.body;
    const entity = { studentsCount, literal, className };
    await clases.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { literal, classNum } = req.body;
    
    const fieldsToUpdate = { literal, class: classNum };
    await clases.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const classToDelete = await Classes.findById(req.params.id);
    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found" });
    }

    await classToDelete.deleteOne();

    res
      .status(200)
      .json({ message: "Class and related data deleted successfully" });
  } catch (err) {
    errorHandler(err, req, res); // Использование middleware для обработки ошибок
  }
});

module.exports = router;
