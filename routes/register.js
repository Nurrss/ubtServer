const router = require("express").Router();
const bcrypt = require("bcrypt");
const Teachers = require("../models/Teachers");
const { hashConstance, ROLES } = require("../enums");
const Users = require("../models/Users");
const Classes = require("../models/Classes");
const errorHandler = require("../middleware/errorHandler");

const handleNewUser = require("../controllers/registerController");

router.post("/", handleNewUser);

router.post("/teacher", async (req, res) => {
  try {
    const { name, surname, email, literal, classNum, subject, role, password } =
      req.body;

    const hash = await bcrypt.hash(password, hashConstance);

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
