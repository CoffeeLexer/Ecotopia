const utilities = require("./utilities");

async function authenticate(req, res, next) {
    let key = req.cookies.key
    if(key === undefined) return res.status(401).send('You are not logged in! (No key)')
    let response = await utilities.query(`select * from cookies where cookie = '${key}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.clearCookie('key').status(401).send('You are not logged in!')
    res.locals.account_id = response.result[0].fk_account
    return next()
}

module.exports = {
    authenticate
}