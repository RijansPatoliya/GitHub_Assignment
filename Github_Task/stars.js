const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

// Middleware
app.use(express.json());
app.use(cors());

let db, stars;

// MongoDB connection and setup
function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            stars = db.collection("stars");  // Access the "stars" collection

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
    
app.post("/stars", async (req, res) => {
    try {
      await db.collection("stars").insertOne(req.body);
      res.status(201).json({ message: "Repository starred successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  