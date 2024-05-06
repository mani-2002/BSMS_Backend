// server.js

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connection URL
const url = "mongodb://127.0.0.1:27017/bookstore";

// Database Name
const dbName = "bookstore";

// Function to connect to MongoDB
async function connectDB() {
  const client = await MongoClient.connect(url);
  return client.db(dbName);
}

// Route to fetch books
app.get("/api/books", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("books");
    const books = await collection.find().toArray();
    res.json(books);
  } catch (error) {
    console.error("Error occurred while fetching books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to add a book
app.post("/api/books", async (req, res) => {
  try {
    const { bookName, authorName } = req.body;
    const db = await connectDB();
    const collection = db.collection("books");
    const result = await collection.insertOne({ bookName, authorName });
    res
      .status(201)
      .json({ message: "Book added successfully", bookId: result.insertedId });
  } catch (error) {
    console.error("Error occurred while adding book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("books");
    const { id } = req.params;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ message: "Book deleted successfully" });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.error("Error occurred while deleting book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to update a book
app.put("/api/books/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("books");
    const { bookName, authorName } = req.body;
    const { id } = req.params;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { bookName, authorName } }
    );
    if (result.modifiedCount === 1) {
      res.json({ message: "Book updated successfully" });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
