
const DButils = require('../project/routes/utils/DButils')
const server_utils = require('../project/routes/utils/server_utils')
jest.setTimeout(100000)

async function clearDB(){
    await DButils.execQuery(process.env.removeAllTables)
}

global.beforeAll(async () => {
    const DBconfig = {
        user: process.env.test_userName,
        password: process.env.test_password,
        server: process.env.test_server,
        database: process.env.test_database,
        options: {
        encrypt: true,
        enableArithAbort: true
        }
    };
    server_utils.openServer()
    await DButils.openDBPool(DBconfig)
})

global.afterAll(async() =>{
    server_utils.closeServer()
    await clearDB()
    await DButils.closeDBPool()
})