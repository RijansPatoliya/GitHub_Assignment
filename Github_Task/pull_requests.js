const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

app.use(express.json());
app.use(cors());

let db, pullRequests;

function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            pullRequests = db.collection("pullRequests");

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

// Get all pull requests for a specific repository
app.get("/repositories/:repoId/pull-requests", async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const pullRequestsList = await db.collection("pullRequests").find({ repoId }).toArray();
        res.status(200).json(pullRequestsList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new pull request
app.post("/pull-requests", async (req, res) => {
    try {
        const newPullRequest = req.body;

        // Generate a unique ID for the pull request if not already provided
        newPullRequest._id = new ObjectId(); // MongoDB will use this as the default _id field

        await db.collection("pullRequests").insertOne(newPullRequest);
        res.status(201).json({ message: "Pull request created successfully", prId: newPullRequest._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/pull-requests/:prId", async (req, res) => {
    try {
        const prId = req.params.prId;

        // Check if prId is a valid ObjectId format
        if (!ObjectId.isValid(prId)) {
            return res.status(400).json({ error: "Invalid ObjectId format" });
        }

        // Convert prId to ObjectId for MongoDB query
        const objectId = new ObjectId(prId);

        // Delete the pull request by prId
        const result = await db.collection("pullRequests").deleteOne({ prId: objectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Pull request not found" });
        }

        res.status(200).json({ message: "Pull request deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


