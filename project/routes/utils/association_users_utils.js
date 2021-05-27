const e = require("express");
const DButils = require("./DButils");


async function updateEvent(event_id, description){
  await DButils.execQuery(
    `UPDATE dbo.events 
    SET description = '${description}'
    WHERE event_id = '${event_id}';`
 );
}

async function addEvent(match_id, description){
  await DButils.execQuery(
    `INSERT INTO dbo.events (match_id, description)
    VALUES ('${match_id}', '${description}')`
 );
}

async function updateMatchResults(match_id, home_goal, away_goal){
  await DButils.execQuery(
    `UPDATE dbo.matches 
    SET home_goal = '${home_goal}',
    away_goal = '${away_goal}'
    WHERE match_id = '${match_id}';`
 );
}

async function addNewMatch(date, hour, host_team, away_team,
  league_id, season_id, stage_id, stadium){
  await DButils.execQuery(
    `INSERT INTO dbo.matches (date,hour,host_team,away_team,league_id, season_id,
      stage_id,stadium)
    VALUES ('${date}','${hour}','${host_team}','${away_team}',
    '${league_id}','${season_id}',
    '${stage_id}','${stadium}');`
 );
}

async function deleteEvent(event_id){
  await DButils.execQuery(
    `DELETE FROM dbo.events 
    WHERE event_id = '${event_id}';`
 );
}

async function deleteMatch(match_id){
  await DButils.execQuery(
    `DELETE FROM dbo.events 
    WHERE match_id = '${match_id}';`
    )

  await DButils.execQuery(
    `DELETE FROM dbo.matches 
    WHERE match_id = '${match_id}';`
    )
}

async function appointmentableToReferee(user_id){
  const user_roles = await DButils.execQuery(`SELECT * FROM dbo.Roles WHERE userId=${user_id}`);
  if (user_roles.find((x) => x.roleId != process.env.fanRole)){
    return false
  }
  return true
}

async function sendRefereeAppointmentRequest(user_id){
  await DButils.execQuery(`INSERT INTO dbo.RequestRole (userId,roleId) VALUES
   (${user_id},${process.env.refereeRole})`)
}

exports.sendRefereeAppointmentRequest = sendRefereeAppointmentRequest;
exports.appointmentableToReferee = appointmentableToReferee;
exports.deleteMatch = deleteMatch;
exports.deleteEvent = deleteEvent;
exports.addNewMatch = addNewMatch;
exports.updateMatchResults = updateMatchResults;
exports.addEvent = addEvent;
exports.updateEvent = updateEvent;
