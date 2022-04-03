const crypto = require('crypto')
const pepper = require('../settings.json').misc.pepper
const utilities = require('../utilities')

utilities.app.post('/login', async (req, res) => {
    let test = utilities.field_test(req.body, ['email', 'password'])
    if(test.flag === 'failure') return res.json(test)
    let email = req.body.email
    let password = req.body.password

    password = crypto
        .createHash('sha256')
        .update(`${pepper}_${password}_${email}`)
        .digest('hex')

    let sql = `select * from internal_login where email = '${email}' and password = '${password}'`
    let response = await utilities.query(sql)
    if(response.result.length !== 1)
        return res.json({flag: 'failure', msg: ['wrong combination']})
    sql = `select * from account where fk_internal_login = '${response.result[0].id}'`
    response = await utilities.query(sql)
    res.json({flag: 'success', cookie: response.result[0].cookie})
})