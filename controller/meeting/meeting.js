const db = require("../../database")
const utilities = require("../../utilities")
const formats = require("../../formats")

async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result
    if(!isNaN(id)) {
        result = await db.query(`select * from meeting_deep_json where id = '${id}'`)
        if(result.length === 0) return res.status(404).send(`Meeting not found!`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from meeting_deep_json limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result = formats.meeting_deep(result)
    if(!isNaN(id)) {
        result = result[0]
    }
    return res.status(200).json(result)
}

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['challengeId', 'meetingDate', 'resources'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let flag = false
    let row = -1
    req.body.resources.forEach((e, i) => {
        let s = flag
        if(e.name === undefined) flag = true
        if(e.targetAmount === undefined) flag = true
        if(s !== flag) row = i
    })
    if(flag) return res.status(400).send(`Resources array format incorrect. Index ${row}`)
    let result = await db.query(`select * from challenge where id = '${req.body.challengeId}'`)
    if(result.length === 0) return res.status(404).send(`Challenge not found!`)
    if(result[0].current_execution) return res.status(409).send(`Challenge currently has execution!`)
    result = await db.query(`insert into execution(fk_challenge, fk_account) value ('${req.body.challengeId}', '${res.locals.account_id}')`)
    result = await db.query(`insert into meeting(fk_execution, target_date) value ('${result.insertId}', '${req.body.meetingDate}')`)
    let meeting_id = result.insertId
    for(let i in req.body.resources) {
        const e = req.body.resources[i]
        await db.query(`insert into resource (name, target_amount, fk_meeting) value ('${e.name}', '${e.targetAmount}', '${meeting_id}')`)
    }
    req.url = `/meeting/list/${meeting_id}`
    next()
}
async function join(req, res, next) {
    let test = utilities.structure_test(req.body, ['meetingId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    try {
        let result = await db.query(`insert into participant (fk_account, fk_execution) value ('${res.locals.account_id}', '${req.body.meetingId}')`)
    }
    catch(error) {
        if(error.code === 'ER_DUP_ENTRY')
            return res.status(405).send('User already is in this meeting!')
        throw error
    }
    return res.status(200).send(`Success`)
}
async function leave(req, res, next) {
    let test = utilities.structure_test(req.body, ['meetingId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`delete from participant where fk_account = '${res.locals.account_id}' and fk_execution = '${req.body.meetingId}'`)
    if(result.affectedRows === 0) return res.status(405).send('User has not joined this meeting!')
    return res.status(200).send(`Success`)
}
async function edit(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let test = utilities.structure_test(req.body, ['meetingDate'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from meeting_deep_json where id = ${id}`)
    if(result.length !== 1) return res.status(404).send(`Meeting not found!`)
    result = formats.meeting_deep(result)
    let meeting = result[0]
    let organiser = meeting.execution.organiser
    if(organiser.id !== res.locals.account_id) return res.status(403).send(`Account is not organiser!`)
    await db.query(`update meeting set target_date = '${req.body.meetingDate}' where id = '${id}'`)
    req.url = `/meeting/list/${id}`
    next()
}

module.exports = {
    list,
    create,
    join,
    leave,
    edit
}