
const utilities = require('../utilities')

utilities.app.post('/register', async (req, res) => {
    let test = utilities.field_test(req.body, ['email', 'password', 'firstName', 'lastName', 'mac'])
    if(test.flag === 'failure') return res.json(test)

    let email = req.body.email
    let password = req.body.password
    let firstname = req.body.firstName
    let lastname = req.body.lastName
    let mac = req.body.mac

    password = utilities.hash_password(password, email)

    let sql = ` insert into internal_login(email, password, firstname, lastname)
                    value ('${email}', '${password}', '${firstname}', '${lastname}')`

    let response = await utilities.query(sql)
    if(!response.result) return res.json({flag: 'failure', msg: ['email in use by other user']})

    response = await utilities.query(`insert into account(green.account.fk_internal_login) value ('${response.result[0].insertId}')`)

    while(true) {
        let cookie = utilities.generate_random_sha512()
        sql = ` insert into cookies(cookie, mac, fk_account)
                    value ('${cookie}', '${mac}', '${response.result[0].insertId}')`
        response = await utilities.query(sql)
        if(response.result !== undefined) return res.json({flag: 'success', cookie: cookie})
    }
})