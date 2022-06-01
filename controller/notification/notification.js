const db = require("../../database")
const utilities = require("../../utilities")
const formats = require("../../formats");

async function add(req, res, next) {
    let test = utilities.structure_test(req.body, ['accountId', 'type', 'content'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result
    try {
        result = await db.query(`insert into notification(fk_account, type, content) value ('${req.body.accountId}', '${req.body.type}', '${JSON.stringify(req.body.content)}')`)
    }
    catch(e) {
        if(e.code === "ER_NO_REFERENCED_ROW_2")
            return res.status(404).send(`Account not found!`)
        throw e
    }
    result = await db.query(`select * from notification where id = '${result.insertId}'`)
    result = formats.notification(result)
    let namespace = require('../../index').io.of('/notification')
    let user
    for (let [id, socket] of namespace.sockets) {
        if(socket.account == req.body.accountId) {
            user = id
            break
        }
    }
    console.log(user)
    if(user) namespace.to(user).emit('notify', result[0])
    return res.status(200).send(`Done!`)
}
async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result
    if(!isNaN(id)) {
        result = await db.query(`select * from notification where id = '${id}' and fk_account = '${res.locals.account_id}'`)
        if(result.length === 0) return res.status(404).send(`Notification not found!`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from notification where fk_account = '${res.locals.account_id}' limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result = formats.notification(result)
    if(!isNaN(id)) {
        result = result[0]
    }
    return res.status(200).json(result)
}

module.exports = {
    add,
    list
}