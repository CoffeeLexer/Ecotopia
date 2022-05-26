const db = require("../../database");
const utilities = require("../../utilities")

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['name', 'min', 'max'])
    if(test) return res.status(400).send(`No body for ${test}!`)

}

module.exports = {
    create
}