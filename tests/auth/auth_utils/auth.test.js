const { test, expect } = require('@jest/globals')
const auth_utils = require('../../../project/routes/utils/auth_utils')
const axios = require("axios");
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const api_domain = "http://localhost:3000";

async function initDummies(){
    await auth_utils.addNewUser('test','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('testt','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
}

beforeAll(async ()=> {
    await initDummies()
    axiosCookieJarSupport(axios)
})

test('Unit Test - Check valid login details WHERE user exists & wrong password. 2.3.1.1', async () =>
{
    const username = "test"
    const password = "test_password"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(false)
})

test('Unit Test - Check valid login details WHERE user exists & right password. 2.3.2.1', async () =>
{
    const username = "testt"
    const password = "password_test"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(true)
})


test('Unit Test - Check valid login details WHERE user doesn`t exists. 2.3.3.1', async () =>
{
    const username = "test4"
    const password = "test_password"
    const valid_login = await auth_utils.validLoginDetails(username,password)
    return expect(valid_login).toBe(false)
})

test('Acceptance Test - User Logging to Server WHERE user exists & password Right. 2.3.1', async () =>
{
    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })

        const login = await axiosInstance.post(
            `${api_domain}/login`,
            {
                username: "test",
                password: "password_test"
            }
        );
        expect(login.status).toBe(200)
        const auth = await axiosInstance.get(
        `${api_domain}/users/`,{
          })
      expect(auth.status).toBe(200)
    }catch(e){
        throw(e)
    }
})
