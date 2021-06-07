const association_users_utils = require('../../../project/routes/utils/association_users_utils')
const auth_utils = require('../../../project/routes/utils/auth_utils')
const DButils = require('../../../project/routes/utils/DButils')
const axios = require("axios");
const user_utils = require('../../../project/routes/utils/users_utils')
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

const api_domain = "http://localhost:3000";
var last_match_added_matchId=undefined;
var last_match_added_matchId_2=undefined;
var user_id_referee=undefined;
var user_id_testR=undefined;
var user_id_for_integration=undefined;
var user_id_assosiate=undefined;
var user_id_for_acceptance=undefined;

async function initDummies(){
    // append new user
    await auth_utils.addNewUser('referee','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('testR','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('refereeA','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('refereeB','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    await auth_utils.addNewUser('au','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    // await auth_utils.addNewUser('refereeB','test','test',auth_utils.hashPassword('password_test'),'test@gmail.com','noLink','')
    //get new users id
    user_id_referee = await auth_utils.getUserIdByUsername('referee');
    user_id_testR = await auth_utils.getUserIdByUsername('testR');
    user_id_for_integration= await auth_utils.getUserIdByUsername('refereeA');
    user_id_for_acceptance= await auth_utils.getUserIdByUsername('refereeB');
    user_id_assosiate= await auth_utils.getUserIdByUsername('au');
    //appoint user to be referee in choosen league and season
    await DButils.execQuery(`INSERT INTO dbo.roles (userId,roleId) VALUES (${user_id_referee},${process.env.refereeRole})`);
    await DButils.execQuery(`INSERT INTO dbo.roles (userId,roleId) VALUES (${user_id_assosiate},${process.env.associationUserRole})`);
    await DButils.execQuery(`INSERT INTO dbo.RefereeAppointments (userId,leagueId,seasonId) VALUES (${user_id_referee},271,17328)`);   
    last_match_added_matchId=await DButils.execQuery(`INSERT INTO dbo.Matches (date,hour,host_team,away_team,referee_id,stage_id,stadium,league_id,season_id,away_goal,home_goal) VALUES ('04/04/2021','16:05',2394,2905,NULL,77448541,'Farum,Right to Dream Park',271,17328,0,0); SELECT @@IDENTITY`);
    last_match_added_matchId_2=await DButils.execQuery(`INSERT INTO dbo.Matches (date,hour,host_team,away_team,referee_id,stage_id,stadium,league_id,season_id,away_goal,home_goal) VALUES ('04/04/2021','16:05',2394,2905,NULL,77448541,'Farum,Right to Dream Park',271,17328,0,0); SELECT @@IDENTITY`);
    last_match_added_matchId=last_match_added_matchId[0][''];
    last_match_added_matchId_2=last_match_added_matchId_2[0][''];
    await DButils.execQuery(`INSERT INTO dbo.Roles VALUES (${user_id_for_integration},${process.env.refereeRole})`);
}

beforeAll(async ()=> {
    axiosCookieJarSupport(axios);
    await initDummies();
})


/*
UNIT TESTES
*/ 

test('Unit Test - check if user is referee role WHERE user isnt referee role 9.4.0.0.1', async()=>
{
    const userId=user_id_testR;
    return expect(await association_users_utils.isReferee(userId)).toBeFalsy();
})

test('Unit Test - check if user is referee role WHERE user is referee role 9.4.0.0.2', async()=>
{
    const userId=user_id_referee;
    return expect(await association_users_utils.isReferee(userId)).toBeTruthy();
}) 
test('Unit Test - appointment referee to match 9.4.0.0.3', async() =>
{
    // const leagueId=271;
    // const seasonId=17328;
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await association_users_utils.appointmentRefeereToMatch(userId,matchId);
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId}`);
    return expect(referee_appointment_check[0]['referee_id']).toBe(userId);

})

test('Unit Test - checking referee is appointment to season WHERE he is not 9.4.0.0.4', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_testR;
    return expect(await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId)).toBeFalsy();
})

test('Unit Test - checking referee is appointment to season WHERE referee is appointment to season 9.4.0.0.5', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_referee;
    return expect(await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId)).toBeTruthy();
})

test('Unit Test - checking valid date for referee appointment WHERE it is not 9.4.0.0.6', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id = ${userId} WHERE match_id=${matchId}`);
    return expect(await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId)).toBeFalsy();
})

