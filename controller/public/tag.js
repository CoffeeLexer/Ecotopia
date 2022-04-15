const utilities = require("../../utilities");

async function index(req, res, next) {
    let response = await utilities.query(`select * from tag order by tag.name`)
    if(response.error) throw response.error
    return res.status(200).json(response.result)
}

module.exports = {
    index
}