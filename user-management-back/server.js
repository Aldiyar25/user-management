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
    console.log(" Connected to MySQL");
    conn.release();
  })
  .catch((err) => {
    console.error(" MySQL Connection Error:", err.message);
    process.exit(1);
  });

const allowedOrigins = [
  "http://localhost:3000",
  "https://user-management-ui-ngv0.onrender.com",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const authRoutes = require("./routes/auth")(db);
const userRoutes = require("./routes/users")(db);
const authMiddleware = require("./middleware/authMiddleware")(db);

app.use("/api", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
