const association_users_utils = require('../../../project/routes/utils/association_users_utils')
const auth_utils = require('../../../project/routes/utils/auth_utils')
const DButils = require('../../../project/routes/utils/DButils')
const user_utils = require('../../../project/routes/utils/users_utils')
var last_match_added_matchId=undefined;
var last_match_added_matchId_2=undefined;
var user_id_referee=undefined;
var user_id_testR=undefined;
var user_id_for_integration=undefined;

async function initDummies(){
    // append new user
    await auth_utils.addNewUser('referee','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('testR','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('refereeA','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    // await auth_utils.addNewUser('refereeB','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    //get new users id
    user_id_referee = await auth_utils.getUserIdByUsername('referee');
    user_id_testR = await auth_utils.getUserIdByUsername('testR');
    user_id_for_integration= await auth_utils.getUserIdByUsername('refereeA');
    //appoint user to be referee in choosen league and season
    await DButils.execQuery(`INSERT INTO dbo.roles (userId,roleId) VALUES (${user_id_referee},${process.env.refereeRole})`);
    await DButils.execQuery(`INSERT INTO dbo.RefereeAppointments (userId,leagueId,seasonId) VALUES (${user_id_referee},271,17328)`);   
    last_match_added_matchId=await DButils.execQuery(`INSERT INTO dbo.Matches (date,hour,host_team,away_team,referee_id,stage_id,stadium,league_id,season_id,away_goal,home_goal) VALUES ('04/04/2021','16:05',2394,2905,NULL,77448541,'Farum,Right to Dream Park',271,17328,0,0); SELECT @@IDENTITY`);
    last_match_added_matchId_2=await DButils.execQuery(`INSERT INTO dbo.Matches (date,hour,host_team,away_team,referee_id,stage_id,stadium,league_id,season_id,away_goal,home_goal) VALUES ('04/04/2021','16:05',2394,2905,NULL,77448541,'Farum,Right to Dream Park',271,17328,0,0); SELECT @@IDENTITY`);
    last_match_added_matchId=last_match_added_matchId[0][''];
    last_match_added_matchId_2=last_match_added_matchId_2[0][''];
    await DButils.execQuery(`INSERT INTO dbo.Roles VALUES (${user_id_for_integration},${process.env.refereeRole})`);
}

beforeAll(async ()=> {
    await initDummies();
})


/*
UNIT TESTES
*/ 

test('is referee role - expect to false', async()=>
{
    const userId=user_id_testR;
    return expect(await association_users_utils.isReferee(userId)).toBeFalsy();
})

test('is referee role - expect to true', async()=>
{
    const userId=user_id_referee;
    return expect(await association_users_utils.isReferee(userId)).toBeTruthy();
}) 
test('appointment referee to match', async() =>
{
    // const leagueId=271;
    // const seasonId=17328;
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await association_users_utils.appointmentRefeereToMatch(userId,matchId);
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId}`);
    return expect(referee_appointment_check[0]['referee_id']).toBe(userId);

})

test('checking referee is appointment to season - expect to get false', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_testR;
    return expect(await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId)).toBeFalsy();
})

test('checking referee is appointment to season - expect to get true', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_referee;
    return expect(await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId)).toBeTruthy();
})

test('checking valid date for referee appointment - expect to get false', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id = ${userId} WHERE match_id=${matchId}`);
    return expect(await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId)).toBeFalsy();
})

test('checking valid date for referee appointment - expect to get false', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id = NULL WHERE match_id=${matchId}`);
    return expect(await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId)).toBeTruthy();
})

/* INTEGRATION TESTES */

test ('appointment referee to season', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_for_integration;
    const isReferee=await association_users_utils.isReferee(userId);
    if (isReferee){
        await association_users_utils.addRefereeToSeason(userId,leagueId,seasonId);
    }
    return expect(await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId)).toBeTruthy();
})

test ('appointment referee to season and match', async()=>
{

    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_for_integration;
    const matchId=last_match_added_matchId;

    //delete referee from refereeappointment table that appended in prev test
    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);

    const isReferee=await association_users_utils.isReferee(userId);
    if (isReferee){
        await association_users_utils.addRefereeToSeason(userId,leagueId,seasonId);
        const is_valid_date=await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId);
        if (is_valid_date){
            await association_users_utils.appointmentRefeereToMatch(userId,matchId);
        }
    }
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId}`);
    return expect(referee_appointment_check[0]['referee_id']).toBe(userId);
})

test ('appointment referee to season and match - should return false', async()=>
{

    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_for_integration;
    const matchId=last_match_added_matchId;
    const matchId_2=last_match_added_matchId_2;

    //delete referee from refereeappointment table that appended in prev test and update one match that this user is referee on
    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id=${userId} WHERE match_id=${matchId}`);

    const isReferee=await association_users_utils.isReferee(userId);
    if (isReferee){
        await association_users_utils.addRefereeToSeason(userId,leagueId,seasonId);
        const is_valid_date=await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId_2);
        if (is_valid_date){
            await association_users_utils.appointmentRefeereToMatch(userId,matchId_2);
        }
    }
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId_2}`);
    return expect(referee_appointment_check[0]['referee_id']).toBeNull();
})

/* ACCEPTANCE TESTES */

test()

// test('append user to request role for referee role', async()=>
// {
//     const userId=user_id_refereeAppointment;
//     await association_users_utils.sendRefereeAppointmentRequest(userId);
//     const is_user_in_RequestRole=await DButils.execQuery(`SELECT roleId FROM dbo.RequestRole where userId=${userId}`);  
//     return expect(is_user_in_RequestRole[0]["roleId"]).toBe(parseInt(process.env.refereeRole));

// })

// test('user approving for referee role', async() =>
// {
//     const userId=user_id_refereeAppointmentApprove;
//     console.log(userId);
//     await user_utils.userRefereeAppointment(userId);
//     const removed_from_roleRequest= await DButils.execQuery(`SELECT * FROM dbo.RequestRole where userId=${userId}`);
//     console.log(removed_from_roleRequest);
//     const is_in_Role_table=await DButils.execQuery(`SELECT roleId FROM dbo.Roles where userId=${userId} `)
//     test_obejct=[removed_from_roleRequest.length ,is_in_Role_table.find(x=>x.roleId==process.env.refereeRole).roleId];
//     console.log(test_obejct);
//     const expected=[1,6];
//     return expect(test_obejct).toEqual(expect.arrayContaining([0,parseInt(process.env.refereeRole)]));
// })






