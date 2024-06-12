const router = require("express").Router();
const _ = require("lodash");

const Teachers = require("../models/Teachers");
const Users = require("../models/Users");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const Subjects = require("../models/Subjects");

const teacher = new ApiOptimizer(Teachers);
const user = new ApiOptimizer(Users);
const classes = new ApiOptimizer(Classes);
const subject = new ApiOptimizer(Subjects);
const modelName = "Teacher";

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user associated with the teacher
 *         class:
 *           type: string
 *           description: The ID of the class associated with the teacher
 *         subject:
 *           type: string
 *           description: The ID of the subject associated with the teacher
 *
 *     Class:
 *       type: object
 *       properties:
 *         class:
 *           type: string
 *           description: The class name
 *         literal:
 *           type: string
 *           description: The literal representation of the class
 *         students:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of student IDs associated with the class
 *         teacher:
 *           type: string
 *           description: The ID of the teacher associated with the class
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: Get all teachers
 *     responses:
 *       200:
 *         description: A list of all teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *
 *   post:
 *     tags: [Teachers]
 *     summary: Create a new teacher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Get a teacher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The teacher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *
 *   put:
 *     tags: [Teachers]
 *     summary: Update a teacher by ID
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
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *
 *   delete:
 *     tags: [Teachers]
 *     summary: Delete a teacher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *
 * /teachers/class/{classId}:
 *   get:
 *     tags: [Teachers]
 *     summary: Get students of a class by class ID
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of students in the class
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the student
 *                   name:
 *                     type: string
 *                     description: The name of the student
 *                   surname:
 *                     type: string
 *                     description: The surname of the student
 *                   email:
 *                     type: string
 *                     description: The email of the student
 *                   inn:
 *                     type: string
 *                     description: The INN of the student
 */

router.route("/").get(async (req, res) => {
  try {
    await teacher.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const teacher = await Teachers.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await teacher.deleteOne();

    res
      .status(200)
      .json({ message: "Teacher and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await teacher.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const {
      name,
      surname,
      classId,
      subjectId,
      className,
      kz_subject,
      ru_subject,
      email,
    } = req.body;

    // Обновление данных пользователя (name, surname)
    await user.updateById({
      classId,
      fieldsToUpdate: { name, surname, email },
      req,
      res,
    });
    await classes.updateById({
      entityId,
      fieldsToUpdate: { class: className },
      req,
      res,
    });
    await subject.updateById({
      subjectId,
      fieldsToUpdate: { kz_subject, ru_subject },
      req,
      res,
    });

    res.status(200).json({ message: "Teacher updated successfully" });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.get("/class/:classId", async (req, res) => {
  try {
    const classId = req.params.classId;

    const classWithStudents = await Classes.findById(classId).populate({
      path: "students",
      populate: {
        path: "user",
        model: "Users",
      },
    });

    if (!classWithStudents) {
      return res.status(404).send("Class not found.");
    }

    const students = classWithStudents.students.map((student) => {
      return {
        id: student._id,
        name: student.user.name,
        surname: student.user.surname,
        email: student.user.email,
        inn: student.inn,
      };
    });

    res.status(200).json(students);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
