const utilities = require('../../utilities')
const fs = require("fs");

async function list(req, res, next) {
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let postfix = ''
    if(!isNaN(id)) {
        postfix = `where id = '${id}'`
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        postfix = `limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`
    }
    let response = await utilities.query(`select * from profile ${postfix}`)
    if(response.error) throw response.error
    if(!isNaN(id)) {
        response.result = response.result[0]
    }
    return res.status(200).json(response.result)
}
async function profile(req, res, next) {
    let response = await utilities.query(`select * from profile where id = '${res.locals.account_id}'`)
    if(response.error) throw response.error
    return res.status(200).send(response.result[0])
}
async function setProfilePicture(req, res, next) {
    let files = req.files
    if(files.length !== 1) return res.status(400).send(`One image to set (got ${files.length})!`)
    let buffer = fs.readFileSync(files[0].path);
    let data = buffer.toString('base64')
    console.log(res.locals.account_id)
    let response = await utilities.query(`update account set profile_pic = '${data}', profile_pic_mime = '${files[0].mimetype}' where id = '${res.locals.account_id}'`)
    if(response.error) throw response.error
    fs.rm(files[0].path, {}, (err) => {if(err) throw err})
    res.send(`Done`)
}
async function setProfileBanner(req, res, next) {
    let files = req.files
    if(files.length !== 1) return res.status(400).send(`One image to set (got ${files.length})!`)
    let buffer = fs.readFileSync(files[0].path);
    let data = buffer.toString('base64')
    console.log(res.locals.account_id)
    let response = await utilities.query(`update account set banner_pic = '${data}', banner_pic_mime = '${files[0].mimetype}' where id = '${res.locals.account_id}'`)
    if(response.error) throw response.error
    fs.rm(files[0].path, {}, (err) => {if(err) throw err})
    res.send(`Done`)
}
async function getPicture(req, res, next) {
    req.url = req.url.substring(0, req.url.lastIndexOf('/picture'))
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let response = await utilities.query(`select profile_pic, profile_pic_mime from account where id = '${id}'`)
    if(response.error) throw response.error
    if(response.result.length !== 1) return res.status(404).send('Account not found!')
    let img = Buffer.from(response.result[0].profile_pic.toString('binary'), 'base64');
    res.set('Content-Type', response.result[0].profile_pic_mime)
    res.send(img)
}
async function getBanner(req, res, next) {
    req.url = req.url.substring(0, req.url.lastIndexOf('/banner'))
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let response = await utilities.query(`select banner_pic, banner_pic_mime from account where id = '${id}'`)
    if(response.error) throw response.error
    if(response.result.length !== 1) return res.status(404).send('Account not found!')
    let img = Buffer.from(response.result[0].banner_pic.toString('binary'), 'base64');
    res.set('Content-Type', response.result[0].banner_pic_mime)
    res.send(img)
}

module.exports = {
    list,
    profile,
    setProfilePicture,
    setProfileBanner,
    getPicture,
    getBanner
}