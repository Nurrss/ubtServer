const router = require("express").Router();
const _ = require("lodash");

const Subjects = require("../models/Subjects");
const Topics = require("../models/Topics");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkRole");
const { getSubjectById } = require("../controllers/getSubjectById");

const subjects = new ApiOptimizer(Subjects);
const modelName = "Subjects";

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - kz_subject
 *         - ru_subject
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the subject
 *         kz_subject:
 *           type: string
 *           description: The name of the subject in Kazakh
 *         ru_subject:
 *           type: string
 *           description: The name of the subject in Russian
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *             description: References to topics associated with this subject
 *           description: A list of topics IDs related to the subject
 *
 * paths:
 *   /subjects:
 *     get:
 *       tags:
 *         - Subjects
 *       summary: Retrieve a list of all subjects
 *       responses:
 *         200:
 *           description: A list of subjects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Subject'
 *     post:
 *       tags:
 *         - Subjects
 *       summary: Create a new subject
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       responses:
 *         201:
 *           description: Subject created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Subject'
 *
 *   /subjects/{id}:
 *     get:
 *       tags:
 *         - Subjects
 *       summary: Get a subject by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Detailed information about the subject
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Subject'
 *     put:
 *       tags:
 *         - Subjects
 *       summary: Update a subject by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       responses:
 *         200:
 *           description: Subject updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Subject'
 *     delete:
 *       tags:
 *         - Subjects
 *       summary: Delete a subject by ID
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Subject deleted successfully
 */

router.route("/").get(async (req, res) => {
  try {
    await subjects.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { ru_subject, kz_subject } = req.body;
    const entity = { ru_subject, kz_subject };
    await subjects.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const subject = await Subjects.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.remove();

    res
      .status(200)
      .json({ message: "Subject and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.route("/:id").get(getSubjectById);

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { subject } = req.body;
    const fieldsToUpdate = { subject };
    await subjects.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
