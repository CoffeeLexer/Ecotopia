const db = require("../../database");

async function index(req, res, next) {
    let result = await db.query(`select * from tag order by tag.name`)
    return res.status(200).json(result)
}

module.exports = {
    index
}