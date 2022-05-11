const utilities = require('../../utilities')

async function list(req, res, next) {
    let segments = req.url.split('/')
    let meeting_id = segments[2]
    let message_id = segments.length === 6 ? segments[5] : undefined

    let response = await utilities.query(`select * from attendee where fk_account = '${res.locals.account_id}' and fk_meeting = '${meeting_id}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.status(403).send(`Account has no access to meeting!`)

    if(message_id) {
        let response = await utilities.query(`select * from meeting_chat_view where meeting_id = '${meeting_id}' and message_id = '${message_id}'`)
        if(response.error) throw response.error
        if(response.result.length !== 1) return res.status(404).send(`Message not found!`)
        return res.status(200).send(response.result[0])
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        let response = await utilities.query(`select * from meeting_chat_view where meeting_id = '${meeting_id}' limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
        if(response.error) throw response.error
        return res.status(200).json(response.result)
    }
}

module.exports = {
    list
}