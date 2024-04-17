const router = require("express").Router();
const _ = require("lodash");

const Admins = require("../models/Admins");
const Users = require("../models/Users");
const Students = require("../models/Students");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Returns a list of all admins
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: A list of admins.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 */
router.route("/").get(async (req, res) => {
  try {
    await admin.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     summary: Deletes a single admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 */
router.route("/:id").delete(async (req, res) => {
  try {
    await admin.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Gets a single admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An admin object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 */
router.route("/:id").get(async (req, res) => {
  try {
    await admin.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Updates an admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 */
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { email, password } = req.body;
    const fieldsToUpdate = { email, password };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/studentAdd", async (req, res) => {
  try {
    const { name, surname, inn, email, literal, classNum } = req.body;

    // Step 1: Create a new user
    const newUser = new Users({
      name,
      surname,
      email,
      password: inn, // Make sure to hash the password before saving
      role: "student",
    });

    const savedUser = await newUser.save();

    let classForStudent;

    // Step 2: Find the existing class by classNum and literal
    let existingClass = await Classes.findOne({
      class: classNum,
      literal: literal,
    });

    if (!existingClass) {
      // If no existing class, create a new one
      const newClass = new Classes({
        class: classNum,
        literal,
        students: [], // Initialize the students array
      });
      existingClass = await newClass.save();
    }

    classForStudent = existingClass;

    // Step 3: Create a new student and link it to the user and the class
    const newStudent = new Students({
      user: savedUser._id,
      class: classForStudent._id,
      inn,
    });

    const savedStudent = await newStudent.save();

    // Step 4: Add the student to the class' students array
    classForStudent.students.push(savedStudent._id);
    await classForStudent.save();

    res.status(201).send(savedStudent);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
