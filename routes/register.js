const router = require("express").Router();
const bcrypt = require("bcrypt");
const Teachers = require("../models/Teachers");
const { hashConstance, ROLES } = require("../enums");
const Users = require("../models/Users");
const Classes = require("../models/Classes");
const Subjects = require("../models/Subjects");

const errorHandler = require("../middleware/errorHandler");
const handleNewUser = require("../controllers/registerController");

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Registration]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user
 *               role:
 *                 type: string
 *                 enum: [teacher, admin, student]
 *                 description: The role of the user
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the registered user
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the registered user
 *                 role:
 *                   type: string
 *                   enum: [teacher, admin, student]
 *                   description: The role of the registered user
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/", handleNewUser);

router.post("/teacher", async (req, res) => {
  try {
    const {
      name,
      surname,
      email,
      literal,
      classNum,
      subjectName,
      role,
      password,
    } = req.body;

    if (role !== "teacher")
      return res
        .status(400)
        .json({ message: "Role is not teacher.", success: false });

    const hash = await bcrypt.hash(password, hashConstance);

    const validateEmail = async (email) => {
      return !(await Users.findOne({ email }));
    };

    let emailNotRegistered = await validateEmail(email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: "Email is already registered.",
        success: false,
      });
    }

    const newUser = new Users({
      name,
      surname,
      email,
      password: hash,
      role,
    });

    const savedUser = await newUser.save();

    let classForTeacher = await Classes.findOne({
      class: classNum,
      literal: literal,
    });

    if (!classForTeacher) {
      const newClass = new Classes({
        class: classNum,
        literal,
        students: [],
      });
      classForTeacher = await newClass.save();
    }

    let subject = await Subjects.findOne({ subject: subjectName });
    if (!subject) {
      subject = new Subjects({ subject: subjectName });
      subject = await subject.save();
    }

    const newTeacher = new Teachers({
      user: savedUser._id,
      class: classForTeacher._id,
      subject: subject._id,
    });

    const savedTeacher = await newTeacher.save();

    classForTeacher.teacher = savedTeacher._id;
    await classForTeacher.save();

    res.status(201).json(savedTeacher);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
