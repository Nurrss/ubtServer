const router = require("express").Router();
const _ = require("lodash");

const Topics = require("../models/Topics");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const checkTeacher = require("../middleware/checkTeacher");

const topics = new ApiOptimizer(Topics);
const modelName = "Topics";

/**
 * @swagger
 * tags:
 *   - name: Topics
 *     description: Operations related to topics.
 *
 * /topics/:
 *   get:
 *     summary: Retrieve all topics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: A list of all topics.
 *         content:
 *           application/json:
 *             examples:
 *               allTopics:
 *                 summary: Example response for all topics
 *                 value:
 *                   - id: "601d1a3eef97dbeef70828b1"
 *                     title: "Mathematics Basics"
 *                     subject: "Mathematics"
 *                   - id: "601d1b2eef97dbeef70828b2"
 *                     title: "Introduction to Physics"
 *                     subject: "Physics"
 *       500:
 *         description: Server error
 *
 * /topics/add:
 *   post:
 *     summary: Add a new topic
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             addTopic:
 *               summary: Example of adding a new topic
 *               value:
 *                 title: "Advanced Chemistry"
 *                 subject: "Chemistry"
 *     responses:
 *       200:
 *         description: New topic added successfully.
 *       400:
 *         description: Error in adding the topic.
 *
 * /topics/{id}:
 *   get:
 *     summary: Get a topic by its ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details of a specific topic.
 *         content:
 *           application/json:
 *             examples:
 *               specificTopic:
 *                 summary: Example response for a specific topic
 *                 value:
 *                   id: "601d1a3eef97dbeef70828b1"
 *                   title: "Mathematics Basics"
 *                   subject: "Mathematics"
 *       404:
 *         description: Topic not found.
 *
 *   delete:
 *     summary: Delete a topic by its ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic deleted successfully.
 *       404:
 *         description: Topic not found.
 *
 *   put:
 *     summary: Update a topic by its ID
 *     tags: [Topics]
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
 *             updateTopic:
 *               summary: Example of updating a topic
 *               value:
 *                 title: "Mathematics for Beginners"
 *                 subject: "Mathematics"
 *     responses:
 *       200:
 *         description: Topic updated successfully.
 *       404:
 *         description: Topic not found.
 */

// get all done
router.route("/").get(async (req, res) => {
  try {
    await topics.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// add new results done
router.post("/add", async (req, res) => {
  try {
    const { title, subject } = req.body;
    const entity = { title, subject };
    await topics.add({ entity, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

//delete an questions by id done
router.route("/:id").delete(async (req, res) => {
  try {
    await topics.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// get by id done
router.route("/:id").get(async (req, res) => {
  try {
    await topics.getById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

// Update questions done
router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { title, subject } = req.body;
    const fieldsToUpdate = { title, subject };
    await topics.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
