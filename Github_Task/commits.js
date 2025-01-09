const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

app.use(express.json());
app.use(cors());

let db, commits;

function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            commits = db.collection("commits");

            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1);
        });
}

initializeDatabase();

// GET /repositories/:repoId/commits - Fetch all commits for a repository
app.get("/repositories/:repoId/commits", async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const commitsList = await commits.find({ repoId }).toArray();
        res.status(200).json(commitsList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /commits - Create a new commit
app.post("/commits", async (req, res) => {
    try {
        const { commitId, repoId, userId, message } = req.body;
        const createdAt = new Date();
        const newCommit = { commitId, repoId, userId, message, createdAt };

        await commits.insertOne(newCommit);
        res.status(201).json({ message: "Commit created successfully", commit: newCommit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /commits/:commitId - Delete a commit by its commitId
app.delete("/commits/:commitId", async (req, res) => {
    try {
        const commitId = req.params.commitId;
        
        // Delete the commit by commitId (assuming commitId is a string)
        const result = await commits.deleteOne({ commitId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Commit not found" });
        }

        res.status(200).json({ message: "Commit deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

