const db = require("../../database");
const utilities = require("../../utilities")
const formats = require("../../formats")

async function set(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let test = utilities.structure_test(req.body, ['currentAmount'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from resource where id = '${id}'`)
    if(result.length !== 1) return res.status(404).send(`Resource not found!`)
    let resource = result[0]
    result = await db.query(`select * from meeting_deep_json where id = '${resource.fk_meeting}'`)
    // 404: NOT FOUND impossible
    result = formats.meeting_deep(result)
    let meeting = result[0]
    let flag = false
    flag = meeting.execution.organiser.id === res.locals.account_id
    let myself = meeting.execution.participants && meeting.execution.participants.find(e => e.id = res.locals.account_id) !== undefined
    flag = flag || myself
    if(!flag) return res.status(403).send(`You have no authority for this method! (not participant or organiser)`)
    if(req.body.currentAmount < 0) return res.status(405).send(`Amount can not be negative!`)
    if(req.body.currentAmount > resource.target_amount) return res.status(405).send(`Amount can not exceed target!`)
    await db.query(`update resource set current_amount = '${req.body.currentAmount}' where id = '${id}'`)
    res.status(200).send(`Done!`)}

module.exports = {
    set
}