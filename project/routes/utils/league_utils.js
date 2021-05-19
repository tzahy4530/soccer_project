const axios = require("axios");
const api_domain = process.env.api_domain;
const LEAGUE_ID = process.env.league_id;

async function getLeagueDetails() {
  const league = await axios.get(
    `${api_domain}/leagues/${LEAGUE_ID}`,
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
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    // next game details should come from DB
  };
}

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


exports.getLeagueDetails = getLeagueDetails;
exports.getLeagueCurrentSeassonId = getLeagueCurrentSeassonId;
