const utilities = require('../utilities')

utilities.app.post('/challenge/feed', async (req, res) => {
    // TODO: feed
    let test = utilities.field_test(req.body, ['cookie', 'page', 'limit'])
    if(test.flag === 'failure') return res.json(test)
    let account = await utilities.account_find(req.body.cookie)
    if(account.flag === "failure") return res.json({flag: 'failure', msg: ['account with current cookie not found']})
    let response = await utilities.query(`select id, difficulty, submitted_on as postDate, name from challenge limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    if(response.error) throw response.error
    res.json(response.result)
})