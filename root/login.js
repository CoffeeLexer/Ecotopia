const utilities = require('../utilities')

utilities.app.post('/login', async (req, res) => {
    let test = utilities.field_test(req.body, ['email', 'password', 'mac'])
    if(test.flag === 'failure') return res.json(test)
    let email = req.body.email
    let password = req.body.password
    let mac = req.body.mac

    password = utilities.hash_password(password, email)

    let sql = `select * from internal_login where email = '${email}' and password = '${password}'`
    let response = await utilities.query(sql)
    if(response.result.length !== 1)
        return res.json({flag: 'failure', msg: ['wrong combination']})
    sql = `select * from account where fk_internal_login = '${response.result[0].id}'`
    response = await utilities.query(sql)
    let account = response.result[0]
    while(true) {
        let cookie = utilities.generate_random_sha512()
        sql = `insert into cookies (cookie, mac, fk_account) value ('${cookie}', '${mac}', '${account.id}')`
        response = await utilities.query(sql)
        if(response.result !== undefined) return res.json({flag: 'success', cookie: cookie})
    }
})