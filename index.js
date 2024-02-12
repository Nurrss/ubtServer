const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");

const port = process.env.PORT || 8800;

mongoose
  .connect(
    "mongodb+srv://user:user@smavyplatform.eyoabnp.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

app.use(morgan("common"));

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

app.use(function (req, res) {
  return res.status(404).json({ message: "Endpoint not found" });
});
