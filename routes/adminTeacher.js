const router = require("express").Router();
const _ = require("lodash");

const Users = require("../models/Users");
const Classes = require("../models/Classes");
const errorHandler = require("../middleware/errorHandler");
const Teachers = require("../models/Teachers");

router.post("/add", async (req, res) => {
  try {
    const { name, surname, email, literal, classNum, subject } = req.body;

    const newUser = new Users({
      name,
      surname,
      email,
      password: `${name + "123" + surname}`,
      role: "teacher",
    });

    const savedUser = await newUser.save();

    let classForTeacher;

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

    classForTeacher = existingClass;

    const newTeacher = new Teachers({
      user: savedUser._id,
      class: classForTeacher._id,
      subject,
    });

    const savedTeacher = await newTeacher.save();

    classForTeacher.teacher = savedTeacher._id;
    await classForTeacher.save();

    res.status(201).send(savedTeacher);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, surname, email, literal, classNum, subject } = req.body;
    const teacherId = req.params.id;

    let updatedClassForTeacher;
    if (classNum && literal) {
      updatedClassForTeacher = await Classes.findOneAndUpdate(
        { class: classNum, literal: literal },
        { teacher: teacherId },
        { new: true, upsert: true }
      );
    }

    const updatedTeacher = await Teachers.findById(teacherId).populate("user");
    if (updatedTeacher) {
      updatedTeacher.user.name = name;
      updatedTeacher.user.surname = surname;
      updatedTeacher.user.email = email;
      await updatedTeacher.user.save();

      updatedTeacher.subject = subject;
      updatedTeacher.classes = updatedClassForTeacher
        ? updatedClassForTeacher._id
        : updatedTeacher.classes;
      await updatedTeacher.save();

      res.status(200).send(updatedTeacher);
    } else {
      return res.status(404).send("Teacher not found.");
    }
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
    const teachers = await Teachers.find().populate("user").populate("class");
    if (!teachers.length) {
      return res.status(200).send([]);
    }

    const teachersList = teachers.map((teacher) => ({
      id: teacher._id,
      name: teacher.user.name,
      surname: teacher.user.surname,
      group: `${teacher.class.class}${teacher.class.literal}`,
      subject: teacher.subject,
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
      await Users.findByIdAndDelete(teacherToDelete.user._id, {
        session: session,
      });
    }

    res
      .status(200)
      .send({ message: "Teacher and associated user deleted successfully." });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
