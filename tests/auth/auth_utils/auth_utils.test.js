const { test, expect } = require('@jest/globals')
const auth_utils = require('../../../project/routes/utils/auth_utils')

let valid_username = 'test'
let valid_password = 'password_test'
let invalid_username = 'testt'
let invalid_password = 'password_testt'

async function initDummies(){
    await auth_utils.addNewUser(valid_username,'test','test',auth_utils.hashPassword(valid_password),'test@gmail.com','noLink','')
}

beforeAll(async ()=> {
    await initDummies()
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
})

test('Unit Test - Check valid login details WHERE user exists & right password. 2.3.0.0.1', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(valid_username,valid_password)
    return expect(valid_login).toBe(true)
})

test('Unit Test - Check valid login details WHERE user exists & wrong password. 2.3.0.0.2', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(valid_username,invalid_password)
    return expect(valid_login).toBe(false)
})


test('Unit Test - Check valid login details WHERE user doesn`t exists. 2.3.0.0.3', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(invalid_username,valid_password)
    return expect(valid_login).toBe(false)
})

test('Unit Test - Check user_id by Username WHERE user exists. 2.3.0.0.4', async () =>
{
    let valid_user;
    try{
        valid_user = await auth_utils.getUserIdByUsername(valid_username)
    }
    finally{
    return expect(Number.isInteger(valid_user)).toBe(true)
    }
})

test('Unit Test - Check user_id by Username WHERE user doesn`t exists. 2.3.0.0.5', async () =>
{
    let valid_user
    try{
    valid_user = await auth_utils.getUserIdByUsername(invalid_username)
    }
    finally{
    return expect(valid_user).toBeUndefined()
    }
})

test('Integration Test - Check valid login details & user_id by Username WHERE user exists & password Right. 2.3.0.1', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(valid_username,valid_password)
    expect(valid_login).toBe(true)
    let valid_user
    try{
        valid_user = await auth_utils.getUserIdByUsername(valid_username)
    }
    finally{
    return expect(Number.isInteger(valid_user)).toBe(true)
    }
})

test('Integration Test - Check valid login details & user_id by Username WHERE user exists & wrong password. 2.3.0.2', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(valid_username, invalid_password)
    expect(valid_login).toBe(false)
    let valid_user
    try{
        valid_user = await auth_utils.getUserIdByUsername(valid_username)
    }
    finally{
        return expect(Number.isInteger(valid_user)).toBe(true)
    }
})

test('Integration Test - Check valid login details & user_id by Username WHERE user dosen`t exists. 2.3.0.3', async () =>
{
    const valid_login = await auth_utils.validLoginDetails(invalid_username, valid_password)
    expect(valid_login).toBe(false)
    let valid_user
    try{
        valid_user = await auth_utils.getUserIdByUsername(invalid_username)
    }
    finally{
        return expect(valid_user).toBeUndefined()
    }
})
