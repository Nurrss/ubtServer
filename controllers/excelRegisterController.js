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
    const tempFilePath = path.join("/tmp", "tempfile.xlsx");
    fs.writeFileSync(tempFilePath, buffer);

    // Read and parse the Excel file
    const workbook = XLSX.readFile(tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    fs.unlinkSync(tempFilePath);

    // Filter out rows with undefined classNum or literal
    const filteredRows = rows.filter((row) => {
      const classNum = row.classNum ? String(row.classNum).trim() : undefined;
      const literal = row.literal ? String(row.literal).trim() : undefined;
      return classNum && literal;
    });

    // Collect unique classes
    const classesMap = new Map();
    for (const row of filteredRows) {
      const classNum = String(row.classNum).trim();
      const literal = String(row.literal).trim();
      const classKey = `${classNum}_${literal}`;
      if (!classesMap.has(classKey)) {
        classesMap.set(classKey, { classNum, literal });
      }
    }

    // Create or retrieve classes
    const classCreationPromises = [];
    classesMap.forEach(({ classNum, literal }) => {
      classCreationPromises.push(
        Classes.findOneAndUpdate(
          { class: classNum, literal },
          { $setOnInsert: { class: classNum, literal, students: [] } },
          { new: true, upsert: true, useFindAndModify: false }
        )
      );
    });

    const classResults = await Promise.all(classCreationPromises);
    const classMapById = new Map();
    classResults.forEach((cls) => {
      classMapById.set(`${cls.class}_${cls.literal}`, cls);
    });

    // Collect student registrations
    const studentClassMap = new Map();
    const registrationPromises = filteredRows.map(async (row) => {
      const classNum = String(row.classNum).trim();
      const literal = String(row.literal).trim();

      if (
        !row.email ||
        (await Users.findOne({ email: String(row.email).toLowerCase().trim() }))
      ) {
        return null;
      }

      const hashedPassword = await bcrypt.hash(
        row.password.trim(),
        hashConstance
      );

      const newUser = new Users({
        email: String(row.email).toLowerCase().trim(),
        name: String(row.name).trim(),
        surname: String(row.surname).trim(),
        password: hashedPassword,
        role: "student",
      });

      const savedUser = await newUser.save();

      const classKey = `${classNum}_${literal}`;
      const studentClass = classMapById.get(classKey);

      const newStudent = new Students({
        user: savedUser._id,
        class: studentClass._id,
        inn: row.inn,
      });

      const savedStudent = await newStudent.save();

      if (!studentClassMap.has(studentClass._id)) {
        studentClassMap.set(studentClass._id, []);
      }

      studentClassMap.get(studentClass._id).push(savedStudent._id);

      return savedStudent;
    });

    const filteredPromises = registrationPromises.filter((p) => p !== null);
    await Promise.all(filteredPromises);

    // Save all classes with their respective students
    const classUpdatePromises = [];
    studentClassMap.forEach((studentIds, classId) => {
      classUpdatePromises.push(
        Classes.findByIdAndUpdate(classId, {
          $push: { students: { $each: studentIds } },
        })
      );
    });

    await Promise.all(classUpdatePromises);

    res.status(201).json({ message: "Students registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering students", error });
  }
};

module.exports = { registerStudentsFromUrl };
