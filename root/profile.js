const utilities = require('../utilities')

utilities.app.post('/profile', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie'])
    if(test.flag === 'failure') return res.json(test)
    let account = await utilities.account_find(req.body.cookie)
    if(account.flag === 'failure') return res.json({flag: 'failure', msg: ['account with current cookie not found']})
    let sql = `select * from internal_login where id = '${account.fk_internal_login}'`
    let response = await utilities.query(sql)
    let internal = response.result !== undefined ? response.result[0] : null
    sql = `select * from external_login where id = '${account.fk_external_login}'`
    response = await utilities.query(sql)
    let external = response.result !== undefined ? response.result[0] : null
    let final = {flag: "success", verified: account.verified, trust: account.trust,
        internal: internal, external: external}
    if(final.internal) final.internal.id = undefined
    if(final.external) final.external.id = undefined
    return res.json(final)
})