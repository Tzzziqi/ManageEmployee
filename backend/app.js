require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const mongoose = require("mongoose");
const cors = require("cors");

const authRouter = require("./routes/authRoutes");
// const employeeRoutes = require("./routes/employeeRoutes");
const hrRoutes = require("./routes/hrRoutes");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/test", require("./routes/testRoutes"));

app.use("/api/auth", authRouter);
// app.use("/api/employee", employeeRoutes);
app.use("/api/hr", hrRoutes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, _next) {
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message,
    data: null,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;