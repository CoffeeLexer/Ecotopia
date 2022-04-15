const utilities = require("../../utilities");

async function register(req, res, next) {
    let test = utilities.structure_test(req.body, ['email', 'password', 'firstName', 'lastName'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let password = utilities.hash_password(req.body.password, req.body.email)
    let response = await utilities.query(
        `insert into internal_login(email, password, firstname, lastname)
        value ('${req.body.email}', '${password}', '${req.firstName}', '${req.lastName}')`)
    if(response.error) {
        if(response.error.code === 'ER_DUP_ENTRY') {
            return res.status(405).send('Email in use!')
        }
        throw response.error
    }
    response = await utilities.query(`insert into account(fk_internal_login) value ('${response.result.insertId}')`)
    if(response.error) throw response.error
    let account_id = response.result.insertId
    let cookie
    do {
        cookie = utilities.generate_random_sha512()
        response = await utilities.query(`insert into cookies(cookie, fk_account) value ('${cookie}', '${account_id}')`)
        if(response.error && response.error.code !== 'ER_DUP_ENTRY') throw response.error
    }
    while(response.error)
    res.cookie('key', cookie)
    return res.status(200).send('Account created!')
}
async function login(req, res, next) {
    let test = utilities.structure_test(req.body, ['email', 'password'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    if(req.cookies.key !== undefined) return res.status(400).send('You are already logged in!')
    let password = utilities.hash_password(req.body.password, req.body.email)
    let response = await utilities.query(`select * from internal_login where email = '${req.body.email}' and password = '${password}'`)
    if(response.error) throw response.error
    if(response.result.length !== 1) return res.status(406).send('Wrong combination!')
    response = await utilities.query(`select * from account where fk_internal_login = '${response.result[0].id}'`)
    if(response.error) throw response.error
    let account_id = response.result[0].id
    let cookie
    do {
        cookie = utilities.generate_random_sha512()
        response = await utilities.query(`insert into cookies(cookie, fk_account) value ('${cookie}', '${account_id}')`)
        if(response.error && response.error.code !== 'ER_DUP_ENTRY') throw response.error
    }
    while(response.error)
    res.cookie('key', cookie)
    return res.status(200).send('Account logged in!')
}
async function logout(req, res, next) {
    let key = req.cookies.key
    if(key === undefined) return res.status(401).send('You are not logged in! (No key)')
    let response = await utilities.query(`delete from cookies where cookie = '${key}'`)
    if(response.error) throw response.error
    res.clearCookie('key')
    if(response.result.affectedRows === 0) return res.status(401).send('You are not logged in!')
    return res.status(200).send('Account logged out!')
}
async function profile(req, res, next) {
    let id = req.body.id !== undefined ? req.body.id : res.locals.account_id
    let response = await utilities.query(`select verified, trust, fk_internal_login, fk_external_login from account where id = '${id}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.status(404).send(`Can't find account by provided id!`)
    let account = response.result[0]
    response = await utilities.query(`select * from internal_login where id = '${account.fk_internal_login}'`)
    if(response.error) throw response.error
    let internal = response.result[0] !== undefined ? response.result[0] : null
    response = await utilities.query(`select * from external_login where id = '${account.fk_external_login}'`)
    if(response.error) throw response.error
    let external = response.result[0] !== undefined ? response.result[0] : null
    let final = {verified: account.verified, trust: account.trust,
        internal: internal, external: external}
    if(final.internal) final.internal.id = undefined
    if(final.external) final.external.id = undefined
    return res.status(200).json(final)
}
module.exports = {
    profile,
    register,
    login,
    logout
}