test('Unit Test - checking valid date for referee appointment WHERE is valid 9.4.0.0.7', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_referee;
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id = NULL WHERE match_id=${matchId}`);
    return expect(await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId)).toBeTruthy();
})

/* INTEGRATION TESTS */

test ('Integration Test - appointment referee to season 9.4.0.1', async()=>
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

test ('Integration Test - appointment referee to match WHERE all the conditions is valid 9.4.0.2', async()=>
{

    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_for_integration;
    const matchId=last_match_added_matchId;

    //delete referee from refereeappointment table that appended in prev test
    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await association_users_utils.addRefereeToSeason(userId,leagueId,seasonId);

    const is_referee_in_season=await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId);
    if (is_referee_in_season){
        const is_valid_date=await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId);
        if (is_valid_date){
            await association_users_utils.appointmentRefeereToMatch(userId,matchId);
        }
    }  
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId}`);
    return expect(referee_appointment_check[0]['referee_id']).toBe(userId);
})

test ('Integration Test - appointment referee and match WHERE isnt valid date 9.4.0.3', async()=>
{

    const leagueId=271;
    const seasonId=17328;
    const userId=user_id_for_integration;
    const matchId=last_match_added_matchId;
    const matchId_2=last_match_added_matchId_2;

    //delete referee from refereeappointment table that appended in prev test and update one match that this user is referee on
    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`UPDATE dbo.Matches SET referee_id=${userId} WHERE match_id=${matchId}`);
    await association_users_utils.addRefereeToSeason(userId,leagueId,seasonId);
    const is_referee_in_season=await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId);
    if (is_referee_in_season){
        const is_valid_date=await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId_2); //should return false
        if (is_valid_date){
            await association_users_utils.appointmentRefeereToMatch(userId,matchId_2);
        }
    }
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId_2}`);
    return expect(referee_appointment_check[0]['referee_id']).toBeNull();
})

test ('Integration Test - appointment referee and match WHERE user isnt define referee in season 9.4.0.4', async()=>
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
        const is_referee_in_season=await association_users_utils.isRefereeInSeason(userId,leagueId,seasonId); //should return false
        if (is_referee_in_season){
            const is_valid_date=await association_users_utils.checkValidDateForRefereeAppointment(userId,matchId_2);
            if (is_valid_date){
                await association_users_utils.appointmentRefeereToMatch(userId,matchId_2);
            }
        }
    }
    const referee_appointment_check=await DButils.execQuery(`SELECT referee_id FROM dbo.Matches where match_id=${matchId_2}`);
    return expect(referee_appointment_check[0]['referee_id']).toBeNull();
})

/* ACCEPTANCE TESTES */

test('Acceptance Test - assosiation user appointment user to referee in choosen season WHERE user still dont define as referee to choosen season. 9.4.1.1', async()=>
{
    const leagueId=271;
    const seasonId=17328;
    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })

        const login = await axiosInstance.post(
            `${api_domain}/login`,
            {
                username: "au",
                password: "password_test"
            }
        );
        expect(login.status).toBe(200);
    
        const appointment_referee=await axiosInstance.post(
            `${api_domain}/associationUsers/AppointmentReferee`,
            {
                username:"refereeB"
            }
        );
        expect(appointment_referee.status).toBe(200);
        
        // user approving his appointment
        await user_utils.userRefereeAppointment(user_id_for_acceptance);

        const appointmentRefereeToSeason=await axiosInstance.post(
            `${api_domain}/associationUsers/AppointmentRefereeToSeason`,
            {
                username: "refereeB",
                league_id: leagueId,
                season_id: seasonId

            }
        );
        return expect(appointmentRefereeToSeason.status).toBe(201);
    }catch(e){
        throw(e)
    }
})

test('Acceptance Test - assosiation user appointment user to referee in choosen season WHERE user already define as referee to choosen season. 9.4.1.2', async()=>
{
    const userId=user_id_for_acceptance;
    let appointmentRefereeToSeason_again={};
    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`DELETE from dbo.Roles where userId=${userId}`);
    const leagueId=271;
    const seasonId=17328;
    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })

        const login = await axiosInstance.post(
            `${api_domain}/login`,
            {
                username: "au",
                password: "password_test"
            }
        );
        expect(login.status).toBe(200);
    
        const appointment_referee=await axiosInstance.post(
            `${api_domain}/associationUsers/AppointmentReferee`,
            {
                username:"refereeB"
            }
        );
        expect(appointment_referee.status).toBe(200);
        
        // user approving his appointment
        await user_utils.userRefereeAppointment(user_id_for_acceptance);

        const appointmentRefereeToSeason=await axiosInstance.post(
            `${api_domain}/associationUsers/AppointmentRefereeToSeason`,
            {
                username: "refereeB",
                league_id: leagueId,
                season_id: seasonId

            }
        );
        expect(appointmentRefereeToSeason.status).toBe(201);

        appointmentRefereeToSeason_again=await axiosInstance.post(
            `${api_domain}/associationUsers/AppointmentRefereeToSeason`,
            {
                username: "refereeB",
                league_id: leagueId,
                season_id: seasonId

            }
        );
        return expect(appointmentRefereeToSeason_again.status).toBe(404);
    }
    finally{
        return expect(appointmentRefereeToSeason_again.status).toBeUndefined();
    }

})


test('Acceptance Test - assosiation user appointment user to referee in choosen match WHERE all the conditions is valid. 9.4.2.1', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_for_acceptance;
    const leagueId=271;
    const seasonId=17328;

    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`DELETE from dbo.Roles where userId=${userId}`);
    await DButils.execQuery(`INSERT INTO dbo.refereeAppointments VALUES (${userId},${leagueId},${seasonId})`);
    await DButils.execQuery(`INSERT INTO dbo.Roles VALUES (${userId},${process.env.refereeRole})`);
    await DButils.execQuery(`UPDATE dbo.matches SET referee_id=NULL WHERE match_id=${matchId}`);
    await DButils.execQuery(`UPDATE dbo.matches SET referee_id=NULL WHERE match_id=${last_match_added_matchId_2}`);
    const cookieJar = new tough.CookieJar();
    const axiosInstance  = axios.create({
        jar: cookieJar,
        withCredentials: true
        })

    const login = await axiosInstance.post(
        `${api_domain}/login`,
        {
            username: "au",
            password: "password_test"
        }
    );
    expect(login.status).toBe(200);

    const appointment_referee_to_match=await axiosInstance.post(
        `${api_domain}/associationUsers/appointmentRefereeToMatch`,
        {
            username:"refereeB",
            league_id:leagueId,
            season_id:seasonId,
            match_id:matchId
        }
    );
    console.log(appointment_referee_to_match.status);
    return expect(appointment_referee_to_match.status).toBe(202);
})


test('Acceptance Test - assosiation user appointment user to referee in choosen match WHERE user is not defined as referee to choosen league or season. 9.4.2.2 + 9.4.2.3', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_for_acceptance;
    let appointment_referee_to_match={};
    const leagueId=271;
    const seasonId=17328;

    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`DELETE from dbo.Roles where userId=${userId}`);
    await DButils.execQuery(`INSERT INTO dbo.Roles VALUES (${userId},${process.env.refereeRole})`);
    await DButils.execQuery(`UPDATE dbo.matches SET referee_id=NULL WHERE match_id=${matchId}`);

    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })

        const login = await axiosInstance.post(
            `${api_domain}/login`,
            {
                username: "au",
                password: "password_test"
            }
        );
        expect(login.status).toBe(200);
    
        const appointment_referee_to_match=await axiosInstance.post(
            `${api_domain}/associationUsers/appointmentRefereeToMatch`,
            {
                username:"refereeB",
                league_id:leagueId,
                season_id:seasonId,
                match_id:matchId
            }
        );
        return expect(appointment_referee_to_match.status).toBe(404);
    }
    catch(error){console.log(error)}
    finally{
    }

})

test('Acceptance Test - assosiation user appointment user to referee in choosen match WHERE the date conditions isnt valid. 9.4.2.4', async()=>
{
    const matchId=last_match_added_matchId;
    const userId=user_id_for_acceptance;
    const leagueId=271;
    const seasonId=17328;

    await DButils.execQuery(`DELETE from dbo.refereeAppointments where userId=${userId}`);
    await DButils.execQuery(`DELETE from dbo.Roles where userId=${userId}`);
    await DButils.execQuery(`INSERT INTO dbo.refereeAppointments VALUES (${userId},${leagueId},${seasonId})`);
    await DButils.execQuery(`INSERT INTO dbo.Roles VALUES (${userId},${process.env.refereeRole})`);
    await DButils.execQuery(`UPDATE dbo.matches SET referee_id=${userId} WHERE match_id=${matchId}`);

    try{
        const cookieJar = new tough.CookieJar();
        const axiosInstance  = axios.create({
            jar: cookieJar,
            withCredentials: true
          })

        const login = await axiosInstance.post(
            `${api_domain}/login`,
            {
                username: "au",
                password: "password_test"
            }
        );
        expect(login.status).toBe(200);
    
        const appointment_referee_to_match=await axiosInstance.post(
            `${api_domain}/associationUsers/appointmentRefereeToMatch`,
            {
                username:"refereeB",
                league_id:leagueId,
                season_id:seasonId,
                match_id:matchId
            }
        );
        return expect(appointment_referee_to_match.status).toBe(404);
    }
    catch(error){console.log(error)}
    finally{
    }

})






