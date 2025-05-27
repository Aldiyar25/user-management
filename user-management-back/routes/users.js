const express = require("express");
const router = express.Router();

module.exports = function (db) {
  router.get("/", async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT id, name, email, status, last_login, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as registered_at
         FROM users
         ORDER BY last_login IS NULL, last_login DESC`
      );
      return res.json(rows);
    } catch (err) {
      console.error("Error in GET /users:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.put("/block", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No user IDs provided" });
      }
      const placeholders = ids.map(() => "?").join(",");
      const params = [...ids];
      await db.execute(
        `UPDATE users SET status='blocked' WHERE id IN (${placeholders})`,
        params
      );
      return res.json({ message: `Blocked ${ids.length} user(s)` });
    } catch (err) {
      console.error("Error in PUT /users/block:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.put("/unblock", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No user IDs provided" });
      }
      const placeholders = ids.map(() => "?").join(",");
      await db.execute(
        `UPDATE users SET status='active' WHERE id IN (${placeholders})`,
        ids
      );
      return res.json({ message: `Unblocked ${ids.length} user(s)` });
    } catch (err) {
      console.error("Error in PUT /users/unblock:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  router.delete("/", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "No user IDs provided" });
      }
      const placeholders = ids.map(() => "?").join(",");
      await db.execute(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
      return res.json({ message: `Deleted ${ids.length} user(s)` });
    } catch (err) {
      console.error("Error in DELETE /users:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
