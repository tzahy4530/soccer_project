const DButils = require('../project/routes/utils/DButils')

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
    await DButils.openDBPool(DBconfig)
})

global.afterAll(async() =>{
   await clearDB()
   await DButils.closeDBPool()
})