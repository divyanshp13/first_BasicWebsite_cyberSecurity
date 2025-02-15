const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors'); // Required for cross-origin requests

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
const path = require("path");

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Redirect root URL to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Database connection
const db = new sqlite3.Database('./passwords.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the password database.');
});

// Create passwords table
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT, siteName TEXT, username TEXT, password TEXT)');
});

// API Endpoints (see details below)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get('/passwords/:email', (req, res) => {
    const { email } = req.params;
    const searchTerm = req.query.searchTerm || ''; // Optional search term

    let sql = 'SELECT * FROM passwords WHERE user_email = ?';
    let params = [email];

    if (searchTerm) {
      sql += ' AND (siteName LIKE ? OR username LIKE ?)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });

  app.post('/passwords', (req, res) => {
    const { user_email, siteName, username, password } = req.body;
    const sql = 'INSERT INTO passwords (user_email, siteName, username, password) VALUES (?, ?, ?, ?)';
    const params = [user_email, siteName, username, password];

    db.run(sql, params, function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
  });
  app.put('/passwords/:id', (req, res) => {
    const { id } = req.params;
    const { siteName, username, password } = req.body;
    const sql = 'UPDATE passwords SET siteName = ?, username = ?, password = ? WHERE id = ?';
    const params = [siteName, username, password, id];

    db.run(sql, params, function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
  });

  app.delete('/passwords/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM passwords WHERE id = ?';
    const params = [id];

    db.run(sql, params, function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
  });









  //Messages part starts here


  // server.js (additions)

// Function to generate a random 6-digit code
function generateChatId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create Chat Endpoint
app.post('/chats', (req, res) => {
    const { user_email } = req.body;
    let chat_id = generateChatId();

    // Ensure the generated chat_id is unique
    const checkChatIdSql = 'SELECT chat_id FROM chats WHERE chat_id = ?';
    db.get(checkChatIdSql, [chat_id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to generate chat ID' });
        }

        if (row) {
            // If the chat_id already exists, generate a new one recursively
            chat_id = generateChatId(); // You might want to add a limit to the number of retries
        }
        
        const sql = 'INSERT INTO chats (chat_id, creator_email) VALUES (?, ?)';
        db.run(sql, [chat_id, user_email], function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ chat_id: chat_id });
        });
    });
});



// Join Chat Endpoint
app.get('/chats/:chat_id', (req, res) => {
    const { chat_id } = req.params;
    const sql = 'SELECT chat_id FROM chats WHERE chat_id = ?';
    db.get(sql, [chat_id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        res.json({ chat_id: row.chat_id });
    });
});


// Send Message Endpoint
app.post('/messages', (req, res) => {
    const { chat_id, sender, content } = req.body;
    const sql = 'INSERT INTO messages (chat_id, sender, content) VALUES (?, ?, ?)';
    db.run(sql, [chat_id, sender, content], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Load Messages Endpoint
app.get('/messages/:chat_id', (req, res) => {
    const { chat_id } = req.params;
    const sql = 'SELECT id, sender, content, timestamp FROM messages WHERE chat_id = ? ORDER BY timestamp ASC';  //Order by timestamp for chronological order
    db.all(sql, [chat_id], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

