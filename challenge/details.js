const utilities = require('../utilities')

utilities.app.post('/challenge/details', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie', 'challengeId'])
    if(test.flag === "failure") return res.json(test)
    let sql = `select * from account where cookie = '${req.body.cookie}'`
    let response = await utilities.query(sql)
    if(response.result.length !== 1) return res.json({flag: 'failure', msg: ['account with current cookie not found']})
    // 'cookie', 'description', 'maxPeople', 'recommendedPeople', 'pollutionTags', 'tools'
    sql = `select recommended_people_amount as recommendedPeople, max_people_amount as maxPeople, description from challenge where id = '${req.body.challengeId}'`
    response = await utilities.query(sql)
    let challenge = response.result
    if(challenge === undefined) return res.json({flag: 'failure', msg: ['no challenge by id']})
    sql = `select fk_tag from tag_list where fk_challenge = '${req.body.challengeId}'`
    response = await utilities.query(sql)
    let tags = []
    response.result.forEach(e => tags.push(e.fk_tag))
    sql = `select * from tool where fk_challenge = '${req.body.challengeId}'`
    response = await utilities.query(sql)
    let tools = []
    response.result.forEach(e => tools.push(e.content))
    return res.json(Object.assign({flag: "success", tools: tools, tags: tags}, challenge[0]))
})