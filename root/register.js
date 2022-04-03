const crypto = require('crypto')
const pepper = require('../settings.json').misc.pepper
const utilities = require('../utilities')

utilities.app.post('/register', async (req, res) => {
    let test = utilities.field_test(req.body, ['email', 'password', 'firstName', 'lastName'])
    if(test.flag === 'failure') return res.json(test)

    let email = req.body.email
    let password = req.body.password
    let firstname = req.body.firstName
    let lastname = req.body.lastName

    password = crypto
        .createHash('sha256')
        .update(`${pepper}_${password}_${email}`)
        .digest('hex')

    let sql = ` insert into internal_login(email, password, firstname, lastname)
                    value ('${email}', '${password}', '${firstname}', '${lastname}')`

    let response = await utilities.query(sql)
    if(!response.result) return res.json({flag: 'failure', msg: ['email in use by other user']})

    while(true) {
        let cookie = crypto
            .createHash('sha512')
            .update(`${Date.now()}${email}${password}`)
            .digest('hex')
        sql = ` insert into account(fk_internal_login, cookie)
                    value ('${response.result.insertId}', '${cookie}')`
        response = await utilities.query(sql)
        if(response.result) return res.json({flag: 'success', cookie: cookie})
    }
})