const utilities = require("../../utilities");
const db = require("../../database")
const formats = require("../../formats");

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['content'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result
    if(req.body.claimId) {
        result = await db.query(`select * from claim where id = '${req.body.claimId}'`)
        if(result.length === 0) return res.status(404).send(`Claim not found!`)
        if(result[0].fk_post) return res.status(405).send(`Claim is already posted!`)
        let executionId = result[0].fk_execution
        result = await db.query(`select * from execution where id = '${executionId}'`)
        if(result[0].fk_account !== res.locals.account_id) return res.status(401).send(`Only organiser can post claims`)
        result = await db.query(`insert into post(content, fk_claim, fk_account) value('${req.body.content}', '${req.body.claimId}', '${res.locals.account_id}')`)
        let postId = result.insertId
        res.status(200).send(`${postId}`)
        return await db.query(`update claim set fk_post = '${postId}' where id = '${req.body.claimId}'`)
    }
    else {
        result = await db.query(`insert into post(content, fk_account) value('${req.body.content}', '${res.locals.account_id}')`)
        return res.status(200).send(`${result.insertId}`)
    }
}

async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result
    if(!isNaN(id)) {
        result = await db.query(`select * from post_full where id = '${id}'`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select * from post_full limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result = formats.post_full(result)
    if(!isNaN(id)) {
        result = result[0]
    }
    return res.status(200).json(result)
}

module.exports = {
    create,
    list
}