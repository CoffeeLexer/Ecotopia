const utilities = require("../../utilities");

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['name', 'difficulty', 'pollutionTags'])
    if(req.body.description === undefined) req.body.description = ""
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`insert into challenge (fk_account, name, description, difficulty) value ('${res.locals.account_id}', '${req.body.name}', '${req.body.description}', '${req.body.difficulty}')`)
    if(response.error) throw response.error
    let challenge_id = response.result.insertId
    for(let i in req.body.pollutionTags) {
        response = await utilities.query(`insert into tag_list(fk_challenge, fk_tag) value ('${challenge_id}', '${req.body.pollutionTags[i]}')`)
        if(response.error) throw response.error
    }
    res.status(200).send(`${challenge_id}`)
}
async function details(req, res, next) {
    let test = utilities.structure_test(req.body, ['challengeId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`select fk_account, id, name, description, difficulty from challenge where id = '${req.body.challengeId}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.status(404).send('Challenge not found!')
    let challenge = response.result[0]
    response = await utilities.query(`select fk_tag from tag_list where fk_challenge = '${req.body.challengeId}'`)
    if(response.error) throw response.error
    return res.status(200).json(Object.assign(challenge, {pollutionTags: response.result.map(e => e.fk_tag)}))
}
async function edit(req, res, next) {
    let test = utilities.structure_test(req.body, ['id', 'description', 'pollutionTags', 'difficulty', 'name'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`select * from challenge where fk_account = '${res.locals.account_id}' and id = '${req.body.id}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.status(403).send('No access for this user!')
    response = await utilities.query(`update challenge set description = '${req.body.description}', difficulty = '${req.body.difficulty}', name = '${req.body.name}' where id = '${req.body.id}'`)
    if(response.error) throw response.error
    if(response.result.affectedRows === 0) return res.status(404).send(`Challenge not found!`)
    response = await utilities.query(`delete from tag_list where fk_challenge = '${req.body.id}'`)
    for(let i in req.body.pollutionTags) {
        response = await utilities.query(`insert into tag_list(fk_challenge, fk_tag) value ('${req.body.id}', '${req.body.pollutionTags[i]}')`)
        if(response.error) throw response.error
    }
    req.body.challengeId = req.body.id
    return await details(req, res, next)
}
async function feed(req, res, next) {
    let test = utilities.structure_test(req.body, ['page', 'limit'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
    if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
    let response = await utilities.query(`select id, difficulty, submitted_on as postDate, name from challenge order by postDate desc limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    if(response.error) throw response.error
    return res.status(200).json(response.result)
}
async function list(req, res, next) {
    let test = utilities.structure_test(req.body, ['page', 'limit'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
    if(res.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
    let response = await utilities.query(
    `select ch.id, difficulty, submitted_on as postDate, description, ch.name, il.lastname, il.firstname, group_concat(_tag.name separator ';')
        from challenge as ch
        left join account a on a.id = ch.fk_account
        left join internal_login il on il.id = a.fk_internal_login
        left join location loc on loc.id = ch.fk_location
        left join tag_list tl on ch.id = tl.fk_challenge
        left join tag _tag on tl.fk_tag = _tag.id
        group by ch.id
        limit '${req.body.limit}' offset '${(req.body.page - 1) * req.body.limit}'`)
    if(response.error) throw response.error
    return res.status(200).json(response.result)
}

module.exports = {
    create,
    details,
    edit,
    feed
}