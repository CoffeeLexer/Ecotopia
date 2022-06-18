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


const utilities = require('./utilities')


app.all(/.*/, (req, res, next) => {
    let time = utilities.now()
    time = time.substring(time.indexOf(' '))
    io.of('/debug').emit('log', `${time} ${req.method} ${req.url}`)
    next()
})

const email = require('./email')
const db = require('./database')
app.get('/test', async (req, res, next) => {
    email.send("eduardasvitkus@outlook.com", "Death", "Is impending")
    res.send('Done')
})

app.get('/meeting/chat', (req, res) => {
    res.sendFile(__dirname + '/socket_io/client/meeting_chat.html');
});
app.get('/error', (req, res) => {
    res.sendFile(__dirname + '/socket_io/client/error.html');
});
app.get('/debug', (req, res) => {
    res.sendFile(__dirname + '/socket_io/client/debug.html');
});
app.get('/notification', (req, res) => {
    res.sendFile(__dirname + '/socket_io/client/notification.html');
});

io.of('/error').on('connection', (socket) => {

})
io.of('/debug').on('connection', (socket) => {

})

io.of('/notification').use(async (socket, next) => {
    const cookie = socket.handshake.auth.cookie;
    let result = await db.query(`select * from cookies where cookie = '${cookie}'`)
    if(result.length !== 1) {
        console.log("no account")
        return next(new Error('Account not found!'))
    }
    socket.account = result[0].fk_account
    next();
});
io.of('/notification').on('connection', (socket) => {
})


io.of('/meeting/chat').on('connection', (socket) => {
    socket.logged_rooms = {}
    socket.on('join', async (data) => {
        if(data.meeting_id && data.cookie) {
            // Find auth cookie
            let result = await utilities.query(`select * from cookies where cookie = '${data.cookie}'`)
            if(result.length !== 1) return io.of('/error').emit('log', `${socket.id} Account not found!`)
            // Get profile
            result = await utilities.query(`select * from profile where id = '${result[0].fk_account}'`)
            let user = result.result[0]
            // Check if account has access to meetings chat
            result = await utilities.query(`select * from participant where fk_account = '${user.id}' and fk_execution = '${data.meeting_id}'`)
            if(result.length !== 1) return io.of('/error').emit('log', `${socket.id} Account is not attending this meeting!`)
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
                await utilities.query(`insert into execution_message(content, fk_account, fk_meeting) value ('${data.message}', '${socket.logged_rooms[data.meeting_id].user.id}', '${data.meeting_id}')`)
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
})

app.use('/public', require('./route/public'))
app.use('/profile', require('./route/profile'))
app.use('/challenge', require('./route/challenge'))
app.use('/execution', require('./route/execution'))
app.use('/meeting', require('./route/meeting'))
app.use('/bookmark', require('./route/bookmark'))
app.use('/resource', require('./route/resource'))
app.use('/notification', require('./route/notification'))
app.use('/claim', require('./route/claim'))
app.use('/post', require('./route/post'))

app.all(/.*/, (req, res) => {
    return res.status(404).send('Route not found!')
})

server.listen(settings.server.port, () => {
    console.log(`Server running on: localhost:${settings.server.port}`)
})

module.exports = {
    io,
    app,
    server
}