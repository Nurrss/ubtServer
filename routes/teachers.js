const router = require("express").Router();
const _ = require("lodash");

const Teachers = require("../models/Teachers");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const teacher = new ApiOptimizer(Teachers);
const modelName = "Teacher";

/**
 * @swagger
 * tags:
 *   - name: Teacher
 *     description: Operations on Teachers.
 *
 * /teachers/:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: A list of all teachers.
 *         content:
 *           application/json:
 *             examples:
 *               allTeachers:
 *                 summary: Example response of all teachers
 *                 value:
 *                   - name: John Doe
 *                     email: johndoe@example.com
 *                     classes: ['Math', 'Science']
 *                     literal: '10A'
 *                   - name: Jane Smith
 *                     email: janesmith@example.com
 *                     classes: ['History', 'English']
 *                     literal: '10B'
 *
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of a specific teacher.
 *         content:
 *           application/json:
 *             examples:
 *               specificTeacher:
 *                 summary: Example response for a specific teacher
 *                 value:
 *                   name: John Doe
 *                   email: johndoe@example.com
 *                   classes: ['Math', 'Science']
 *                   literal: '10A'
 *       404:
 *         description: Teacher not found
 *
 *   delete:
 *     summary: Delete a teacher by ID
 *     tags: [Teacher]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher deleted successfully.
 *       404:
 *         description: Teacher not found
 *
 *   put:
 *     summary: Update a teacher by ID
 *     tags: [Teacher]
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
 *           examples:
 *             updateTeacher:
 *               summary: Example of updating a teacher
 *               value:
 *                 name: John Doe Updated
 *                 email: johndoeupdated@example.com
 *                 password: newPassword123
 *                 classes: ['Mathematics', 'Science']
 *                 literal: '10A'
 *     responses:
 *       200:
 *         description: Teacher updated successfully.
 *       404:
 *         description: Teacher not found
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await teacher.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an teacher by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await teacher.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await teacher.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update teacher done
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

module.exports = router;
