const utilities = require("../../utilities");

async function list(req, res, next) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let postfix = ''
    if(!isNaN(id)) {
        postfix = `where a.id = '${id}'`
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        postfix = `limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`
    }
    let response = await utilities.query(`
    select a.id as meetingId, a.target_date, a.fk_account as organiser, a.attendees, b.name, b.difficulty, b.postDate, b. pollutionTags, b.latitude, b.longitude, a.recources
    from (
           select meeting.*, group_concat(attendee.fk_account) as attendees, group_concat(resource.name) as recources
           from meeting
                    left join attendee on meeting.id = attendee.fk_meeting
                    left join resource on meeting.id = resource.fk_meeting
           group by meeting.id
       ) as a
           left join (
      select challenge.id as challangeId,
             challenge.name         as name,
             challenge.difficulty   as difficulty,
             challenge.submitted_on as postDate,
             group_concat(tag.name) as pollutionTags,
             location.latitude,
             location.longitude
      from challenge
               left join account on challenge.fk_account = account.id
               left join internal_login on account.fk_internal_login = internal_login.id
               left join location on location.id = challenge.fk_location
               left join tag_list on challenge.id = tag_list.fk_challenge
               left join tag on tag_list.fk_tag = tag.id
      group by challenge.id
    )
    as b on b.challangeId = a.fk_challenge
    ${postfix}`)
    if(response.error) throw response.error
    response.result.forEach(e => {
        if(e.attendees) e.attendees = e.attendees.split(',')
        if(e.pollutionTags) e.pollutionTags = e.pollutionTags.split(',')
        if(e.resources) e.resources = e.resources.split(',')
    })
    if(!isNaN(id)) {
        response.result = response.result[0]
    }
    return res.status(200).json(response.result)
}

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['challengeId', 'targetDate', 'resources'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let flag = false
    let row = -1
    req.body.resources.forEach((e, i) => {
        let s = flag
        if(e.name === undefined) flag = true
        if(e.min === undefined) flag = true
        if(e.max === undefined) flag = true
        if(s !== flag) row = i
    })
    if(flag) return res.status(400).send(`Resources array format incorrect. Index ${row}`)
    let response = await utilities.query(`
        insert into meeting (target_date, fk_challenge, fk_account)
        value ('${req.body.targetDate}', '${req.body.challengeId}', '${res.locals.account_id}')`)
    if(response.error) throw response.error
    let meeting_id = response.result.insertId
    for(let i in req.body.resources) {
        const e = req.body.resources[i]
        await utilities.query(`insert into resource (name, min, max, fk_meeting) value ('${e.name}', '${e.min}', '${e.max}', '${meeting_id}')`)
    }
    return res.status(200).send(`${response.result.insertId}`)
}
async function join(req, res, next) {
    let test = utilities.structure_test(req.body, ['meetingId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`insert into attendee (fk_account, fk_meeting) value ('${res.locals.account_id}', '${req.body.meetingId}')`)
    if(response.error) {
        if(response.error.code === 'ER_DUP_ENTRY') return res.status(405).send('User already is in this meeting!')
        else throw response.error
    }
    return res.status(200).send(`Success`)
}
async function leave(req, res, next) {
    let test = utilities.structure_test(req.body, ['meetingId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`delete from attendee where fk_account = '${res.locals.account_id}' and fk_meeting = '${req.body.meetingId}'`)
    if(response.error) throw response.error
    if(response.result.affectedRows === 0) return res.status(405).send('User has not joined this meeting!')
    return res.status(200).send(`Success`)
}

module.exports = {
    list,
    create,
    join,
    leave
}