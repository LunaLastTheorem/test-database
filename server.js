const express = require('express');
const app = express();
const mysql = require('mysql2/promise'); // Using mysql2/promise to work with async/await
const path = require('path');
require('dotenv').config();

let pool;

// Database connection
async function connectToDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        await pool.getConnection(); // Test the connection
        console.log('Connected to database.');
    } catch (error) {
        console.error('Database connection failed: ' + error.stack);
    }
}

app.get('/status', (req, res) => {
    if (pool) {
        res.send('Connected to database');
    } else {
        res.send('Not connected to database');
    }
});

connectToDatabase();

// Serve static files (HTML, CSS, client-side JavaScript)
app.use(express.static(path.join(__dirname, '')));

// Search endpoint
app.get('/search', async (req, res) => {
    console.log('Received search request:', req.query);
    const primaryKey = req.query.primary_key;
    const sql = `SELECT * FROM episodes WHERE season = ?;`;

    try {
        const [rows, fields] = await pool.query(sql, [primaryKey]);
        console.log('Rows:', rows); // Add this line

        if (rows.length > 0) {
            let tableHtml = '<table border="1">';
            tableHtml += '<tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr>'; // Add more headers as needed

            rows.forEach(row => {
                tableHtml += `<tr><td>${row.column1}</td><td>${row.column2}</td><td>${row.column3}</td></tr>`; // Add more columns as needed
            });

            tableHtml += '</table>';
            res.send(tableHtml);
        } else {
            res.send('No results found.');
        }
    } catch (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
