// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

db.getConnection()
  .then((conn) => {
    console.log("✔ Connected to MySQL");
    conn.release();
  })
  .catch((err) => {
    console.error("✖ MySQL Connection Error:", err.message);
    process.exit(1);
  });

// CORS
const allowed = process.env.CORS_ORIGIN.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth")(db);
const userRoutes = require("./routes/users")(db);
const authMiddleware = require("./middleware/authMiddleware")(db);

app.use("/api", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
