const utilities = require('../utilities')

utilities.app.post('/email', async (req, res) => {
    let email = req.body.email
    if(!email) return res.json({flag: 'failure', msg: ["no body for 'email'"]})
    let sql = `select * from internal_login where email = '${email}'`
    let result = await utilities.query(sql)
    return res.json({flag: 'success', exists: result.result.length !== 0})
})