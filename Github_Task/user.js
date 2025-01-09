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

let db, users;

// Connect to MongoDB and initialize collections
function initializeDatabase() {
    MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
            db = client.db(dbName);
            users = db.collection("users");

            // Start the server after a successful connection
            app.listen(port, () => {
                console.log(`Server running at http://localhost:${port}`);
            });
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1); // Exit if DB connection fails
        });
}
initializeDatabase();

// Routes

// GET: List all users
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

// GET: Get a user by userId
app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the userId is a valid ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send("Invalid ID format");
        }

        // Query the user by _id
        const user = await users.findOne({ _id: new ObjectId(userId) });
        
        // If the user is not found, return a 404 error
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Return the user data
        res.status(200).json(user);
    } catch (err) {
        res.status(500).send("Error fetching user: " + err.message);
    }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        
        // Insert the new user into the collection
        const result = await users.insertOne(newUser);
        
        // Return the ID of the inserted user
        res.status(201).send(`User added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});

// PATCH: Update a user's profile (partially)
app.patch('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        // Check if the userId is a valid ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send("Invalid ID format");
        }

        // Update the user's details
        const result = await users.updateOne({ _id: new ObjectId(userId) }, { $set: updates });
        
        if (result.modifiedCount === 0) {
            return res.status(404).send("User not found or no changes made");
        }

        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});

// DELETE: Delete a user
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the userId is a valid ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send("Invalid ID format");
        }

        // Delete the user by _id
        const result = await users.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});
