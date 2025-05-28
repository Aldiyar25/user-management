const mysql = require("mysql2/promise");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.getConnection()
  .then((conn) => {
    console.log("✔ Connected to remote MySQL");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL Connection Error:", err.message);
    process.exit(1);
  });

const authRoutes = require("./routes/auth")(db);
const userRoutes = require("./routes/users")(db);
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
const allowed = process.env.CORS_ORIGIN.split(",");
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);
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
