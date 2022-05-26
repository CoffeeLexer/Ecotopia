const mysql = require("mysql");
const settings = require("./settings.json").database;

module.exports = {
    query: async function() {},
    query_test,
    test: {}
}

function connectDatabase() {
    let connection = mysql.createConnection(settings)

    connection.connect((error) => {
        if(error) {
            console.log(`MYSQL: error when connecting to db: ${error}`);
            setTimeout(connectDatabase, 2000);
        }
    });
    connection.on(`error`, (error) => {
        if(error.code === "ECONNRESET") {
            connectDatabase();
        }
        else {
            throw error;
        }
    })
    module.exports.query = async (sql) => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (error, result) => {
                if(error) reject(error)
                resolve(result)
            })
        })
    }
}
connectDatabase();

module.exports.test = {
    single: (result) => {
        return result && result.length === 1;
    },
    empty: (result) => {
        return !result
    }
}

async function query_test(sql, tests) {
    let result = await module.exports.query(sql)
    result.test = {}
    let final = true
    tests.forEach(e => {
        let test = e(result)
        result.test[e.name] = test
        final = final && test
    })
    result.test.final = final
    return result
}