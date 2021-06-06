const { test, expect } = require('@jest/globals')
const auth_utils = require('../../../project/routes/utils/auth_utils')
const axios = require("axios");
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const api_domain = "http://localhost:3000";

let valid_username = 'test'
let valid_password = 'password_test'
let invalid_username = 'testt'
let invalid_password = 'password_testt'

async function initDummies(){
    await auth_utils.addNewUser(valid_username,'test','test',auth_utils.hashPassword(valid_password),'test@gmail.com','noLink','')
}

beforeAll(async ()=> {
    await initDummies()
    axiosCookieJarSupport(axios)
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
                username: valid_username,
                password: valid_password
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


test('Acceptance Test - User Logging to Server WHERE user exists & wrong password. 2.3.2', async () =>
{
    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })
        let login_status;
        let login_message;
        try{
            const login = await axiosInstance.post(
                `${api_domain}/login`,
                {
                    username: valid_username,
                    password: invalid_password
                }
            );
        }
        catch(e){
            login_status = e.response.status
            login_message = e.response.data
        }
        expect(login_status).toBe(401)
        expect(login_message).toBe('Username or Password incorrect')
        
        let auth_status;
        let auth_message;

        try{
        const auth = await axiosInstance.get(
        `${api_domain}/users/`,{
          })
        }
        catch(e){
            auth_status = e.response.status
            auth_message = e.response.data
        }
      expect(auth_status).toBe(401)
      expect(auth_message).toBe('Unauthorized')
    }catch(e){
        throw(e)
    }
})

test('Acceptance Test - User Logging to Server WHERE user doesn`t exists. 2.3.3', async () =>
{
    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })
        let login_status;
        let login_message;
        try{
            const login = await axiosInstance.post(
                `${api_domain}/login`,
                {
                    username: invalid_username,
                    password: valid_password
                }
            );
        }
        catch(e){
            login_status = e.response.status
            login_message = e.response.data
        }
        expect(login_status).toBe(401)
        expect(login_message).toBe('Username or Password incorrect')
        
        let auth_status;
        let auth_message;

        try{
        const auth = await axiosInstance.get(
        `${api_domain}/users/`,{
          })
        }
        catch(e){
            auth_status = e.response.status
            auth_message = e.response.data
        }
      expect(auth_status).toBe(401)
      expect(auth_message).toBe('Unauthorized')
    }catch(e){
        throw(e)
    }
})