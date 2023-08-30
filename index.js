const express = require('express');
const mysql = require('mysql');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not provided in the environment variables


require('dotenv').config();

const database = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});