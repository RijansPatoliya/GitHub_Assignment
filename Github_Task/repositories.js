const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "mongodb://127.0.0.1:27017";
const dbName = "gitHub_Task";

app.use(express.json());
app.use(cors());

let db, repositories;

function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            repositories = db.collection("repositories");

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

// Get all repositories
app.get("/repositories", async (req, res) => {
    try {
        const allRepositories = await repositories.find().toArray();
        res.status(200).json(allRepositories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific repository by repoId
app.get("/repositories/:repoId", async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const repository = await repositories.findOne({ repoId });

        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.status(200).json(repository);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new repository
app.post("/repositories", async (req, res) => {
    try {
        const newRepo = req.body;

        // Ensure repoId is provided, if not, respond with an error
        if (!newRepo.repoId) {
            return res.status(400).json({ error: "repoId is required" });
        }

        // Insert the new repository document into the collection
        const result = await repositories.insertOne({
            ...newRepo,
            createdAt: new Date()  // Ensure createdAt is set
        });

        res.status(201).json({
            message: "Repository created successfully",
            id: result.insertedId  // Return the ObjectId generated by MongoDB
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a repository's details
app.patch("/repositories/:repoId", async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const updates = req.body;

        // Update the repository document by repoId
        const result = await repositories.updateOne({ repoId }, { $set: updates });

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Repository not found or no changes made" });
        }

        res.status(200).json({ message: `${result.modifiedCount} repository updated` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a repository
app.delete("/repositories/:repoId", async (req, res) => {
    try {
        const repoId = req.params.repoId;

        // Delete the repository document by repoId
        const result = await repositories.deleteOne({ repoId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.status(200).json({ message: `${result.deletedCount} repository deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
