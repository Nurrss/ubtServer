const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

const Admins = require("../models/Admins");
const Users = require("../models/Users");
const Students = require("../models/Students");
const Classes = require("../models/Classes");
const ApiOptimizer = require("../api");
const errorHandler = require("../middleware/errorHandler");

const admin = new ApiOptimizer(Admins);
const modelName = "Admins";

router.route("/").get(async (req, res) => {
  try {
    console.log("here1");
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

// router.route("/:id").get(async (req, res) => {
//   try {
//     await admin.getById(req, res, modelName);
//   } catch (err) {
//     errorHandler(err, req, res);
//   }
// });

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
    const { oldPassword, newPassword } = req.body; // Make sure the casing is consistent
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
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(newPassword, salt);

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

module.exports = router;
