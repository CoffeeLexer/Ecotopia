const scripts = require('./scripts')
const crypto = require('crypto')
const pepper = require('./settings.json').misc.pepper
const fs = require('fs')

module.exports = {
    query,
    structure_test,
    generate_random_sha512,
    hash_password,
    now
}
function now() {
    const d = new Date()
    const year = d.getFullYear()
    let month = d.getMonth() + 1
    month = month.toString().padStart(2, '0')
    let date = d.getDate()
    date = date.toString().padStart(2, '0')
    let hour = d.getHours()
    hour = hour.toString().padStart(2, '0')
    let minutes = d.getMinutes()
    minutes = minutes.toString().padStart(2, '0')
    let seconds = d.getSeconds()
    seconds = seconds.toString().padStart(2, '0')
    let milliseconds = d.getMilliseconds()
    milliseconds = milliseconds.toString().padStart(3, '0')
    return `${year}-${month}-${date} ${hour}:${minutes}:${seconds}:${milliseconds}`
}
async function query(sql) {
    return scripts.query(sql)
}
function structure_test(structure, fields) {
    let bad_fields = []
    fields.forEach(element => {
        let param = structure[element]
        if(param === undefined) bad_fields.push(element)
    })
    return bad_fields.join(', ')
}
async function account_find(cookie) {
    let response = await scripts.query(`select * from cookies where cookie = '${cookie}'`)
    if(response.result.length !== 1) return {flag: "failure", msg: ["no cookie"]}
    response = await scripts.query(`select * from account where id = '${response.result[0].fk_account}'`)
    if(response.result.length !== 1) return {flag: "failure", msg: ["no account"]}
    return response.result[0]
}
function generate_random_sha512() {
    return crypto
        .createHash('sha512')
        .update(Date.now().toString())
        .digest("hex")
}
function hash_password(password, email) {
    return crypto
        .createHash('sha256')
        .update(`${pepper}_${password}_${email}`)
        .digest('hex')
}