const { test, expect } = require('@jest/globals')
const ass_user_utils = require('../../project/routes/utils/association_users_utils');
const auth_utils = require('../../project/routes/utils/auth_utils');
const DButils = require('../../project/routes/utils/DButils');
const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const api_domain = "http://localhost:3000";
let valid_username = 'test'
let valid_password = 'password_test'

async function initDummies() {
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '1', '2', '271', '17328', '1', 'Camp Nou');
    await ass_user_utils.addNewMatch('04/06/2021', '18:00', '3', '4', '271', '17328', '2', 'Santiago Bernabeu');

    await auth_utils.addNewUser(valid_username, 'test', 'test', auth_utils.hashPassword(valid_password), 'test@gmail.com', 'noLink', '')
    let user_ID = await auth_utils.getUserIdByUsername(valid_username);
    await DButils.execQuery(
        `INSERT INTO dbo.Roles (userId, roleId) VALUES  (${user_ID}, 7);`
    );
}

beforeAll(async() => {
    await initDummies();
    axiosCookieJarSupport(axios)
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());

})

// Acceptance Tests
test('Acceptance Test - association user post new valid match. 9.7.2.1', async() => {
    try {
        const cookieJar = new tough.CookieJar();
        const axiosInstance = axios.create({
            jar: cookieJar,
            withCredentials: true
        })
        const login = await axiosInstance.post(
            `${api_domain}/login`, {
                username: valid_username,
                password: valid_password
            }
        );
        const response = (await axiosInstance.post(`${api_domain}/associationUsers/addMatch`, {
            date: '12/06/2021',
            hour: '21:00',
            host_team: '2',
            away_team: '3',
            league_id: '271',
            season_id: '18334',
            stage_id: '1',
            stadium: 'Sami Ofer'
        })).status
        return expect(response).toBe(200);
    } catch (error) {
        return expect(true).toBe(false);
    }
});

test('Acceptance Test - association user post new invalid match, home team plays that date. 9.7.2.2', async() => {
    try {
        const cookieJar = new tough.CookieJar();
        const axiosInstance = axios.create({
            jar: cookieJar,
            withCredentials: true
        })
        const login = await axiosInstance.post(
            `${api_domain}/login`, {
                username: valid_username,
                password: valid_password
            }
        );
        const response = (await axiosInstance.post(`${api_domain}/associationUsers/addMatch`, {
            date: '03/06/2021',
            hour: '21:00',
            host_team: '2',
            away_team: '3',
            league_id: '271',
            season_id: '18334',
            stage_id: '1',
            stadium: 'Sami Ofer'
        })).status
        return expect(true).toBe(false);
    } catch (error) {
        return expect(error.response.status).toBe(403);
    }
});

test('Acceptance Test - association user post new invalid match, away team plays that date. 9.7.2.2', async() => {
    try {
        const cookieJar = new tough.CookieJar();
        const axiosInstance = axios.create({
            jar: cookieJar,
            withCredentials: true
        })
        const login = await axiosInstance.post(
            `${api_domain}/login`, {
                username: valid_username,
                password: valid_password
            }
        );
        const response = (await axiosInstance.post(`${api_domain}/associationUsers/addMatch`, {
            date: '04/06/2021',
            hour: '21:00',
            host_team: '2',
            away_team: '3',
            league_id: '271',
            season_id: '18334',
            stage_id: '1',
            stadium: 'Sami Ofer'
        })).status
        return expect(true).toBe(false);
    } catch (error) {
        return expect(error.response.status).toBe(403)
    }
});