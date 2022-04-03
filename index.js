const user_index = 1
const settings = require('./settings.json')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


const mysql = require("mysql")
const {response} = require("express");
const db_connection = mysql.createConnection({
    host: settings.database.host,
    user: settings.database.user[user_index].user,
    password: settings.database.user[user_index].password,
    database: settings.database.database
})
db_connection.connect((err) => {
    if(err) throw err
    console.log("Database connected")
})

let utilities = require('./utilities')
utilities.query = async function query(sql) {
    return new Promise((resolve, reject) => {
        db_connection.query(sql, (error, result) => {
            resolve({result: result, error: error})
        })
    })
}
utilities.app = app

require('./root/_')
require('./challenge/_')

app.all(/.*/, (req, res) => {
    res.json({
        flag: "failure",
        msg: ["error 404"]
    })
})

app.listen(settings.server.port, settings.server.host, () => {
    console.log(`Server running on: ${settings.server.host}:${settings.server.port}`)
})