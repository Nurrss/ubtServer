const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { hashConstance, ROLES } = require("../enums");
const Users = require("../models/Users");
const Students = require("../models/Students");
const Classes = require("../models/Classes");
const errorHandler = require("../middleware/errorHandler");

/**
@swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the admin
 *         user:
 *           type: string
 *           description: The ID of the associated user
 *
 * /adminStudent/:
 *   get:
 *     tags: [Admin]
 *     summary: Get all students
 *     responses:
 *       200:
 *         description: A list of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 * /adminStudent/add:
 *   post:
 *     tags: [Admin]
 *     summary: Add a new student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the student
 *               surname:
 *                 type: string
 *                 description: The surname of the student
 *               inn:
 *                 type: string
 *                 description: The identification number of the student
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the student
 *               literal:
 *                 type: string
 *                 description: The literal representation of the class
 *               classNum:
 *                 type: string
 *                 description: The class number
 *     responses:
 *       201:
 *         description: Student added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 * /adminStudent/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a student by ID
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */

router.post("/add", async (req, res) => {
  try {
    const { name, surname, inn, email, literal, classNum } = req.body;

    const validateEmail = async (email) => {
      let user = await Users.findOne({ email });
      return user ? false : true;
    };

    let emailNotRegistered = await validateEmail(email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(inn, hashConstance);

    const newUser = new Users({
      name,
      surname,
      email,
      password: hashedPassword,
      role: "student",
      inn: inn,
    });

    const savedUser = await newUser.save();

    let classForStudent;

    let existingClass = await Classes.findOne({
      class: classNum,
      literal: literal,
    });

    if (!existingClass) {
      const newClass = new Classes({
        class: classNum,
        literal,
        students: [],
      });
      existingClass = await newClass.save();
    }

    classForStudent = existingClass;

    const newStudent = new Students({
      user: savedUser._id,
      class: classForStudent._id,
      inn,
    });

    const savedStudent = await newStudent.save();

    classForStudent.students.push(savedStudent._id);
    await classForStudent.save();

    res.status(201).send(savedStudent);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, surname, inn, email, literal, classNum } = req.body;
    const studentId = req.params.id;

    const student = await Students.findById(studentId).populate("user");

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    const updatedUser = await Users.findByIdAndUpdate(
      student.user._id,
      { name, surname, email, password: inn },
      { new: true }
    );

    let classForStudent;
    if (classNum && literal) {
      classForStudent = await Classes.findOneAndUpdate(
        { class: classNum, literal: literal },
        {},
        { new: true, upsert: true }
      );
    }

    if (classForStudent) {
      student.class = classForStudent._id;
      await student.save();
    }

    res.status(200).json({ student: student, user: updatedUser });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Students.findById(studentId)
      .populate("user")
      .populate("class");

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    res.status(200).json(student);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/").get(async (req, res) => {
  try {
    const students = await Students.find().populate("user").populate("class");

    if (!students.length) {
      return res.status(200).send([]);
    }

    const studentsList = students.map((student) => ({
      id: student._id,
      name: student.user ? student.user.name : null,
      surname: student.user ? student.user.surname : null,
      group: student.class
        ? `${student.class.class}${student.class.literal}`
        : null,
      inn: student.inn,
      email: student.user ? student.user.email : null,
    }));

    console.log(studentsList);
    res.status(200).json(studentsList);
  } catch (err) {
    console.error("Error retrieving students:", err);
    res
      .status(500)
      .json({ message: "Error retrieving students", error: err.message });
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const student = await Students.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne();

    res
      .status(200)
      .json({ message: "Student and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
