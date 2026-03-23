import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { username, pass } = req.body;

    if (!username || !pass) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    console.log(username);
    console.log(hashedPassword);

    await pool.query(
      "INSERT INTO login (username, password_hash) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, pass } = req.body;

    if (!username || !pass) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const users = await pool.query("SELECT * FROM login WHERE username = $1", [
      username,
    ]);

    if (users.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username" });
    }

    const valid = await bcrypt.compare(pass, users.rows[0].password_hash);
    if (valid) {
      const token = jwt.sign({ username: users.rows[0].id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("Token sent", token);
      await pool.query(
        "UPDATE login SET current_tracker = $1 WHERE username = $2",
        [token, username]
      );
      res.json({ token });
    } else {
      return res.status(401).json({ error: "Invalid password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};