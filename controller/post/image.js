const db = require("../../database")
const fs = require('fs')
const utilities = require("../../utilities")

async function get(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result = await db.query(`select * from post_image where id = '${id}'`)
    if(result.length === 0) return res.status(404).send(`Image not found!`)
    let img = Buffer.from(result[0].data.toString('binary'), 'base64');
    res.set('Content-Type', result[0].type)
    res.status(200).send(img)
}
async function upload(req, res, next) {
    let test = utilities.structure_test(req.body, ['postId'])
    if(test) return res.status(400).send(`No body for ${test}!`)
    let result = await db.query(`select * from post where id = '${req.body.postId}'`)
    if(result.length !== 1) return res.status(404).send('Post not found!')
    if(result[0].fk_account !== res.locals.account_id) return res.status(403).send('No access for this user!')
    let files = req.files
    if(files.length === 0) return res.status(400).send(`No images uploading!`)
    for(let i = 0; i < files.length; i++) {
        let buffer = fs.readFileSync(files[i].path);
        let base64data = buffer.toString('base64')
        let result = await db.query(`insert into post_image (fk_post, type, data) value ('${req.body.postId}', '${files[i].mimetype}', '${base64data}')`)
        fs.rm(files[i].path, {}, (err) => {if(err) throw err})
    }
    res.send(`Done`)
}

module.exports = {
    get,
    upload
}
