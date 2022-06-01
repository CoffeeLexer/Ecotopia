const db = require("../../database")
const utilities = require("../../utilities")

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['name', 'difficulty', 'pollutionTags', 'latitude', 'longitude'])
    if(req.body.description === undefined) req.body.description = ""
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`insert into challenge (fk_account, name, description, difficulty) value ('${res.locals.account_id}', '${req.body.name}', '${req.body.description}', '${req.body.difficulty}')`)
    let challenge_id = result.insertId
    for(let i in req.body.pollutionTags) {
        result = await db.query(`insert into tag_list(fk_challenge, fk_tag) value ('${challenge_id}', '${req.body.pollutionTags[i]}')`)
    }
    result = await db.query(`insert into location(fk_challenge, longitude, latitude) value ('${challenge_id}', '${req.body.longitude}', '${req.body.latitude}')`)
    req.url = req.url.substring(0, req.url.lastIndexOf('/')) + '/list/' + challenge_id
    return await list(req, res, next)
}
async function edit(req, res, next) {
    let test = utilities.structure_test(req.body, ['id', 'description', 'pollutionTags', 'difficulty', 'name'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from challenge where fk_account = '${res.locals.account_id}' and id = '${req.body.id}'`)
    if(result.length === 0) return res.status(403).send('No access for this user!')
    result = await db.query(`update challenge set description = '${req.body.description}', difficulty = '${req.body.difficulty}', name = '${req.body.name}' where id = '${req.body.id}'`)
    if(result.affectedRows === 0) return res.status(404).send(`Challenge not found!`)
    result = await db.query(`delete from tag_list where fk_challenge = '${req.body.id}'`)
    for(let i in req.body.pollutionTags) {
        result = await db.query(`insert into tag_list(fk_challenge, fk_tag) value ('${req.body.id}', '${req.body.pollutionTags[i]}')`)
    }
    req.url = req.url.substring(0, req.url.lastIndexOf('/')) + '/list/' + req.body.id
    return await list(req, res, next)
}
async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]

    let bookmarks = await db.query(`select * from bookmark where fk_account = '${res.locals.account_id}'`)
    let participation = await db.query(`select * from participant where fk_account = '${res.locals.account_id}'`)
    let invitations = await db.query(`select * from invitation where fk_account = '${res.locals.account_id}'`)

    if(!isNaN(id)) {
        result = await db.query(`select * from challenge_deep_json where id = '${id}'`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from challenge_deep_json limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result.forEach((e, i, arr) => {
        arr[i].author = JSON.parse(e.author)
        arr[i].location = JSON.parse(e.location)
        arr[i].images = JSON.parse(e.images)
        arr[i].execution = JSON.parse(e.execution)
        if(e.execution) {
            arr[i].execution.organiser = JSON.parse(e.execution.organiser)
        }
        arr[i].meeting = JSON.parse(e.meeting)
        if(e.meeting) arr[i].meeting.resources = JSON.parse(e.meeting.resources)
    })
    if(!isNaN(id)) {
        result = result[0]
    }
    return res.status(200).json(result)
}
async function drop(req, res, next) {
    let segments = req.url.split('/')
    let result = await db.query(`delete from challenge where id = '${segments[2]}'`)
    if(result.affectedRows === 0) return res.status(404).send('Challenge not found!')
    return res.status(200).send(`Challenge deleted!`)
}
module.exports = {
    create,
    edit,
    list,
    drop
}