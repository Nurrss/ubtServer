const router = require("express").Router();
const _ = require("lodash");

const Results = require("../models/Results");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const results = new ApiOptimizer(Results);
const modelName = "Results";

/**
 * @swagger
 * tags:
 *   - name: Results
 *     description: Operations on exam results.
 *
 * /results/:
 *   get:
 *     summary: Retrieve all results
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: A list of results.
 *       500:
 *         description: Server error
 *
 * /results/add:
 *   post:
 *     summary: Add a new result
 *     tags: [Results]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             addResult:
 *               value:
 *                 exam: "examIdHere"
 *                 student: "studentIdHere"
 *                 score: 85
 *     responses:
 *       200:
 *         description: New result added successfully.
 *       400:
 *         description: Error in adding the result
 *
 * /results/{id}:
 *   get:
 *     summary: Get a result by its ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the result to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of a specific result.
 *       404:
 *         description: Result not found
 *
 *   delete:
 *     summary: Delete a result by its ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the result to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Result deleted successfully
 *       404:
 *         description: Result not found
 *
 *   put:
 *     summary: Update a result by its ID
 *     tags: [Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the result to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             updateResult:
 *               value:
 *                 exam: "newExamIdHere"
 *                 student: "newStudentIdHere"
 *                 score: 95
 *     responses:
 *       200:
 *         description: Result updated successfully.
 *       404:
 *         description: Result not found
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await results.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an results by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await results.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await results.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new results done
router.post("/add", checkTeacher, async (req, res) => {
  try {
    const { exam, student, score } = req.body;
    const entity = { exam, student, score };
    await results.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update results done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { exam, student, score } = req.body;
    const fieldsToUpdate = { exam, student, score };
    await results.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
