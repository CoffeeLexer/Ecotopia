const utilities = require('../utilities')

utilities.app.post('/tags', async (req, res) => {
    let sql = `select * from tag`
    let response = await utilities.query(sql)
    return res.json(response.result)
})