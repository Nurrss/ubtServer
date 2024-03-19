const router = require("express").Router();
const _ = require("lodash");

const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const clases = new ApiOptimizer(Classes);
const modelName = "Classes";

/**
 * @swagger
 * /classes/:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: The list of the classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       500:
 *         description: Error in fetching classes.
 */

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Get a class by id
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The class id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class object found and returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found.
 *       500:
 *         description: Error in fetching class.
 */

/**
 * @swagger
 * /classes/add:
 *   post:
 *     summary: Add a new class
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class successfully added.
 *       500:
 *         description: Error adding the class.
 */

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Update a class by id
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The class id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class successfully updated.
 *       404:
 *         description: Class not found.
 *       500:
 *         description: Error updating the class.
 */

router.route("/").get(async (req, res) => {
  try {
    await clases.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    await clases.getById(req, res, modelName);
    res.status(200).json({ clases });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new clases done
router.route("/add").post(async (req, res) => {
  try {
    const { studentsCount, literal, className } = req.body;
    const entity = { studentsCount, literal, className };
    await clases.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { studentsCount, literal, className } = req.body;
    const fieldsToUpdate = { studentsCount, literal, className };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
