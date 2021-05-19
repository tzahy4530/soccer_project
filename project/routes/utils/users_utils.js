const DButils = require("./DButils");
// Players
async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into dbo.FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select playerId from dbo.FavoritePlayers where userId='${user_id}'`
  );
  return player_ids;
}

//Teams
async function markTeamAsFavorite(user_id, team_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteTeams values ('${user_id}',${team_id})`
  );
}

async function getFavoriteTeams(user_id) {
  const teams_ids = await DButils.execQuery(
    `select teamId from dbo.FavoriteTeams where userId='${user_id}'`
  );
  return teams_ids;
}


//Matches
async function markMatchAsFavorite(user_id, match_id) {
  await DButils.execQuery(
    `insert into dbo.FavoriteMatches values ('${user_id}',${match_id})`
  );
}

async function getFavoriteMatches(user_id) {
  const teams_ids = await DButils.execQuery(
    `select matchId from dbo.FavoriteMatches where userId='${user_id}'`
  );
  return teams_ids;
}

//Players function export
exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;

//Teams function export
exports.markTeamAsFavorite = markTeamAsFavorite;
exports.getFavoriteTeams = getFavoriteTeams;

//Matches function export
exports.markMatchAsFavorite = markMatchAsFavorite;
exports.getFavoriteMatches = getFavoriteMatches;
