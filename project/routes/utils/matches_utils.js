const DButils = require("./DButils");

async function getMatchInfo(match_id){
  
  const match_details = await DButils.execQuery(
    `SELECT * FROM matches WHERE (match_id = '${match_id}')`
    )

  if (match_details.length == 0) throw { status: 404, message: "wrong id, association member dosen't exists." }

  const events = await DButils.execQuery(
    `SELECT * FROM events WHERE (match_id = '${match_id}')`
    )

  match_rel_details = {
    match_id: match_details[0].match_id,
    league_id: match_details[0].league_id,
    season_id: match_details[0].season_id,
    stage_id: match_details[0].stage_id,
    host_team: match_details[0].host_team,
    away_team: match_details[0].away_team,
    date: match_details[0].date,
    hour: match_details[0].hour,
    referee_id: match_details[0].referee_id,
    stadium: match_details[0].stadium
  }
  
  if (match_details[0].home_goal != null){
    match_rel_details.results = {
      home_goal: match_details[0].home_goal,
      away_goal: match_details[0].away_goal
    }
  }

  if (events.length > 0){
    events_arr = []
    events.map((e) =>{
      events_arr.push({
        event_id: e.event_id,
        event: e.description
      })
    })
    match_rel_details.events = events_arr
  }

  return match_rel_details
}

async function getStageMatches(stage_id) {
  const matches_ids = await DButils.execQuery(
    `select match_id from dbo.Matches where stage_id='${stage_id}'`
  );
  return matches_ids;
}

async function getSeasonMatches(season_id) {
  const matches_ids = await DButils.execQuery(
    `select match_id from dbo.Matches where season_id='${season_id}'`
  );
  return matches_ids;
}

async function getLeagueMatches(league_id) {
  const matches_ids = await DButils.execQuery(
    `select match_id from dbo.Matches where league_id='${league_id}'`
  );
  return matches_ids;
}

async function getMatchesInfo(matches_ids_array){
  return await Promise.all(matches_ids_array.map((match_id) => {
    return getMatchInfo(match_id)
  }))
}

async function isValidDateForMatch(home_team, away_team, date, stadium){
  const teams_matches = await DButils.execQuery(
    `select * from dbo.Matches WHERE (date='${date}'
     AND (host_team = '${home_team}' OR host_team = '${away_team}' OR away_team = '${home_team}'
      OR away_team = '${away_team}' ))`
      );
  if (teams_matches.length > 0){
    return false
  }
  const stadium_matches = await DButils.execQuery(
    `select * from dbo.Matches WHERE (date='${date}' AND stadium='${stadium}')`
      );
  if (stadium_matches.length > 0 ){
    return false
  }
  return true
}

exports.isValidDateForMatch = isValidDateForMatch;
exports.getSeasonMatches = getSeasonMatches;
exports.getLeagueMatches = getLeagueMatches;
exports.getStageMatches = getStageMatches;
exports.getMatchInfo = getMatchInfo;
exports.getMatchesInfo = getMatchesInfo;
