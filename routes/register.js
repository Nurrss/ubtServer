const router = require("express").Router();
const bcrypt = require("bcrypt");
const Teachers = require("../models/Teachers");
const Users = require("../models/Users");
const Classes = require("../models/Classes");
const errorHandler = require("../middleware/errorHandler");

const handleNewUser = require("../controllers/registerController");

router.post("/", handleNewUser);

router.post("/teacher", async (req, res) => {
  try {
    const { name, surname, email, literal, classNum, subject, role, password } =
      req.body;
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const newUser = new Users({
      name,
      surname,
      email,
      password: hash,
      role,
    });
    console.log(password);

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

module.exports = router;
