const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

app.use(express.json());
app.use(cors());

let db, issues;

function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            issues = db.collection("issues");

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

// Create a new issue
app.post('/issues', async (req, res) => {
    try {
        const newIssue = req.body;
        const result = await issues.insertOne(newIssue);
        res.status(201).json({ message: "Issue created successfully", issueId: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all issues for a specific repository
app.get('/repositories/:repoId/issues', async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const allIssues = await issues.find({ repoId }).toArray();
        res.status(200).json(allIssues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update an issue's details (e.g., status, assigned user)
app.patch('/issues/:issueId', async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const updates = req.body;

        const result = await issues.updateOne({ issueId }, { $set: updates });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Issue not found or no changes made" });
        }

        res.status(200).json({ message: "Issue updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a comment to an issue
app.post('/issues/:issueId/comments', async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const { userId, comment } = req.body;
        const newComment = { userId, comment, createdAt: new Date() };

        const result = await issues.updateOne(
            { issueId },
            { $push: { comments: newComment } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.status(200).json({ message: "Comment added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an issue
app.delete('/issues/:issueId', async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const result = await issues.deleteOne({ issueId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.status(200).json({ message: "Issue deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
