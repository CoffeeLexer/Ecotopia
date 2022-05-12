const utilities = require("../../utilities");

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['name', 'difficulty', 'pollutionTags', 'latitude', 'longitude'])
    if(req.body.description === undefined) req.body.description = ""
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`insert into challenge (fk_account, name, description, difficulty) value ('${res.locals.account_id}', '${req.body.name}', '${req.body.description}', '${req.body.difficulty}')`)
    if(response.error) throw response.error
    let challenge_id = response.result.insertId
    for(let i in req.body.pollutionTags) {
        response = await utilities.query(`insert into tag_list(fk_challenge, fk_tag) value ('${challenge_id}', '${req.body.pollutionTags[i]}')`)
        if(response.error) throw response.error
    }
    response = await utilities.query(`insert into location(fk_challenge, longitude, latitude) value ('${challenge_id}', '${req.body.longitude}', '${req.body.latitude}')`)
    if(response.error) throw response.error
    req.url = req.url.substring(0, req.url.lastIndexOf('/')) + '/list/' + challenge_id
    return await list(req, res, next)
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
    req.url = req.url.substring(0, req.url.lastIndexOf('/')) + '/list/' + req.body.id
    return await list(req, res, next)
}
async function list(req, res, next) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let postfix = ''
    if(!isNaN(id)) {
        postfix = `where a.id = '${id}' group by a.id order by a.postDate desc`
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        postfix = `group by a.id order by a.postDate desc limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`
    }
    let response = await utilities.query(`
    select a.* , group_concat(challenge_image.id) as images
    from (
        select a.*, group_concat(meeting.id) as meetings
        from (
            select challenge.id           as id,
            account.id as authorId,
            challenge.description as comment,
            challenge.name         as name,
            challenge.difficulty   as difficulty,
            challenge.submitted_on as postDate,
            group_concat(tag.name) as pollutionTags,
            location.latitude,
            location.longitude
            from challenge
            left join account on challenge.fk_account = account.id
            left join internal_login on account.fk_internal_login = internal_login.id
            left join location on location.fk_challenge = challenge.id
            left join tag_list on challenge.id = tag_list.fk_challenge
            left join tag on tag_list.fk_tag = tag.id
            group by id
        ) as a
        left join meeting on a.id = meeting.fk_challenge
        group by a.id
    ) as a
    left join challenge_image on a.id = challenge_image.fk_challenge
    ${postfix}
    `)
    if(response.error) throw response.error
    response.result.forEach(e => {
        if(e.images) e.images = e.images.split(',')
        if(e.meetings) e.meetings = e.meetings.split(',')
    })
    if(!isNaN(id)) {
        response.result = response.result[0]
    }
    return res.status(200).json(response.result)
}

module.exports = {
    create,
    edit,
    list
}