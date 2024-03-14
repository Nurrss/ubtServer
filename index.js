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
const { logger, logEvents } = require("./middleware/logger");
const verifyJwt = require("./middleware/verifyJwt");

const port = 8000;

app.use(express.json());
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors());
app.use("api/register", registerRoute);
app.use("api/auth", authRoute);
app.use(verifyJwt);

// authorized routes
app.use("api/students", studentRoute);
app.use("api/exams", examRoute);
app.use("api/teachers", teacherRoute);
app.use("api/question", questionRoute);
app.use("api/results", resultsRoute);
app.use("api/topics", topicRoute);
app.use("api/logout", logoutRoute);
app.use("api/users", usersRoute);
app.use("api/admins", adminsRoute);

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
