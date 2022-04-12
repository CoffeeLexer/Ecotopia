const user_index = 1
const settings = require('./settings.json')

const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mysql = require("mysql")
let scripts = require('./scripts')

let db_con = undefined

function connectDatabase() {
    db_con = mysql.createConnection({
        host: settings.database.host,
        user: settings.database.user[user_index].user,
        password: settings.database.user[user_index].password,
        database: settings.database.database
    })

    db_con.connect((error) => {
        if(error) {
            console.log(`error when connecting to db: ${error}`);
            setTimeout(connectDatabase, 2000);
        }
    });

    db_con.on(`error`, (error) => {
        console.log(`db error: ${error}`);
        if(error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
            connectDatabase();
        }
        else {
            throw error;
        }
    })

    scripts.query = async function (sql) {
        return new Promise((resolve, reject) => {
            db_con.query(sql, (error, result) => {
                resolve({result: result, error: error})
            })
        })
    }
}

connectDatabase();

let utilities = require('./utilities')
utilities.app = app

require('./root/_')
require('./challenge/_')

app.all(/.*/, (req, res) => {
    res.json({
        flag: "failure",
        msg: ["error 404"]
    })
})

app.listen(settings.server.port, () => {
    console.log(`Server running on: localhost:${settings.server.port}`)
})

