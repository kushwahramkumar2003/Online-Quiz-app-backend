const express = require("express");
const fileUpload = require("express-fileupload");
const routes = require("./routes/index.routes.js");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://quiz-app-backend-cloud.azurewebsites.net",
  "https://quiz-guard.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      const isAllowed = allowedOrigins.includes(origin) || !origin;
      callback(null, isAllowed);
    },
    credentials: true,
    exposedHeaders: [
      "set-cookie",
      "Content-Disposition",
      "Content-Type",
      "Content-Length",
    ],
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  console.log("Hello 2024!!!");
  res.send("Hello 2024!!!");
});

module.exports = app;
