const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Replace with your MySQL username
    password: "", // Replace with your MySQL password
    database: "sweet_cafe" // Replace with your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1); // Exit if connection fails
    }
    console.log('Connected to the database.');

    // Create `orders` table if not exists
    const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            menu_item VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            special_requests TEXT,
            delivery_option ENUM('pickup', 'delivery') NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createOrdersTable, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        } else {
            console.log('Orders table is ready.');
        }
    });

    // Create `feedback` table if not exists
    const createFeedbackTable = `
        CREATE TABLE IF NOT EXISTS feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            rating INT NOT NULL,
            comments TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createFeedbackTable, (err) => {
        if (err) {
            console.error('Error creating feedback table:', err.message);
        } else {
            console.log('Feedback table is ready.');
        }
    });
});

// Handle feedback form submission
app.post('/submit-feedback', (req, res) => {
    const { name, email, rating, comments } = req.body;

    // Validate the input
    if (!name || !email || !rating || !comments) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Insert feedback into the database
    const sql = `INSERT INTO feedback (name, email, rating, comments) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, rating, comments], (err, result) => {
        if (err) {
            console.error('Error inserting feedback:', err.message);
            return res.status(500).json({ error: 'Failed to submit feedback. Please try again later.' });
        }
        res.status(200).json({ message: 'Thank you for your feedback!' });
    });
});

// Handle order form submission
app.post('/place-order', (req, res) => {
    const { name, email, phone, menu_item, quantity, special_requests, delivery_option, address } = req.body;

    // Validate the input
    if (!name || !email || !phone || !menu_item || !quantity || !delivery_option) {
        return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    // Insert order into the database
    const sql = `INSERT INTO orders (name, email, phone, menu_item, quantity, special_requests, delivery_option, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, phone, menu_item, quantity, special_requests, delivery_option, address || null], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err.message);
            return res.status(500).json({ error: 'Failed to place the order. Please try again later.' });
        }
        res.status(200).json({ message: 'Your order has been placed successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
