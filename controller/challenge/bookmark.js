const db = require('../../database')
const formats = require('../../formats')

async function get(req, res, next) {
    let segments = req.url.split('/')
    let result = await db.query(`select * from bookmark where fk_challenge = '${segments[2]}' and fk_account = '${res.locals.account_id}'`)
    if(result.length === 0) return res.send(false)
    return res.send(true)
}
async function getAll(req, res, next) {
    let postfix = ``
    if(req.body.page && req.body.limit) {
        if(req.body.page < 1) return res.status(401).send(`Page starts at 1`)
        if(req.body.limit < 1) return res.status(401).send(`Limit starts at 1`)
        postfix = ` limit ${req.body.limit} offset ${req.body.page * req.body.limit}`
    }
    else {
        return res.status(401).send(`Wrong format. Body must have page AND limit or nothing!`)
    }
    let result = await db.query(`
        select challenge_deep_json.*
        from bookmark left join challenge_deep_json on challenge_deep_json.id = bookmark.fk_challenge
        where bookmark.fk_account = '${res.locals.account_id}' ${postfix}`)
    result = formats.challenge_deep(result)
    let bookmarks = await db.query(`select * from bookmark where fk_account = '${res.locals.account_id}'`)
    let attendance = await db.query(`select * from participant where fk_account = '${res.locals.account_id}'`)
    let invitations = await db.query(`select * from invitation where fk_account = '${res.locals.account_id}'`)
    result.forEach((e, i, arr) => {
        if(bookmarks.find(e1 => e1.fk_challenge === e.id) !== undefined) {
            arr[i].bookmarked = true
        }
        if(e.execution) {
            if(attendance.find(e1 => e1.fk_execution === e.execution.id) !== undefined) {
                arr[i].participationState = 'Attending'
            }
            if(invitations.find(e1 => e1.fk_execution === e.execution.id) !== undefined) {
                arr[i].participationState = `Invited`
            }
            if(e.execution.organiser.id === res.locals.account_id) {
                arr[i].participationState = 'Organiser'
            }
        }
        // Default participationState: "None"
    })
    res.send(result)
}
async function remove(req, res, next) {
    let segments = req.url.split('/')
    let result = await db.query(`delete from bookmark where fk_challenge = '${segments[2]}' and fk_account = '${res.locals.account_id}'`)
    if(result.affectedRows === 0) return res.status(405).send(`Bookmark doesn't exists!`)
    return res.send('Done!')
}
async function add(req, res, next) {
    let segments = req.url.split('/')
    try {
        let result = await db.query(`insert into bookmark(fk_challenge, fk_account) value ('${segments[2]}', '${res.locals.account_id}')`)
    }
    catch (error) {
        if(error) {
            if(error.code === 'ER_DUP_ENTRY') {
                return res.status(405).send(`Bookmark already exists!`)
            }
            else if(error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(404).send(`Challenge not found!`)
            }
            else throw error
        }
    }
    return res.status(200).send(`Done!`)
}
module.exports = {
    get,
    getAll,
    remove,
    add
}