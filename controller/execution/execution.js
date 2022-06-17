const db = require("../../database")
const utilities = require("../../utilities")
const formats = require('../../formats')

// UP TO DATE
async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result
    if(!isNaN(id)) {
        result = await db.query(`select * from execution_full where id = '${id}'`)
        if(result.length === 0) return res.status(404).send(`Execution not found!`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from execution_full limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result = formats.execution_full(result)
    let bookmarks = await db.query(`select * from bookmark where fk_account = '${res.locals.account_id}'`)
    let attendance = await db.query(`select * from participant where fk_account = '${res.locals.account_id}'`)
    let invitations = await db.query(`select * from invitation where fk_account = '${res.locals.account_id}'`)
    result.forEach((e, i, arr) => {
        if(bookmarks.find(e1 => e1.fk_challenge === e.challenge.id) !== undefined) {
            arr[i].challenge.bookmarked = true
        }
        if(attendance.find(e1 => e1.fk_execution === e.id) !== undefined) {
            arr[i].participationState = 'Attending'
        }
        let invite = invitations.find(e1 => e1.fk_execution === e.id)
        if(invite !== undefined) {
            arr[i].participationState = `Invited`
        }
        if(e.organiser.id === res.locals.account_id) {
            arr[i].participationState = 'Organiser'
        }
        // "None"
    })
    if(!isNaN(id)) {
        result = result[0]
    }
    res.status(200).json(result)
}


async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['challengeId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from challenge where id = '${req.body.challengeId}'`)
    if(result.length === 0) return res.status(404).send(`Challenge not found!`)
    if(result[0].current_execution) return res.status(409).send(`Challenge currently has execution!`)
    result = await db.query(`insert into execution(fk_challenge, fk_account) value ('${req.body.challengeId}', '${res.locals.account_id}')`)
    req.url = `/execution/list/list/${result.insertId}`
    next()
}

async function leave(req, res, next) {
    let test = utilities.structure_test(req.body, ['executionId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from execution where id = '${req.body.executionId}'`)
    if(result.length !== 1) return res.status(404).send(`Execution not found!`)
    if(result[0].fk_account === res.locals.account_id) return res.status(401).send(`Organiser cannot leave his execution!`)
    result = await db.query(`delete from participant where fk_account = '${res.locals.account_id}' and fk_execution = '${req.body.executionId}'`)
    if(result.affectedRows === 0) return res.status(405).send('User has not joined this execution!')
    return res.status(200).send(`Success!`)
}
async function join(req, res, next) {
    let test = utilities.structure_test(req.body, ['executionId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from execution where id = '${req.body.executionId}'`)
    if(result.length !== 1) return res.status(404).send(`Execution not found!`)
    if(result[0].fk_account === res.locals.account_id) return res.status(401).send(`Organiser cannot join his execution!`)
    result = await db.query(`delete from invitation where fk_account = '${res.locals.account_id}' and fk_execution = '${req.body.executionId}'`)
    if(result.affectedRows === 0) {
        result = await db.query(`select * from participant where fk_account = '${res.locals.account_id}' and fk_execution = '${req.body.executionId}'`)
        if(result.length === 0) {
            return res.status(405).send('User is not invited!')
        }
        else {
            return res.status(405).send('User has already joined this execution!')
        }
    }
    await db.query(`insert into participant(fk_account, fk_execution) value ('${res.locals.account_id}', '${req.body.executionId}')`)
    return res.status(200).send('Success!')
}
async function invite(req, res, next) {
    let test = utilities.structure_test(req.body, ['executionId', 'accountId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from account where id = '${req.body.accountId}'`)
    if(result.length !== 1) return res.status(404).send(`Account not found!`)
    result = await db.query(`select * from execution where id = '${req.body.executionId}'`)
    if(result.length !== 1) return res.status(404).send(`Execution not found!`)
    if(req.body.accountId === res.locals.account_id) return res.status(405).send('Organiser cannot be invited!')
    result = await db.query(`select * from execution where id = '${req.body.executionId}'`)
    if(result.length === 0) return res.status(404).send(`Execution not found!`)
    if(result[0].fk_account !== res.locals.account_id) return res.status(401).send(`Only organiser can invite users!`)
    result = await db.query(`select * from participant where fk_account = '${req.body.accountId}' and fk_execution = '${req.body.executionId}'`)
    if(result.length !== 0) return res.status(405).send('User has already joined this execution!')
    result = await db.query(`select * from invitation where fk_account = '${req.body.accountId}' and fk_execution = '${req.body.executionId}'`)
    if(result.length !== 0) return res.status(405).send('User is already invited!')
    await db.query(`insert into invitation(fk_account, fk_execution) value ('${req.body.accountId}', '${req.body.executionId}')`)
    res.status(200).send(`Success!`)
}
module.exports = {
    list,
    create,
    join,
    leave,
    invite
}