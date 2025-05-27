const jwt = require("jsonwebtoken");

function authMiddleware(db) {
  return async function (req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.id;
      const [rows] = await db.execute(
        "SELECT id, status FROM users WHERE id = ?",
        [userId]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }
      const user = rows[0];
      if (user.status === "blocked") {
        return res.status(401).json({ message: "User is blocked" });
      }
      req.user = { id: userId };
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;
