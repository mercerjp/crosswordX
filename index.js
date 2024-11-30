// index.js
const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_KEY = process.env.JWT_SECRET_KEY;

app.use(express.json()); // Middleware to parse JSON
app.use(express.static('public')); // Front-end app (lightweight)

// POST endpoint for user registration
app.post('/api/v1/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
            if (err) {
                if (err.code === "SQLITE_CONSTRAINT") {
                    return res.status(400).json({ error: "Username already exists" });
                } else {
                    return res.status(500).json({ error: "Database error" });
                }
            }
            res.status(201).json({ message: "User created successfully", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST endpoint for user login to generate a token
app.post('/api/v1/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['x-api-key'];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token." });
    }
}

function extractCSVContent(apiResponse) {
    const csvStartMarker = "```";
    const startIndex = apiResponse.indexOf(csvStartMarker);

    if (startIndex === -1) {
        throw new Error("CSV content not found in the response");
    }

    // Find the second occurrence of the backticks
    const endIndex = apiResponse.indexOf(csvStartMarker, startIndex + 3);
    if (endIndex === -1) {
        throw new Error("Ending backticks not found in the response");
    }

    // Extract the content between the backticks
    let csvContent = apiResponse.substring(startIndex + 3, endIndex).trim();

    // ChatGPT sometimes includes CSV as a word randomly
    csvContent = csvContent.replace(/csv/gi, "").trim();

    return csvContent;
}


// POST endpoint to handle phrase input with token verification
app.post('/api/v1/prompt', verifyToken, async (req, res) => {
    let { phrase, size } = req.body;

    if (!phrase) {
        return res.status(400).json({ error: "Phrase is required" });
    }
    // Default size to 15 if not provided
    size = size || 15;

    try {
        // Prepare a prompt to send to ChatGPT
        const prompt = `Create a ${size}x${size} crossword puzzle themed around "${phrase}".
        Provide ONLY the answers in CSV format with the following headers: "Position, Answer, Clue".
        The answers must be for both Across and Down clues, and each answer should match the crossword's theme.`;

        // Make a request to OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [{"role": "user", "content": prompt}],
            temperature: 0.2,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract and clean the CSV from the API response
        const apiResponse = response.data.choices[0].message.content;
        console.log(apiResponse)
        const csvContent = extractCSVContent(apiResponse);

        // Send the cleaned CSV as the response payload
        return res.status(200).json({ csv: csvContent });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
