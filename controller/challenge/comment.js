const db = require("../../database")
const utilities = require("../../utilities")

async function create(req, res, next) {
    let test = utilities.structure_test(req.body, ['comment'])
    if(test) return res.status(400).send(`No body for ${test}!`)

}
async function edit(req, res, next) {

}
async function list(req, res, next) {

}

module.exports = {
    create,
    edit,
    list
}