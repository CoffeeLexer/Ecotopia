const utilities = require('../utilities')

utilities.app.post('/challenge/create', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie', 'description', 'maxPeople', 'recommendedPeople', 'pollutionTags', 'tools'])
    if(test.flag === "failure") return res.json(test)
    let sql = `select * from account where cookie = '${req.body.cookie}'`
    let response = await utilities.query(sql)
    if(response.result.length !== 1) return res.json({flag: 'failure', msg: ['account with current cookie not found']})
    let user = response.result[0]
    sql = ` insert into challenge (recommended_people_amount, fk_account, max_people_amount, description) 
            value ('${req.body.recommendedPeople}', '${user.id}', '${req.body.maxPeople}', '${req.body.description}')`
})