const utilities = require('../../utilities')

async function get(req, res, next) {
    let segments = req.url.split('/')
    let response = await utilities.query(`select * from bookmark where fk_challenge = '${segments[2]}' and fk_account = '${res.locals.account_id}'`)
    if(response.result.length === 0) return res.send(false)
    return res.send(true)
}
async function getAll(req, res, next) {
    let response = await utilities.query(`select c.* from bookmark left join challenge c on bookmark.fk_challenge = c.id where bookmark.fk_account = '${res.locals.account_id}'`)
    if(response.error) throw response.error
    res.send(response.result)
}
async function remove(req, res, next) {
    let segments = req.url.split('/')
    let response = await utilities.query(`delete from bookmark where fk_challenge = '${segments[2]}' and fk_account = '${res.locals.account_id}'`)
    if(response.result.affectedRows === 0) return res.status(405).send(`Bookmark doesn't exists!`)
    return res.send('Done!')
}
async function add(req, res, next) {
    let segments = req.url.split('/')
    let response = await utilities.query(`insert into bookmark(fk_challenge, fk_account) value ('${segments[2]}', '${res.locals.account_id}')`)
    if(response.error) {
        if(response.error.code === 'ER_DUP_ENTRY') {
            return res.status(405).send(`Bookmark already exists!`)
        }
        else if(response.error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).send(`Challenge not found!`)
        }
        else throw response.error
    }
    return res.status(200).send(`Done!`)
}
module.exports = {
    get,
    getAll,
    remove,
    add
}