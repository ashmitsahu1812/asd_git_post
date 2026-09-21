const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

// POST /assignments - Create a new assignment
app.post("/assignments", async (req, res) => {
  try {
    const { title, deadline } = req.body;
    const result = await pool.query(
      "INSERT INTO assignments (title, deadline) VALUES ($1, $2) RETURNING *",
      [title, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /assignments - View all assignments (supports ?submitted=true filter)
app.get("/assignments", async (req, res) => {
  try {
    const { submitted } = req.query;

    let result;
    if (submitted === "true") {
      result = await pool.query(
        "SELECT * FROM assignments WHERE submitted = $1 ORDER BY id DESC",
        [true]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM assignments ORDER BY id DESC"
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /assignments/:id - Mark assignment as submitted
app.patch("/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE assignments SET submitted = true WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /assignments/:id - Delete an assignment
app.delete("/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM assignments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({
      message: "Assignment deleted successfully",
      assignment: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
