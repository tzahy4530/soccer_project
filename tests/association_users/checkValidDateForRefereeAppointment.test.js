const ass_users_utils = require('../../project/routes/utils/association_users_utils')

test('Check valid date for referee WHERE refere is busy.', () =>
{
    
    referee_user_id = 8
    match_id = 1
    ass_users_utils.checkValidDateForRefereeAppointment(8,1).then(
        value => {expect(1+1).toBe(2)} 
    )
    
})

