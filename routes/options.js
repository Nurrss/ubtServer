const router = require("express").Router();
const _ = require("lodash");

const Options = require("../models/Options");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const options = new ApiOptimizer(Options);
const modelName = "Options";

/**
 * @swagger
 * /options/:
 *   get:
 *     summary: Get all options
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: A list of all options.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Option'
 */

/**
 * @swagger
 * /options/{id}:
 *   get:
 *     summary: Get an option by ID
 *     tags: [Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Option data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Option'
 *       404:
 *         description: Option not found
 *   delete:
 *     summary: Delete an option by ID
 *     tags: [Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Option deleted successfully.
 *       404:
 *         description: Option not found
 */

/**
 * @swagger
 * /options/add:
 *   post:
 *     summary: Add a new option
 *     tags: [Options]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Option'
 *           examples:
 *             addOptionExample:
 *               summary: Add Option Example
 *               value:
 *                 question: "5f8d05734b5a46283c89ae7f"
 *                 text: "Option A"
 *     responses:
 *       201:
 *         description: Option added successfully.
 *       400:
 *         description: Error in adding the option.
 */

/**
 * @swagger
 * /options/{id}:
 *   put:
 *     summary: Update an option by ID
 *     tags: [Options]
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
 *             $ref: '#/components/schemas/Option'
 *           examples:
 *             updateOptionExample:
 *               summary: Update Option Example
 *               value:
 *                 question: "5f8d05734b5a46283c89ae7f"
 *                 text: "Updated Option Text"
 *     responses:
 *       200:
 *         description: Option updated successfully.
 *       404:
 *         description: Option not found.
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await options.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an options by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await options.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await options.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new options done
router.post("/add", async (req, res) => {
  try {
    const { question, text } = req.body;
    const entity = { question, text };
    await options.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update options done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { question, text } = req.body;
    const fieldsToUpdate = { question, text };
    await options.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
