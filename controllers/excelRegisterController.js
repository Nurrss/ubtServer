const fetch = require("node-fetch");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Users = require("../models/Users"); // Путь до модели Users

const registerStudentsFromUrl = async (req, res) => {
  try {
    const fileUrl = req.body.fileUrl; // Ссылка на файл Excel

    // Загрузка файла Excel
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    const tempFilePath = path.resolve(__dirname, "tempfile.xlsx");
    fs.writeFileSync(tempFilePath, buffer);

    // Считывание файла
    const workbook = XLSX.readFile(tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Удаление временного файла
    fs.unlinkSync(tempFilePath);

    // Проходим по каждой строке и создаем пользователя
    const studentPromises = data.map((row) => {
      const user = new Users({
        email: row.email,
        name: row.name,
        surname: row.surname,
        password: row.password, // Здесь должно быть хеширование пароля
        class: row.class,
        role: "student",
      });

      return user.save(); // Возвращаем промис сохранения пользователя
    });

    // Дождемся выполнения всех промисов
    await Promise.all(studentPromises);

    res.status(201).json({ message: "Students registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering students", error });
  }
};

module.exports = { registerStudentsFromUrl };
