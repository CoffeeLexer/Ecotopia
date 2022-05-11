const settings = require('./settings.json');
const express = require('express');
const app = express()
const cookie_parser = require('cookie-parser')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie_parser())

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)


app.get('/meeting/chat', (req, res) => {
    res.sendFile(__dirname + '/socket_io/meeting_chat.html');
});
app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/socket_io/error.html');
});

io.of('/error').on('connection', (socket) => {

})

io.of('/meeting/chat').on('connection', (socket) => {
    socket.logged_rooms = {}
    socket.on('join', async (data) => {
        if(data.meeting_id && data.cookie) {
            // Find auth cookie
            let response = await utilities.query(`select * from cookies where cookie = '${data.cookie}'`)
            if(response.result.length !== 1) return io.of('/error').emit('log', `${socket.id} Account not found!`)
            // Get profile
            response = await utilities.query(`select * from profile where id = '${response.result[0].fk_account}'`)
            let user = response.result[0]
            // Check if account has access to meetings chat
            response = await utilities.query(`select * from attendee where fk_account = '${user.id}' and fk_meeting = '${data.meeting_id}'`)
            if(response.result.length !== 1) return io.of('/error').emit('log', `${socket.id} Account is not attending this meeting!`)
            socket.logged_rooms[data.meeting_id] = {user: user, auth: data.cookie}
            socket.join(data.meeting_id)
            socket.to(data.meeting_id).emit('user_joined', user)
        }
        else {
            io.of('/error').emit('log', `${socket.id} JOIN Struct not met {meeting_id: id of meeting, cookie: accounts auth cookie}`)
        }
    })
    socket.on('message', async (data) => {
        if(data.meeting_id) {
            if(socket.rooms.has(data.meeting_id)) {
                if(!data.message) return io.of('/error').emit('log', `${socket.id} MESSAGE, text of message is empty!`)
                socket.to(data.meeting_id).emit('message', {user: socket.logged_rooms[data.meeting_id].user, message: data.message})
                await utilities.query(`insert into meeting_message(content, fk_account, fk_meeting) value ('${data.message}', '${socket.logged_rooms[data.meeting_id].user.id}', '${data.meeting_id}')`)
            }
            else
                io.of('/error').emit('log', `${socket.id} MESSAGE socket has NOT joined this meeting! (refer to 'join')`)
        }
        else {
            io.of('/error').emit('log', `${socket.id} MESSAGE 'meeting_id' not specified!`)
        }
    })
    socket.on('start_typing', (data) => {
        if(data.meeting_id) {
            if(socket.rooms.has(data.meeting_id)) {
                socket.to(data.meeting_id).emit('start_typing', socket.logged_rooms[data.meeting_id].user)
            }
            else
                io.of('/error').emit('log', `${socket.id} START_TYPING socket has NOT joined this meeting! (refer to 'join')`)
        }
        else {
            io.of('/error').emit('log', `${socket.id} START_TYPING 'meeting_id' not specified!`)
        }
    })
    socket.on('end_typing', (data) => {
        if(data.meeting_id) {
            if(socket.rooms.has(data.meeting_id)) {
                socket.to(data.meeting_id).emit('end_typing', socket.logged_rooms[data.meeting_id].user)
            }
            else
                io.of('/error').emit('log', `${socket.id} END_TYPING socket has NOT joined this meeting! (refer to 'join')`)
        }
        else {
            io.of('/error').emit('log', `${socket.id} END_TYPING 'meeting_id' not specified!`)
        }
    })
    socket.on('leave', (data) => {
        if(data.meeting_id) {
            if(socket.rooms.has(data.meeting_id)) {
                socket.logged_rooms[data.meeting_id] = undefined
                socket.leave(data.meeting_id)
                socket.to(data.meeting_id).emit('user_left', user)
            }
            else
                io.of('/error').emit('log', `${socket.id} LEAVE account has not joined the meeting beforehand!`)
        }
        else {
            io.of('/error').emit('log', `${socket.id} LEAVE 'meeting_id' not included!`)
        }
    })
    socket.on('disconnect', msg => {
    })
})




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

const utilities = require('./utilities')

async function heartbeat() {
    await utilities.query('select 1')
    console.log(`${utilities.now()}: heartbeat`)
    setTimeout(heartbeat, 1000)
}


async function authenticate(req, res, next) {
    let key = req.cookies.key
    if(key === undefined) return res.status(401).send('You are not logged in! (No key)')
    let response = await utilities.query(`select * from cookies where cookie = '${key}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.clearCookie('key').status(401).send('You are not logged in!')
    res.locals.account_id = response.result[0].fk_account
    return next()
}

function test_1(req, res, next) {
    console.log(`Test 1: ${req.url}`)
    next()
}
function test_2(req, res, next) {
    console.log(`Test 2: ${req.url}`)
    next()
}

app.get('/test', test_1, test_2)

app.post(/\/challenge\/.*/, authenticate)
app.post('/public/profile', authenticate)
app.post('/meeting/create', authenticate)
app.post('/meeting/join', authenticate)
app.post('/meeting/leave', authenticate)
app.post('/profile', authenticate)

app.use('/public', require('./route/public'))
app.use('/profile', require('./route/profile'))
app.use('/challenge', require('./route/challenge'))
app.use('/meeting', require('./route/meeting'))

app.all(/.*/, (req, res) => {
    return res.status(404).send('Route not found!')
})

server.listen(settings.server.port, () => {
    console.log(`Server running on: localhost:${settings.server.port}`)
})