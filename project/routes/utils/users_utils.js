const DButils = require("./DButils");
//Players
/** append player by player Id to favorite list of user by user Id  */
async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into dbo.FavoritePlayers values ('${user_id}',${player_id})`
  );
}
/** get all favorite players by user id  */
async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from dbo.FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}
/** delete player by player Id from user (- define by user Id ) from players favorite list*/
async function deleteFavoritePlayer(user_id, player_id){
  await DButils.execQuery(
    `DELETE FROM dbo.favoritePlayers 
    WHERE (user_id = '${user_id}' AND player_id = '${player_id}');`
    )
}
//Teams
/** append group by group Id to favorite list of user by user Id  */
async function markTeamAsFavorite(user_id, team_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteTeams values ('${user_id}',${team_id})`
  );
}
/** get all favorite groups by user id  */
async function getFavoriteTeams(user_id) {
  const teams_ids = await DButils.execQuery(
    `select team_id from dbo.FavoriteTeams where user_id='${user_id}'`
  );
  return teams_ids;
}
/** delete group by group Id from user (- define by user Id ) from group favorite list */
async function deleteFavoriteTeam(user_id, team_id){
  await DButils.execQuery(
    `DELETE FROM dbo.favoriteTeams 
    WHERE (user_id = '${user_id}' AND team_id = '${team_id}');`
    );
}


//Matches
/** append match by match Id to favorite list of user by user Id  */
async function markMatchAsFavorite(user_id, match_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteMatches values ('${user_id}',${match_id})`
  );
}
/** get all favorite matchs by user id  */
async function getFavoriteMatches(user_id) {
  const teams_ids = await DButils.execQuery(
    `select match_id from dbo.FavoriteMatches where user_id='${user_id}'`
  );
  return teams_ids;
}
/** delete match by match Id from user (- define by user Id ) from match favorite list */
async function deleteFavoriteMatch(user_id, match_id){
  await DButils.execQuery(
    `DELETE FROM dbo.favoriteMatches 
    WHERE (user_id = '${user_id}' AND match_id = '${match_id}');`
    );
}
/** get user id and check if exist in db */
async function userExist(user_id){
  const existing_in_users_table = await DButils.execQuery(`SELECT * FROM dbo.Users WHERE userId='${user_id}'`);
  if (existing_in_users_table.length==0){
    return false
  }
  return true
}


// refereeRequests
/** get user Id and check if there is role request waiting for approve */
async function awaitingRefereeRequest(user_id){
  const user_referee_requests = await DButils.execQuery(
    `SELECT * FROM dbo.RequestRole WHERE (userId=${user_id} AND
       roleId=${process.env.refereeRole})`
    );
  if (user_referee_requests.length == 0){
    return false
  }
  return true
}
/** user id approve his referee role request */
async function userRefereeAppointment(user_id){
  await DButils.execQuery(`DELETE FROM dbo.RequestRole WHERE userId=${user_id}`)
  await DButils.execQuery(`INSERT INTO dbo.Roles (userId,roleId) VALUES
   (${user_id},${process.env.refereeRole})`)
}

//utils
exports.userExist = userExist;

//Referee Requests
exports.awaitingRefereeRequest = awaitingRefereeRequest;
exports.userRefereeAppointment =userRefereeAppointment;

//Players function export
exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.deleteFavoritePlayer = deleteFavoritePlayer;

//Teams function export
exports.markTeamAsFavorite = markTeamAsFavorite;
exports.getFavoriteTeams = getFavoriteTeams;
exports.deleteFavoriteTeam = deleteFavoriteTeam;

//Matches function export
exports.markMatchAsFavorite = markMatchAsFavorite;
exports.getFavoriteMatches = getFavoriteMatches;
exports.deleteFavoriteMatch = deleteFavoriteMatch