const utilities = require('../utilities')

utilities.app.post('/challenge/create', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie', 'description', 'pollutionTags', 'difficulty', 'name'])
    if(test.flag === "failure") return res.json(test)
    let account = await utilities.account_find(req.body.cookie)
    if(account.flag === "failure") return res.json({flag: 'failure', msg: ['account with current cookie not found']})
    let sql = ` insert into challenge (fk_account, description, difficulty, name) 
            value ('${account.id}', '${req.body.description}', '${req.body.difficulty}', '${req.body.name}')`
    let response = await utilities.query(sql)
    let challenge_id = response.result.insertId
    for(let i in req.body.pollutionTags) {
        sql = `insert into tag_list(fk_challenge, fk_tag) value ('${challenge_id}', '${req.body.pollutionTags[i]}')`
        response = await utilities.query(sql)
    }
    return res.json({flag: "success"})
})