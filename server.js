const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin"); // Firebase Admin SDK
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Firebase initialization
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf-8")
);
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://s3curevau1t-default-rtdb.firebaseio.com",
});
const db = admin.database(); // Reference to the Firebase Realtime Database
// Redirect root URL to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Endpoints
// Passwords
app.get("/passwords/:email", async (req, res) => {
  const { email } = req.params;
  const searchTerm = req.query.searchTerm || "";
  try {
    const snapshot = await db
      .ref("passwords")
      .orderByChild("user_email")
      .equalTo(email)
      .once("value");
    let passwords = [];
    snapshot.forEach((childSnapshot) => {
      const password = childSnapshot.val();
      if (
        !searchTerm ||
        password.siteName.includes(searchTerm) ||
        password.username.includes(searchTerm)
      ) {
        passwords.push({ ...password, id: childSnapshot.key });
      }
    });
    res.json(passwords);
  } catch (error) {
    console.error("Error fetching passwords:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/passwords", async (req, res) => {
  const { user_email, siteName, username, password } = req.body;
  try {
    const newPasswordRef = await db
      .ref("passwords")
      .push({ user_email, siteName, username, password });
    res.json({ id: newPasswordRef.key });
  } catch (error) {
    console.error("Error creating password:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/passwords/:id", async (req, res) => {
  const { id } = req.params;
  const { siteName, username, password } = req.body;
  try {
    await db.ref(`passwords/${id}`).update({ siteName, username, password });
    res.json({ changes: 1 }); // Indicate success
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/passwords/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.ref(`passwords/${id}`).remove();
    res.json({ changes: 1 }); // Indicate success
  } catch (error) {
    console.error("Error deleting password:", error);
    res.status(500).json({ error: error.message });
  }
});

// Messages part starts here
// Function to generate a random 6-digit code
// Create Chat Endpoint
app.post("/chats", async (req, res) => {
  const { user_email } = req.body;
  let chat_id = generateChatId();
  try {
    const snapshot = await db.ref("chats").child(chat_id).once("value");
    if (snapshot.exists()) {
      chat_id = generateChatId();
    }
    await db.ref("chats").child(chat_id).set({ creator_email: user_email });
    res.json({ chat_id: chat_id });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: "Failed to create chat ID" });
  }
});

// Join Chat Endpoint
app.get("/chats/:chat_id", async (req, res) => {
  const { chat_id } = req.params;
  try {
    const snapshot = await db.ref(`chats/${chat_id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.json({ chat_id: chat_id });
  } catch (error) {
    console.error("Error getting chat:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Send Message Endpoint
app.post("/messages", async (req, res) => {
  const { chat_id, sender, content } = req.body;
  try {
    const newMessageRef = await db.ref(`messages/${chat_id}`).push({
      sender,
      content,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.json({ id: newMessageRef.key });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Load Messages Endpoint (for initial load)
app.get("/messages/:chat_id", async (req, res) => {
  const { chat_id } = req.params;
  try {
    const snapshot = await db
      .ref(`messages/${chat_id}`)
      .orderByChild("timestamp")
      .limitToLast(50)
      .once("value");
    let messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    res.json(messages);
  } catch (error) {
    console.error("Error loading messages:", error);
    return res.status(500).json({ error: error.message });
  }
});

function generateChatId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});