const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const usersRoute = require("./routes/users");
const subjectsRoute = require("./routes/subjects");
const adminsRoute = require("./routes/admins");
const adminStudentRoute = require("./routes/adminStudent");
const adminTeacherRoute = require("./routes/adminTeacher");
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
const { checkExamStatus } = require("./middleware/checkExamStatus");

const port = process.env.PORT || 8080;

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Exam Management API",
    version: "1.0.0",
    description: "API for managing exams, questions, and results.",
  },
  paths: {
    "/startExam": {
      post: {
        tags: ["Exam Operations"],
        summary: "Start an exam for a student",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/StartExamRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Exam started successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StartExamResponse",
                },
              },
            },
          },
          404: {
            description: "Exam not found",
          },
          400: {
            description: "Bad request",
          },
        },
      },
    },
    "/submitAnswer": {
      post: {
        tags: ["Exam Operations"],
        summary: "Submit an answer for a question during an exam",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubmitAnswerRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Answer submitted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SubmitAnswerResponse",
                },
              },
            },
          },
          404: {
            description: "Question or subject not found",
          },
          400: {
            description: "Error submitting answer",
          },
        },
      },
    },
    "/addQuestionWithOptions": {
      post: {
        tags: ["Question Operations"],
        summary: "Create a question with options",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddQuestionRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Question and options added successfully",
          },
          400: {
            description: "Error adding question and options",
          },
        },
      },
    },
    "/createExamWithAllSubjects": {
      post: {
        tags: ["Exam Operations"],
        summary: "Create an exam with all subjects",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateExamRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Exam with all subjects created successfully",
          },
          400: {
            description: "Error creating exam with all subjects",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      StartExamRequest: {
        type: "object",
        properties: {
          examId: {
            type: "string",
            format: "uuid",
          },
          selectedSubjectIds: {
            type: "array",
            items: {
              type: "string",
              format: "uuid",
            },
          },
          studentId: {
            type: "string",
            format: "uuid",
          },
        },
        required: ["examId", "selectedSubjectIds", "studentId"],
      },
      // Define other request and response schemas here...
    },
  },
};

// Initialize Swagger JSDoc
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition: swaggerDocument,
  apis: ["routes/*.js"], // Here you can add paths to your route files for Swagger to parse
});

// Serve Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Your API",
//       version: "1.0.0",
//     },
//   },
//   apis: ["routes/*.js"],
// };

app.use(express.json());
checkExamStatus();

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
app.use("/subjects", subjectsRoute);
app.use("/adminStudent", adminStudentRoute);
app.use("/adminTeacher", adminTeacherRoute);

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
