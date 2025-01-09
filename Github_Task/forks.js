const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

// Middleware
app.use(express.json());
app.use(cors());

let db, forks;

// MongoDB connection and setup
function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            forks = db.collection("forks");  // Access the "forks" collection

            // Start the server after successful connection
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1);  // Exit if DB connection fails
        });
}

initializeDatabase();

app.post("/forks", async (req, res) => {
    try {
      await db.collection("forks").insertOne(req.body);
      res.status(201).json({ message: "Fork created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  