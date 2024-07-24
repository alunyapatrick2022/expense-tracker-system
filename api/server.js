const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors());
dotenv.config();

//connection to the db
const db = mysql.createConnection({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME
});

//check if connection works
db.connect((err) => {
     if (err) return console.log("Error connecting to database.");

     console.log("Connected to MySQL as id:", db.threadId);
})

//users registration route
app.post('/api/register', async (req, res) => {
     try {
          const users = `SELECT * FROM users WHERE email = ?`
          //check if user exists
          db.query(users, [req.body.email], (err, data) => {
               if (data.length) return res.status(409).json("User already exists");

               //Password Hashing
               const salt = bcrypt.genSaltSync(10)
               const hashedPassword = bcrypt.hashSync(req.body.password, salt)

               const newUser = `INSERT INTO users(email, username, password) VALUES(?)`
               value = [
                    req.body.email,
                    req.body.username,
                    hashedPassword
               ]
               
               db.query(newUser, [value], (err, data) => {
                    if (err) return res.status(400).json("Something went wrong")
                    
                    return res.status(200).json("User created successfully")
               });
          })
     }
     catch (err) {
          res.status(500).json("Internal Server Error")
     }
})

//user login route
app.post('/api/login', async (req, res) => {
     try {
          const users = `SELECT * FROM users WHERE email = ?`
          db.query(users, [req.body.email], (err, data) => { 
               if (data.length === 0) return res.status(404).json("User not found");

               const isPasswordvalid = bcrypt.compareSync(req.body.password, data[0].password);

               if (!isPasswordvalid) return res.status(400).json("Invalid email or password");

               // return res.status(200).json("Login Successful");
               return res.sendFile(path.join(__dirname, + '/index.html'));
          })

     }
     catch (err) {
          res.status(500).json("Internal Server error");
     }
})

app.listen(5000, () => {
     console.log("Server is running on port 5000")
})