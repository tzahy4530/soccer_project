const ass_users_utils = require('../../project/routes/utils/association_users_utils')


test('Check valid date for referee WHERE refere is busy in the same game.', async () =>
{
    referee_user_id = 8
    match_id = 1
    const valid = await ass_users_utils.checkValidDateForRefereeAppointment(8,1)
    return expect(valid).toBe(false)
})

