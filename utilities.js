const scripts = require('./scripts')
const crypto = require('crypto')
const pepper = require('./settings.json').misc.pepper

module.exports = {
    field_test,
    query,// index.js
    app: {},
    account_find,
    account_exists,
    generate_random_sha512,
    hash_password
}
async function query(sql) {
    return scripts.query(sql)
}
function field_test(structure, fields) {
    let msg = []
    fields.forEach(element => {
        let param = structure[element]
        if(!param) msg.push(`no body for field '${element}'`)
    })
    if(msg.length > 0) return {flag: 'failure', msg: msg}
    else return {flag: 'success'}
}
async function account_exists(cookie) {
    let response = await scripts.query(`select * from cookies where cookie = '${cookie}'`)
    return response.result.length === 1
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