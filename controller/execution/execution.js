const db = require("../../database")
const utilities = require("../../utilities")


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
    result.forEach((e, i, arr) => {
        arr[i].organiser = JSON.parse(e.organiser)
        if(e.current_meeting) {
            arr[i].current_meeting = JSON.parse(e.current_meeting)
            arr[i].current_meeting.resources = JSON.parse(e.current_meeting.resources)
        }
        arr[i].challenge = JSON.parse(e.challenge)
        arr[i].challenge.author = JSON.parse(e.challenge.author)
        arr[i].challenge.location = JSON.parse(e.challenge.location)
        arr[i].challenge.images = JSON.parse(e.challenge.images)
        if(e.participants) arr[i].participants = JSON.parse(e.participants)
        if(e.invitations) arr[i].invitations = JSON.parse(e.invitations)
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
    console.log(`/execution/list/list/${result.insertId}`)
    res.redirect(307, `/execution/list/${result.insertId}`)
}
async function leave(req, res, next) {
    let test = utilities.structure_test(req.body, ['executionId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`delete from participant where fk_account = '${res.locals.account_id}' and fk_execution = '${req.body.executionId}'`)
    if(result.affectedRows === 0) return res.status(405).send('User has not joined this meeting!')
    return res.status(200).send(`Success!`)
}

module.exports = {
    list,
    create,
    leave
}