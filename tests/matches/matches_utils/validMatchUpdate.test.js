const ass_user_utils = require('../../../project/routes/utils/association_users_utils')

async function initDummies() {
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '1', '2', '271', '17328', '1', 'Camp Nou');
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '3', '4', '271', '17328', '2', 'Santiago Bernabeu');
}

beforeAll(async() => {
    await initDummies()
})

test('Check valid update when score is leagal ', async() => {
    const valid_login = await ass_user_utils.updateMatchResults('1', '1', '3');
    return expect(valid_login).toBe(undefined)
})

test('Check valid update when score is ileagal ', async() => {
    const valid_login = await ass_user_utils.updateMatchResults('1', '-1', '3');
    return expect(valid_login).toBe(undefined)
})