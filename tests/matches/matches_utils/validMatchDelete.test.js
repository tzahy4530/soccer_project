const ass_user_utils = require('../../../project/routes/utils/association_users_utils')

async function initDummies() {
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '1', '2', '271', '17328', '1', 'Camp Nou');
    await ass_user_utils.addNewMatch('03/06/2021', '18:00', '3', '4', '271', '17328', '2', 'Santiago Bernabeu');
}

beforeAll(async() => {
    await initDummies()
})

test('Check match delte when game exists ', async() => {
    const valid_delete = await ass_user_utils.deleteMatch('1');
    return expect(valid_delete).toBe(undefined)
})

test(`Check match delete when game doesn't exist `, async() => {
    const valid_delete = await ass_user_utils.updateMatchResults('-1');
    return expect(valid_delete).toBe(undefined)
})