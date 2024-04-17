const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const usersRoute = require("./routes/users");
const adminsRoute = require("./routes/admins");
const authRoute = require("./routes/auth");
const studentRoute = require("./routes/students");
const teacherRoute = require("./routes/teachers");
const logoutRoute = require("./routes/logout");
const registerRoute = require("./routes/register");
const questionRoute = require("./routes/questions");
const topicRoute = require("./routes/topics");
const examRoute = require("./routes/exams");
const resultsRoute = require("./routes/results");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { logger, logEvents } = require("./middleware/logger");
const verifyJwt = require("./middleware/verifyJwt");

const port = process.env.PORT || 8080; // Vercel will provide the PORT variable
// rest of your code remains the same

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
  },
  apis: ["routes/*.js"], // Укажите путь к вашим файлам маршрутов
};

const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors());
app.use("/register", registerRoute);
app.use("/auth", authRoute);
// app.use(verifyJwt);

// authorized routes
app.use("/students", studentRoute);
app.use("/exams", examRoute);
app.use("/teachers", teacherRoute);
app.use("/question", questionRoute);
app.use("/results", resultsRoute);
app.use("/topics", topicRoute);
app.use("/logout", logoutRoute);
app.use("/users", usersRoute);
app.use("/admins", adminsRoute);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log("Backend server is running at: ", port);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

// it should be in the end
app.use(function (req, res) {
  console.log(req);
  return res.status(404).json({ message: "Endpoint not found" });
});
