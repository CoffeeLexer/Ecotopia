const utilities = require("../../utilities");
const fs = require('fs')

async function get(req, res, next) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let response = await utilities.query(`select * from challenge_image where id = '${id}'`)
    if(response.error) throw response.error
    if(response.result.length === 0) return res.status(404).send(`Image not found!`)
    let img = Buffer.from(response.result[0].data.toString('binary'), 'base64');
    res.set('Content-Type', response.result[0].type)
    res.status(200).send(img)
}
async function upload(req, res, next) {
    let test = utilities.structure_test(req.body, ['challengeId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let response = await utilities.query(`select fk_account from challenge where id = '${req.body.challengeId}'`)
    if(response.error) throw response.error
    if(response.result.length !== 1) return res.status(404).send('Challenge not found!')
    if(response.result[0].fk_account !== res.locals.account_id) return res.status(403).send('No access for this user!')
    let files = req.files
    if(files.length === 0) return res.status(400).send(`No images uploading!`)
    for(let i = 0; i < files.length; i++) {
        let buffer = fs.readFileSync(files[i].path);
        let base64data = buffer.toString('base64')
        let response = await utilities.query(`insert into challenge_image (fk_challenge, type, data) value ('${req.body.challengeId}', '${files[i].mimetype}', '${base64data}')`)
        if(response.error) throw response.error
        fs.rm(files[i].path, {}, (err) => {if(err) throw err})
    }
    res.send(`Done`)
}

module.exports = {
    get,
    upload
}
