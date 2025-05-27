require("dotenv").config();
const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const authRoutes = require("./routes/auth")(db);
const userRoutes = require("./routes/users")(db);
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use("/api", authRoutes);
app.use("/api/users", authMiddleware(db), userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
