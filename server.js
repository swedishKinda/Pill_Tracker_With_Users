// Load HTTP module
// const http = require("http");
const express = require("express");
const app = express();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = (jQuery = require("jquery")(window));

app.use(express.static("public"));

// Define a route for the root path ('/')
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "password",
  database: "pillTracker",
});

connection.connect();

app.use(express.json());

dotenv.config();

// app.post("/api/pills", (req, res) => {
//   const { name, amount } = req.body;

//   const query = "INSERT INTO pills (name, amount) VALUES ('y', 2)";
//   connection.query(query, [name, amount], (error, results) => {
//     if (error) {
//       console.error("Error inserting data:", error);
//       res.status(500).send("Error inserting data");
//     } else {
//       console.log("Data inserted successfully:", results);
//       res.status(200).send("Data inserted successfully");
//     }
//   });
// });

app.get("/api/pills", (req, res) => {
  const query = "select * from pills;";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("Error inserting data");
    } else {
      console.log("Data retrieved successfully: ", results);
      res.status(200).send(results);
    }
  });
});

app.post("/submit1", (req, res) => {
  const { name, amount } = req.body;
  const sql = "INSERT INTO pills (name, amount) VALUES (?, ?)";
  connection.query(sql, [name, amount], (err, result) => {
    if (err) throw err;
    res.send("Data inserted...");
  });
});

app.delete("/submit2", (req, res) => {
  const { name } = req.body;
  const sql = "delete from pills where name=?";

  connection.query(sql, name, (err, res) => {
    // if (err) throw err;
    // res.send("Data deleted...");
  });
});

// app.delete('/api/pills', (req, res) => {
//   const id = req.params.id; // Extract the id from the URL

//   // Assuming you're using a database library like Sequelize or raw SQL
//   const query = 'DELETE FROM pills'; // Use your actual table name

//   connection.query(query, [id], (error, results) => {
//       if (error) {
//           return res.status(500).send('Error deleting items');
//       }
//       res.status(200).send('Items deleted successfully');
//   });
// });

// Register route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error creating user" });
      }
      res.status(201).json({ message: "User registered" });
    }
  );
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    }
  );
});

// Register route with table creation
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error creating user" });
      }

      const userId = results.insertId;
      const tableName = `user_table_${userId}`;
      const createTableQuery = `CREATE TABLE ${tableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(20) NOT NULL,
          amount INT NOT NULL
      )`;

      db.query(createTableQuery, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error creating user table" });
        }
        res.status(201).json({ message: "User registered and table created" });
      });
    }
  );
});

// Middleware to authenticate users
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create data in user table
app.post("/user-data", authenticateJWT, (req, res) => {
  const { data } = req.body;
  const tableName = `user_table_${req.user.id}`;

  db.query(`INSERT INTO ${tableName} (data) VALUES (?)`, [data], (err) => {
    if (err) {
      return res.status(500).json({ message: "Error inserting data" });
    }
    res.status(201).json({ message: "Data added to user table" });
  });
});

// Get user table data
app.get("/user-data", authenticateJWT, (req, res) => {
  const tableName = `user_table_${req.user.id}`;

  db.query(`SELECT * FROM ${tableName}`, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving data" });
    }
    res.json(results);
  });
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database!");
});
