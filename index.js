const express = require('express');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not provided in the environment variables


require('dotenv').config();

const database = mysql.createConnection({
    host: process.env.DB_HOST, // Change to the IP or hostname if MySQL is running in a different container
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

database.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/init', (req, res) => {
    const sqlQuery = 'CREATE TABLE IF NOT EXISTS emails(id int AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50), PRIMARY KEY(id))';

    database.query(sqlQuery, (err) => {
        if (err) throw err;

        res.send('Table created!')
    });
});

app.post('/subscribe',
    body('email').isEmail().normalizeEmail(),
    body('firstname').not().isEmpty().escape(),
    body('lastname').not().isEmpty().escape(),
    (req, res) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (errors.array().length > 0) {
            res.send(errors.array());
        } else {
            const subscriber = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email
            };

            const sqlQuery = 'INSERT INTO emails SET ?';

            database.query(sqlQuery, subscriber, (err, row) => {
                if (err) throw err;

                res.send('Subscribed successfully!');
            });
        }
    });


app.get('/', (req, res) => {
    const sqlQuery = 'SELECT * FROM emails';

    database.query(sqlQuery, (err, result) => {
        if (err) throw err;

        res.json({ 'emails': result });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});