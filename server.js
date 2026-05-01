const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("./database.db");

// Middleware
app.use(express.json());
app.use(express.static("views"));

// Create table (if not exists)
db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price INTEGER,
  image TEXT
)
`);

// Remove duplicates (runs once on server start)
db.run(`
DELETE FROM products
WHERE id NOT IN (
  SELECT MIN(id)
  FROM products
  GROUP BY name, price, image
)
`);

// Add product API
app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;

  // Validation
  if (!name || !price || !image) {
    return res.status(400).send("All fields required!");
  }

  db.run(
    "INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
    [name, price, image],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send("Product Added Successfully!");
    }
  );
});

// Get all products API
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ IMPORTANT: Dynamic port for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});