const utilities = require("../../utilities");

async function exists(req, res, next) {
    let test = utilities.structure_test(req.body, ['email'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`select * from internal_login where email = '${req.body.email}'`)
    return res.status(200).send(response.result.length !== 0)
}

module.exports = {
    exists
}