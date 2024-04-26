const router = require("express").Router();
const _ = require("lodash");

const Teachers = require("../models/Teachers");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const teacher = new ApiOptimizer(Teachers);
const modelName = "Teacher";

router.route("/").get(async (req, res) => {
  try {
    await teacher.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await teacher.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
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
    const { name, email, password, classes, literal } = req.body;
    const fieldsToUpdate = { name, email, password, classes, literal };
    await teacher.updateById({ entityId, fieldsToUpdate, req, res });
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
