const nodemailer = require('nodemailer')
const login = require('./settings.json').email
const transporter = nodemailer.createTransport(login)

function send(to, subject, text) {
    transporter.sendMail(
        {from: login.auth.user, to: to, subject: subject, text: text},
        (error, info) => {
        if(error) console.log(error)
    })
}
module.exports = {
    send
}