const axios = require("axios");
const DButils = require("./DButils");
const api_domain = process.env.api_domain;
const LEAGUE_ID = process.env.league_id;

/** getting closet match of Choosen League ID */
async function getClosetMatch() {
  try{
    const closet_match= await DButils.execQuery(
      'SELECT TOP 1 match_id, date, hour, host_team, away_team, referee_id, stage_id, stadium, season_id from dbo.Matches where CONVERT(DATETIME,date,103) >= GETDATE() ORDER BY CONVERT(DATETIME,date,103)'
    );
    return closet_match;
    }
    catch(error){
      throw error;
    }

}
/** get relevance deatils from league by league_id */
async function getLeagueDetails(league_id) {
  const league = await axios.get(
    `${api_domain}/leagues/${league_id}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const stage = await axios.get(
    `${api_domain}/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  const next_game= await getClosetMatch();
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    current_stage_id: stage.data.data.id,
    next_game_details: next_game.length==1 ? next_game[0] : null
    // next game details should come from DB
  };
}

/** get all Leagues in external API */
async function getAllLeagues(){
  const all_league= await axios.get(`${api_domain}/leagues`,{
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return all_league.data.data.map((data)=>{
    return {
      name: data.name,
      id: data.id
    };
  });
}

/** getting current seasson of League ID */
async function getLeagueCurrentSeassonId(){
  const league = await axios.get(
    `${api_domain}/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const {current_season_id, current_stage_id, current_round_id} = league.data.data
  return {
    current_season_id: current_season_id,
    current_stage_id: current_stage_id,
    current_round_id: current_round_id
  }
}

/** getting league deatils by league id */
async function getLeagueById(id){
  const league_by_id=await axios.get(`${api_domain}/leagues/${id}`,
  {
    params: {
      api_token: process.env.api_token,
      include: "country,seasons"
    }
  });
  return {
    league_id: league_by_id.data.data.id,
    league_name: league_by_id.data.data.name, 
    country:league_by_id.data.data.country.data.name,
    season: [
      league_by_id.data.data.seasons.data.map(function callbackFn (season){
        return{
        season_id: season.id,
        season_year: season.name
      }
    })
    ],
  }
}

/** getting seasson details which belong to specific league */
async function getSeasonByLeagueID(leagueID,seasonID){
  const league_info=await axios.get(`${api_domain}/leagues/${leagueID}`,
  {
    params: {
      api_token: process.env.api_token,
      include: "seasons"
    }
  });
  seasons=league_info.data.data.seasons.data;
  res=seasons.filter(season=> season.id==seasonID)[0];
  return {
    season_id: res.id,
    season_year: res.name,
    cur_stage:res.current_stage_id,
    stages: await getStagesBySeason(res.id)
  }
}

/** getting stage details by seasson id */
async function getStagesBySeason(seasonID){
  const seasonInfo=await axios.get(`${api_domain}/seasons/${seasonID}`,
  {
    params:{
      api_token: process.env.api_token,
      include: "stages"
    }
  });
  return seasonInfo.data.data.stages.data.map(function callbackFn(stage){
    return {
      id:stage.id,
      name:stage.name,
      type:stage.type,
    }
  });
}

/** get all teams ids who belong to specific seasson in league */
async function getAllTeamsInLeague(seasson_id) {
  const all_fixtures = await getAllFixtures(seasson_id)
  const all_teams_in_league = getAllTeamsFromFixtures(all_fixtures)
  return all_teams_in_league;
}

/** getting all matches from External API */
async function getAllFixtures(seasson_id) {
  const all_fixtures = (await axios.get(
      `${api_domain}/seasons/${seasson_id}`, {
          params: {
              include: "SEASON_ID",
              include: "fixtures",
              api_token: process.env.api_token,
          }
      }
  )).data.data.fixtures.data
  return all_fixtures;
}

/** getting all Teams ids from all matches of External API */
async function getAllTeamsFromFixtures(all_fixtures) {
  all_teams = []
  all_fixtures.map((fixture) => {
      if (!(all_teams.includes(fixture.localteam_id)))
          all_teams.push(fixture.localteam_id)
      if (!(all_teams.includes(fixture.visitorteam_id)))
          all_teams.push(fixture.visitorteam_id)
  })
  return all_teams
}

/** getting all stadiums who belong to the teams */
async function getAllStadiums(all_teams) {
  all_stadiums = {}
  for (let i = 0; i < all_teams.length; i++) {
      const stadium = (await axios.get(
          `${api_domain}/teams/${all_teams[i]}`, {
              params: {
                  include: "TEAM_NAME",
                  include: "venue",
                  api_token: process.env.api_token,
              },
          }
      )).data.data.venue.data.name;
      all_stadiums[all_teams[i]] = stadium;
  }
  return all_stadiums;
}

exports.getStagesBySeason = getStagesBySeason;
exports.getAllStadiums = getAllStadiums;
exports.getAllTeamsInLeague = getAllTeamsInLeague;
exports.getLeagueDetails = getLeagueDetails;
exports.getLeagueCurrentSeassonId = getLeagueCurrentSeassonId;
exports.getAllLeagues = getAllLeagues;
exports.getLeagueById=getLeagueById;
exports.getSeasonByLeagueID=getSeasonByLeagueID;
