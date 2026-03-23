import pool from "../config/db.js";

export const getUsername = async (req, res) => {
  try {
    const userId = req.userId;

    let username = await pool.query(
      "SELECT username FROM login WHERE id = $1",
      [userId]
    );
    username = username.rows[0].username;

    res.json({ name: username });
  } catch (err) {
    console.error("Get username error:", err.message);
    res.status(500).json({ error: "Failed to fetch username" });
  }
};