const utilities = require('../utilities')

utilities.app.post('/challenge/feed', async (req, res) => {
    let test = utilities.field_test(req.body, ['cookie', 'page', 'limit'])
    if(test.flag === 'failure') return res.json(test)

})