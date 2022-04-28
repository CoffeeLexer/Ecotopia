const settings = require('./settings.json')

const express = require('express')
const app = express()
const cookie_parser = require('cookie-parser')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie_parser())

const mysql = require("mysql")
let scripts = require('./scripts')

let db_con = undefined

function connectDatabase() {
    db_con = mysql.createConnection(settings.database)

    db_con.connect((error) => {
        if(error) {
            console.log(`error when connecting to db: ${error}`);
            setTimeout(connectDatabase, 2000);
        }
    });

    db_con.on(`error`, (error) => {
        console.log(`db error: ${error.code}`);
        if(error.code === "PROTOCOL_CONNECTION_LOST" || error.code === "ECONNRESET") {
            console.log(`Connection lost. Reestablishing connection(${error.code}).`)
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

async function hearth_beat() {

}

const utilities = require('./utilities')

async function authenticate(req, res, next) {
    let key = req.cookies.key
    if(key === undefined) return res.status(401).send('You are not logged in! (No key)')
    let response = await utilities.query(`select * from cookies where cookie = '${key}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.clearCookie('key').status(401).send('You are not logged in!')
    res.locals.account_id = response.result[0].fk_account
    return next()
}

app.post(/\/challenge\/.*/, authenticate)
app.post('/public/profile', authenticate)

const publicRoute = require('./route/public')
app.use('/public', publicRoute)
const challengeRoute = require('./route/challenge')
app.use('/challenge', challengeRoute)

app.all(/.*/, (req, res) => {
    return res.status(404).send('Route not found!')
})

app.listen(settings.server.port, () => {
    console.log(`Server running on: localhost:${settings.server.port}`)
})