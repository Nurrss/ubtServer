const router = require('express').Router();
const _ = require('lodash');

const Users = require('../models/Users');
const ApiOptimizer = require('../api');

const checkRole = require('../middleware/checkRole');
const errorHandler = require('../middleware/errorHandler');
const { ROLES } = require('../enums');

const user = new ApiOptimizer(Users);
const modelName = 'User';

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: Number of users to take per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             example:
 *               data:
 *                 - id: "12345"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john@example.com"
 *                   role: "admin"
 *                 - id: "67890"
 *                   firstName: "Jane"
 *                   lastName: "Doe"
 *                   email: "jane@example.com"
 *                   role: "user"
 *               message: "Успешно получено"
 *       400:
 *         description: Bad request
 */
router.route('/').get(checkRole([ROLES.ADMIN]), async (req, res) => {
  try {
    await user.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route('/:id').delete(async (req, res) => {
    try {
      await user.deleteById(req, res, modelName);
    } catch (err) {
      errorHandler(err, req, res);
    }
  })


router.route('/:id').get(async (req, res) => {
    try {
      await user.getById(req, res, modelName);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 */
/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *           examples:
 *             example1:
 *               value:
 *                 id: "12345"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "admin"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               data:
 *                 id: "12345"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 role: "admin"
 *               message: "Успешно сохранено"
 *       400:
 *         description: Bad request
 */
router.put('/:id', checkRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const entityId = _.get(req, 'params.id');
    const { role } = req.body;
    const fieldsToUpdate = {role};

    await user.update({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

module.exports = router;
