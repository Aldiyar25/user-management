const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = function (db) {
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Name, email and password are required" });
      }
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      await db.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, passwordHash]
      );
      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email is already in use" });
      }
      console.error("Error in /register:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    let conn;
    try {
      conn = await db.getConnection();
      conn.connection.config.enableKeepAlive = true;

      await conn.query("UPDATE users SET last_login = NOW() WHERE email = ?", [
        email,
      ]);

      const [rows] = await conn.query(
        "SELECT id, password, status FROM users WHERE email = ?",
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const user = rows[0];
      if (user.status === "blocked") {
        return res.status(403).json({ message: "Account is blocked" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      return res.json({ token });
    } catch (err) {
      console.error("Error in /login:", err);
      return res.status(500).json({ message: "Server error" });
    } finally {
      if (conn) conn.release();
    }
  });

  return router;
};
