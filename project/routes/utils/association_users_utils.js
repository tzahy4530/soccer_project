const DButils = require("./DButils");

/** update exist Event */
async function updateEvent(event_id, description) {
    await DButils.execQuery(
        `UPDATE dbo.events 
    SET description = '${description}'
    WHERE event_id = '${event_id}';`
    );
}

/** add new event to a match */
async function addEvent(match_id, description) {
    await DButils.execQuery(
        `INSERT INTO dbo.events (match_id, description)
    VALUES ('${match_id}', '${description}')`
    );
}

/** update match results goals */
async function updateMatchResults(match_id, home_goal, away_goal) {
    try {
        await DButils.execQuery(
            `UPDATE dbo.matches 
      SET home_goal = '${home_goal}',
      away_goal = '${away_goal}'
      WHERE match_id = '${match_id}';`
        );
    } catch (error) {
        return false;
    }
    return true;

}

/** adding new match to DB */
async function addNewMatch(date, hour, host_team, away_team,
    league_id, season_id, stage_id, stadium) {
    await DButils.execQuery(
        `INSERT INTO dbo.Matches (date,hour,host_team,away_team,league_id, season_id,
      stage_id,stadium)
    VALUES ('${date}','${hour}','${host_team}','${away_team}',
    '${league_id}','${season_id}',
    '${stage_id}','${stadium}');`
    );
}

/** delete event from DB*/
async function deleteEvent(event_id) {
    await DButils.execQuery(
        `DELETE FROM dbo.events 
    WHERE event_id = '${event_id}';`
    );
}

/** delete match from DB */
async function deleteMatch(match_id) {
    await DButils.execQuery(
        `DELETE FROM dbo.events 
    WHERE match_id = '${match_id}';`
    )

    await DButils.execQuery(
        `DELETE FROM dbo.matches 
    WHERE match_id = '${match_id}';`
    )
}

/** return true if the user is able to get referee request */
async function appointmentableToReferee(user_id) {
    const user_roles = await DButils.execQuery(`SELECT * FROM dbo.Roles WHERE userId=${user_id}`);
    if (user_roles.find((x) => x.roleId != process.env.fanRole)) {
        return false
    }
    return true
}

/** sending referee appointment request to user */
async function sendRefereeAppointmentRequest(user_id) {
    await DButils.execQuery(`INSERT INTO dbo.RequestRole (userId,roleId) VALUES
   (${user_id},${process.env.refereeRole})`)
}

/** return true if user is referee  */
async function isReferee(user_id) {
    const is_referee = await DButils.execQuery(`SELECT * FROM dbo.Roles WHERE userId=${user_id} and roleId=${process.env.refereeRole}`);
    return is_referee.length == 1;
}

/** return true if the referee is defined referee for this seasson */
async function isRefereeInSeason(user_id, league_id, season_id) {
    const is_referee = await DButils.execQuery(`SELECT * FROM dbo.RefereeAppointments WHERE userId=${user_id} and leagueId=${league_id} and seasonId=${season_id}`);
    return is_referee.length == 1;
}

/** define referee to a seasson */
async function addRefereeToSeason(userId, leagueId, seasonId) {
    try {
        await DButils.execQuery(`INSERT INTO dbo.RefereeAppointments (userId,leagueId,seasonId) VALUES (${userId},${leagueId},${seasonId})`);
    } catch {
        throw { status: 404, message: "unable to append referee to selected season" };
    }
}

/** return date of match by match_id  */
async function getDateByMatchId(match_id) {
    const match_details = await DButils.execQuery(`SELECT date FROM dbo.Matches where match_id=${match_id}`);
    if (match_details.length != 1) {
        throw { status: 404, message: 'match isnt find' };
    }
    return match_details[0].date;
}

/** cheking if referee is available to take a role in the choosen game (by game id) */
async function checkValidDateForRefereeAppointment(user_id, match_id) {
    const refereeMatches = await DButils.execQuery(`SELECT date FROM dbo.Matches where referee_id=${user_id}`);
    const match_date = await getDateByMatchId(match_id);
    return !refereeMatches.find((x) => x.date == match_date)
}

/** appointment referee to match */
async function appointmentRefeereToMatch(user_id, match_id) {
    try {
        await DButils.execQuery(`UPDATE dbo.Matches SET referee_id=${user_id} where match_id=${match_id}`)
    } catch (error) {
        console.log('--------------------------------------------------------------------')
        throw { status: 404, message: "unable to append referee to selected match" };
    }
}
exports.sendRefereeAppointmentRequest = sendRefereeAppointmentRequest;
exports.appointmentableToReferee = appointmentableToReferee;
exports.deleteMatch = deleteMatch;
exports.deleteEvent = deleteEvent;
exports.addNewMatch = addNewMatch;
exports.updateMatchResults = updateMatchResults;
exports.addEvent = addEvent;
exports.updateEvent = updateEvent;
exports.isReferee = isReferee;
exports.addRefereeToSeason = addRefereeToSeason;
exports.isRefereeInSeason = isRefereeInSeason;
exports.checkValidDateForRefereeAppointment = checkValidDateForRefereeAppointment;
exports.appointmentRefeereToMatch = appointmentRefeereToMatch;