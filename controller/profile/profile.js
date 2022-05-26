const db = require('../../database')
const fs = require("fs")
const utilities = require("../../utilities")

async function list(req, res, next) {
    let segments = req.url.split('/')
    let id = segments[segments.length - 1]
    let result
    if(!isNaN(id)) {
        result = await db.query(`select id, wallet_points, active, defaultAvatarColor, json_external_login as external, json_internal_login_no_password as internal from account_json where id = '${id}'`)
        if(result.length === 0) return res.status(404).send(`Account not found!`)
    }
    else {
        let test = utilities.structure_test(req.body, ['page', 'limit'])
        if(test) return res.status(400).send(`No body for ${test}!`)
        if(req.body.page <= 0) return res.status(400).send('Page minimum is 1!')
        if(req.body.limit <= 0) return res.status(400).send('Limit minimum is 1!')
        result = await db.query(`select id, wallet_points, active, defaultAvatarColor, json_external_login as external, json_internal_login_no_password as internal from account_json limit ${req.body.limit} offset ${req.body.limit * (req.body.page - 1)}`)
    }
    result.forEach((e, i, arr) => {
        arr[i].internal = JSON.parse(e.internal)
        arr[i].external = JSON.parse(e.external)
    })
    if(!isNaN(id)) {
        result = result[0]
    }
    return res.status(200).json(result)
}
async function profile(req, res, next) {
    let result = await db.query(`select * from profile where id = '${res.locals.account_id}'`)
    res.redirect(308, `/profile/list/${res.locals.account_id}`)
}
async function setProfilePicture(req, res, next) {
    let files = req.files
    if(files.length !== 1) return res.status(400).send(`One image to set (got ${files.length})!`)
    let buffer = fs.readFileSync(files[0].path);
    let data = buffer.toString('base64')
    let result = await db.query(`update account set profile_pic = '${data}', profile_pic_mime = '${files[0].mimetype}' where id = '${res.locals.account_id}'`)
    fs.rm(files[0].path, {}, (err) => {if(err) throw err})
    res.send(`Done`)
}
async function setProfileBanner(req, res, next) {
    let files = req.files
    if(files.length !== 1) return res.status(400).send(`One image to set (got ${files.length})!`)
    let buffer = fs.readFileSync(files[0].path);
    let data = buffer.toString('base64')
    let result = await db.query(`update account set banner_pic = '${data}', banner_pic_mime = '${files[0].mimetype}' where id = '${res.locals.account_id}'`)
    fs.rm(files[0].path, {}, (err) => {if(err) throw err})
    res.send(`Done`)
}
async function getPicture(req, res, next) {
    req.url = req.url.substring(0, req.url.lastIndexOf('/picture'))
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let result = await db.query(`select profile_pic, profile_pic_mime from account where id = '${id}'`)
    if(result.length !== 1) return res.status(404).send('Account not found!')
    let img = Buffer.from(result[0].profile_pic.toString('binary'), 'base64');
    res.set('Content-Type', result[0].profile_pic_mime)
    res.send(img)
}
async function getBanner(req, res, next) {
    req.url = req.url.substring(0, req.url.lastIndexOf('/banner'))
    let id = req.url.substring(req.url.lastIndexOf('/') + 1)
    let result = await db.query(`select banner_pic, banner_pic_mime from account where id = '${id}'`)
    if(result.length !== 1) return res.status(404).send('Account not found!')
    let img = Buffer.from(result[0].banner_pic.toString('binary'), 'base64');
    res.set('Content-Type', result[0].banner_pic_mime)
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