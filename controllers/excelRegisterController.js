const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Users = require("../models/Users");
const Students = require("../models/Students");
const { hashConstance, ROLES } = require("../enums");

const Classes = require("../models/Classes");

const registerStudentsFromUrl = async (req, res) => {
  try {
    const fileUrl = req.body.fileUrl;
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    const tempFilePath = path.join(__dirname, "tempfile.xlsx");
    fs.writeFileSync(tempFilePath, buffer);

    // Read and parse the Excel file
    const workbook = XLSX.readFile(tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Adjust the header option according to your Excel file structure
    const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Ensure all data is valid and initiate registration
    // console.log(rows);
    const registrationPromises = rows.map(async (row) => {
      // Check for empty email or existing email in the database
      if (
        !row.email ||
        (await Users.findOne({ email: String(row.email).toLowerCase().trim() }))
      ) {
        // Decide whether to throw an error or just skip this entry
        // console.warn(`Invalid or already registered email: ${row.email}`);
        return null; // Skipping this entry
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(
        row.password.trim(),
        hashConstance
      );

      // Create and save the new User
      const newUser = new Users({
        email: String(row.email).toLowerCase().trim(),
        name: String(row.name).trim(),
        surname: String(row.surname).trim(),
        password: hashedPassword,
        role: "student",
      });
      const savedUser = await newUser.save();

      let studentClass = await Classes.findOne({
        class: row.classNum,
        literal: row.literal,
      });

      if (!studentClass) {
        studentClass = new Classes({
          class: row.classNum,
          literal: row.literal,
          students: [],
        });
        await studentClass.save();
      }

      const newStudent = new Students({
        user: savedUser._id,
        class: studentClass._id,
        inn: row.inn,
      });
      return newStudent.save();
    });

    // Filter out null promises created from skipped rows and wait for the rest
    const filteredPromises = registrationPromises.filter((p) => p !== null);
    await Promise.all(filteredPromises);

    res.status(201).json({ message: "Students registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering students", error });
  }
};

module.exports = { registerStudentsFromUrl };
