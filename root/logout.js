const utilities = require('../utilities')

utilities.app.post('/logout', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie', 'mac'])
    if(test.flag === 'failure') return res.json(test)
    let sql = `delete from cookies where cookie = '${req.body.cookie}' and mac = '${req.body.mac}'`
    let response = await utilities.query(sql)
    if(response.result.affectedRows === 0) return res.json({flag: "failure", msg: ['no combo']})
    return res.json({flag: "success"})
})