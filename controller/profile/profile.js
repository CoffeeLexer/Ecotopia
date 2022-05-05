const utilities = require('../../utilities')

async function list(req, res, next) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let postfix = ''
    if(!isNaN(id)) {
        postfix = `where id = '${id}'`
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        postfix = `limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`
    }
    let response = await utilities.query(`select * from profile ${postfix}`)
    if(response.error) throw response.error
    if(!isNaN(id)) {
        response.result = response.result[0]
    }
    return res.status(200).json(response.result)
}
async function profile(req, res, next) {
    let response = await utilities.query(`select * from profile where id = '${res.locals.account_id}'`)
    if(response.error) throw response.error
    return res.status(200).send(response.result[0])
}

module.exports = {
    list,
    profile
}