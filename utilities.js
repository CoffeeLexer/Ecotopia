module.exports = {
    field_test,
    query: async function() {},// index.js
    app: {}
}
function field_test(structure, fields) {
    let msg = []
    fields.forEach(element => {
        let param = structure[element]
        if(!param) msg.push(`no body for field '${element}'`)
    })
    if(msg.length > 0) return {flag: 'failure', msg: msg}
    else return {flag: 'success'}
}