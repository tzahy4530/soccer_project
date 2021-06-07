const { test, expect } = require('@jest/globals')
const ass_user_utils = require('../../../project/routes/utils/association_users_utils');
const matches_utils = require('../../../project/routes/utils/matches_utils');
const DButils = require('../../../project/routes/utils/DButils');


async function initDummies() {
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '1', '2', '271', '17328', '1', 'Camp Nou');
    await ass_user_utils.addNewMatch('04/06/2021', '18:00', '3', '4', '271', '17328', '2', 'Santiago Bernabeu');
}

beforeAll(async() => {
    await initDummies();

})

//Unit Tests
test('Unit Test - Add new match. 9.7.2.0.0.1', async() => {
    try {
        await ass_user_utils.addNewMatch('10/06/2021', '18:00', '1', '2', '271', '18334', '1', 'Camp Nou');
        const match = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches WHERE host_team = '1' AND away_team = '2' AND date = '10/06/2021'`
        ))[0]
        return expect(match).toBeInstanceOf(Object)
    } catch (error) {
        return false;
    }
});

test('Unit Test - Set match data when host team already play that date. 9.7.2.0.0.2 ', async() => {
    const result = await matches_utils.isValidDateForMatch('1', '3', '03/06/2021', 'Sami Ofer')
    return expect(result).toBe(false)
});

test('Unit Test - Set match data when away team already play that date. 9.7.2.0.0.3', async() => {
    const result = await matches_utils.isValidDateForMatch('1', '3', '04/06/2021', 'Bloomfield')
    return expect(result).toBe(false)
});

test('Unit Test - Set match data when both teams are available. 9.7.2.0.0.4', async() => {
    const result = await matches_utils.isValidDateForMatch('1', '3', '07/06/2021', 'Terner')
    return expect(result).toBe(true)
});


// Integration Tests
test('Integration Test - Add new valid match. 9.7.2.0.1', async() => {
    try {
        const result = await matches_utils.isValidDateForMatch('1', '2', '11/06/2021', 'Bloomfield')
        expect(result).toBe(true)
        await ass_user_utils.addNewMatch('11/06/2021', '18:00', '1', '2', '271', '18334', '1', 'Bloomfield');
        const match = (await DButils.execQuery(
            `SELECT * FROM dbo.Matches WHERE host_team = '1' AND away_team = '2' AND date = '11/06/2021'`
        ))[0]
        return expect(match).toBeInstanceOf(Object)
    } catch (error) {
        return false;
    }
});

test('Integration Test - Add new invalid match, home team plays that date. 9.7.2.0.2', async() => {
    try {
        const result = await matches_utils.isValidDateForMatch('1', '3', '03/06/2021', 'Bloomfield')
        if (result) {
            await ass_user_utils.addNewMatch('03/06/2021', '18:00', '1', '3', '271', '18334', '1', 'Bloomfield');
            const match = (await DButils.execQuery(
                `SELECT * FROM dbo.Matches WHERE host_team = '1' AND away_team = '2' AND date = '03/06/2021'`
            ))[0]
            return expect(true).toBeInstanceOf(false)
        } else
            return expect(result).toBe(false)
    } catch (error) {
        return false;
    }
});

test('Integration Test - Add new invalid match, away team plays that date. 9.7.2.0.3', async() => {
    try {
        const result = await matches_utils.isValidDateForMatch('1', '3', '04/06/2021', 'Bloomfield')
        if (result) {
            await ass_user_utils.addNewMatch('04/06/2021', '18:00', '1', '3', '271', '18334', '1', 'Bloomfield');
            const match = (await DButils.execQuery(
                `SELECT * FROM dbo.Matches WHERE host_team = '1' AND away_team = '2' AND date = '04/06/2021'`
            ))[0]
            return expect(true).toBeInstanceOf(false)
        } else
            return expect(result).toBe(false)
    } catch (error) {
        return false;
    }
});