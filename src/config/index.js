const dotenv = require("dotenv");
dotenv.config();

const config = {
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/quiz-app",
  PORT: process.env.PORT || 3001,

  JWT_SECRET: process.env.JWT_SECRET || "thisisasecret",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "1d",
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || "HS256",

  SMTP_HOST: process.env.SMTP_HOST || "smtp.mailtrap.io",
  SMTP_PORT: process.env.SMTP_PORT || 2525,
  SMTP_USER: process.env.SMTP_USER || "e7b0b7b7b0c7d6",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "e7b0b7b7b0c7d6",
  FROM_NAME: process.env.FROM_NAME || "Quiz App",
};

module.exports = config;
