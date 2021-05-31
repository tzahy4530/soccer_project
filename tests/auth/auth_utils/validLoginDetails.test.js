const auth_utils = require('../../../project/routes/utils/auth_utils')

async function initDummies(){
    await auth_utils.addNewUser('test','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('testt','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
}

beforeAll(async ()=> {
    await initDummies()
})

test('Check valid login details WHERE user exists & wrong password.', async () =>
{
    const username = "test"
    const password = "test_password"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(false)
})

test('Check valid login details WHERE user exists & right password.', async () =>
{
    const username = "testt"
    const password = "password_test"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(true)
})


test('Check valid login details WHERE user doesn`t exists.', async () =>
{
    const username = "test4"
    const password = "test_password"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(false)
})
