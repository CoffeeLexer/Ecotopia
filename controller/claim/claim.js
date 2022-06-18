const db = require("../../database")
const utilities = require("../../utilities")

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['executionId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from execution where id = '${req.body.executionId}'`)
    if(result.length === 0) return res.status(404).send(`Execution not found!`)
    if(result[0].fk_account !== res.locals.account_id) return res.status(401).send(`Only organiser can complete execution!`)
    let challengeId = result[0].fk_challenge
    result = await db.query(`select * from claim where fk_execution = '${req.body.executionId}'`)
    if(result.length !== 0) return res.status(405).send(`Claim for executions is already created!`)
    result = await db.query(`insert into claim(fk_execution) value('${req.body.executionId}')`)
    let id = result.insertId
    await db.query(`update challenge set active = false where id = '${challengeId}'`)
    return res.status(200).send(`${id}`)
}

module.exports = {
    create
}