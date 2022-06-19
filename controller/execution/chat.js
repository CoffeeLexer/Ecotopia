const db = require('../../database')
const utilities = require("../../utilities")

async function list(req, res, next) {
    let segments = req.url.split('/')
    let meeting_id = segments[2]
    let message_id = segments.length === 6 ? segments[5] : undefined

    let result = await db.query(`select * from execution where id = '${meeting_id}'`)
    if(result.length === 0) return res.status(404).send(`Execution not found!`)
    if(result[0].fk_account !== res.locals.account_id) {
        result = await db.query(`select * from participant where fk_account = '${res.locals.account_id}' and fk_execution = '${meeting_id}'`)
        if(result.length === 0) return res.status(403).send(`Account has no access to meeting!`)
    }
    if(message_id) {
        result = await db.query(`select * from meeting_chat_view where fk_meeting = '${meeting_id}' and id = '${message_id}'`)
        if(result.length !== 1) return res.status(404).send(`Message not found!`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from meeting_chat_view where fk_meeting = '${meeting_id}' limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result.forEach((e, i, arr) => {
        arr[i].user = JSON.parse(e.json_account)
        arr[i].json_account = undefined
        arr[i].user.verified = undefined
        arr[i].user.trust = undefined
        arr[i].user.wallet_points = undefined
        arr[i].message = e.content
        arr[i].content = undefined
        arr[i].fk_meeting = undefined
    })
    if(message_id) {
        result = result[0]
    }
    return res.status(200).json(result)
}

module.exports = {
    list
}