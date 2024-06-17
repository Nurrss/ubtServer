const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { hashConstance, ROLES } = require("../enums");

const Admins = require("../models/Admins");
const Users = require("../models/Users");
const Students = require("../models/Students");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");
const { getAllResultForExam } = require("../controllers/getResultForExam");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the admin
 *         user:
 *           type: string
 *           description: The ID of the associated user
 *
 * tags:
 *   - name: Admin
 *     description: Admin management
 *
 * /admins/:
 *   get:
 *     tags: [Admin]
 *     summary: Get all admins
 *     responses:
 *       200:
 *         description: A list of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 *
 * /admins/add:
 *   post:
 *     tags: [Admin]
 *     summary: Add a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Admin added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *
 * /admins/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get an admin by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 *   put:
 *     tags: [Admin]
 *     summary: Update an admin by ID
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
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete an admin by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */

router.route("/").get(async (req, res) => {
  try {
    await admin.getAll(req, res);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await admin.deleteById(req, res, modelName);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admins.findById(adminId).populate("user");

    const obj = {
      _id: adminId,
      email: admin.user.email,
      password: admin.user.password,
      name: admin.user.name,
      surname: admin.user.surname,
      role: admin.user.role,
    };

    if (!admin) {
      return res.status(404).send("Admin not found.");
    }

    res.status(200).json(obj);
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const entityId = _.get(req, "params.id");
    const { email, password } = req.body;
    const fieldsToUpdate = { email, password };
    await admin.updateById({ entityId, fieldsToUpdate, req, res });
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/profile/:id", async (req, res) => {
  try {
    const { email, name, surname } = req.body;
    const adminId = req.params.id;

    const updatedAdmin = await Admins.findById(adminId).populate("user");
    if (updatedAdmin) {
      updatedAdmin.user.email = email;
      updatedAdmin.user.name = name;
      updatedAdmin.user.surname = surname;
      await updatedAdmin.user.save();
      await updatedAdmin.save();

      res.status(200).send(updatedAdmin);
    } else {
      return res.status(404).send("Admin not found.");
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.put("/password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.params.id;
    const updatedAdmin = await Admins.findById(adminId).populate("user");
    if (!updatedAdmin) {
      return res.status(404).send("Admin not found.");
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      updatedAdmin.user.password
    );

    if (isMatch) {
      const hash = await bcrypt.hash(newPassword, hashConstance);

      updatedAdmin.user.password = hash;
      await updatedAdmin.user.save();

      res.status(200).send("Password updated successfully.");
    } else {
      return res.status(400).send("Old password is incorrect.");
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
});

router.post("/getAllResultForExam", getAllResultForExam);

module.exports = router;
