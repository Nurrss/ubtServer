const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { hashConstance, ROLES } = require("../enums");
const Users = require("../models/Users");
const Classes = require("../models/Classes");
const Subjects = require("../models/Subjects");
const errorHandler = require("../middleware/errorHandler");
const Teachers = require("../models/Teachers");

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
 * /adminTeacher/:
 *   get:
 *     tags: [Admin]
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
 * /adminTeacher/add:
 *   post:
 *     tags: [Admin]
 *     summary: Add a new teacher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the teacher
 *               surname:
 *                 type: string
 *                 description: The surname of the teacher
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the teacher
 *               literal:
 *                 type: string
 *                 description: The literal representation of the class
 *               classNum:
 *                 type: string
 *                 description: The class number
 *               subjectName:
 *                 type: string
 *                 description: The name of the subject
 *     responses:
 *       201:
 *         description: Teacher added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 * /adminTeacher/{id}:
 *   put:
 *     tags: [Admin]
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
 *       404:
 *         description: Teacher not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a teacher by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher and associated user deleted successfully
 *       404:
 *         description: Teacher not found
 */

router.post("/add", async (req, res) => {
  try {
    const { name, surname, email, literal, classNum, subjectName } = req.body;

    const hash = await bcrypt.hash(`${name + "123" + surname}`, hashConstance);

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
      role: "teacher",
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
router.put("/:id", async (req, res) => {
  const teacherId = req.params.id;
  const { name, surname, email, literal, classNum, subjectId } = req.body;

  try {
    // Find the existing teacher
    const teacher = await Teachers.findById(teacherId).populate("user");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update User details
    const user = await Users.findById(teacher.user._id);
    if (user) {
      user.name = name;
      user.surname = surname;
      user.email = email;
      await user.save();
    } else {
      return res.status(404).json({ message: "Associated user not found" });
    }

    // Update or create Class
    let updatedClass;
    if (classNum && literal) {
      updatedClass = await Classes.findOneAndUpdate(
        { class: classNum, literal: literal },
        {},
        { new: true, upsert: true }
      );

      // Set the teacher for the class
      updatedClass.teacher = teacher._id;
      await updatedClass.save();
    }

    // Update Subject
    if (subjectId) {
      const subject = await Subjects.findById(subjectId);
      if (subject) {
        teacher.subject = subject._id;
      } else {
        return res.status(404).json({ message: "Subject not found" });
      }
    }

    // Save updated teacher details
    await teacher.save();

    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await Teachers.findById(teacherId)
      .populate("user")
      .populate("class");

    if (!teacher) {
      return res.status(404).send("Teacher not found.");
    }

    res.status(200).json(teacher);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.get("/", async (req, res) => {
  try {
    const teachers = await Teachers.find()
      .populate("user", "name surname email") // Simplified populate for user
      .populate("class", "class literal") // Simplified populate for class
      .populate("subject", "subject"); // Simplified populate for subject

    if (!teachers.length) {
      return res.status(200).json([]); // Send an empty array if no teachers found
    }

    const teachersList = teachers.map((teacher) => ({
      id: teacher._id,
      name: teacher.user.name,
      surname: teacher.user.surname,
      group: `${teacher.class.class}${teacher.class.literal}`,
      subject: teacher.subject ? teacher.subject.subject : "No subject", // Ensure we have a subject before accessing its name
      email: teacher.user.email,
    }));

    res.status(200).json(teachersList);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;

    const teacherToDelete = await Teachers.findById(teacherId).populate("user");

    if (!teacherToDelete) {
      return res.status(404).send("Teacher not found.");
    }

    if (teacherToDelete.class) {
      await Classes.findByIdAndUpdate(teacherToDelete.class, {
        $unset: { teacher: "" },
      });
    }

    await Teachers.findByIdAndDelete(teacherId);

    if (teacherToDelete.user) {
      await Users.findByIdAndDelete(teacherToDelete.user._id, { new: true });
    }

    res
      .status(200)
      .send({ message: "Teacher and associated user deleted successfully." });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
