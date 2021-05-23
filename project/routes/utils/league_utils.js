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

async function getLeagueById(id){
  const league_by_id=await axios.get(`${api_domain}/leagues/${id}`,
  {
    params: {
      api_token: process.env.api_token,
      include: "country,season"
    }
  });
  return {
    league_id: league_by_id.data.data.id,
    league_name: league_by_id.data.data.name, 
    country:league_by_id.data.data.country.data.name,
    season: [
      {
      season_id: league_by_id.data.data.season.data.id,
      season_year: league_by_id.data.data.season.data.name
      }
    ],
  }
}

async function getSeasonByLeagueID(leagueID,seasonID){
  const league_info=await axios.get(`${api_domain}/leagues/${id}`,
  {
    params: {
      api_token: process.env.api_token,
      include: "season"
    }
  });
  seasons=league_info.data.data.season;
  res=seasons.filter(season=> season.data.id==seasonID);
  return {
    season_id: res.data.id,
    season_year: res.data.name,
    
  }
}


exports.getLeagueDetails = getLeagueDetails;
exports.getLeagueCurrentSeassonId = getLeagueCurrentSeassonId;
exports.getAllLeagues = getAllLeagues;
exports.getLeagueById=getLeagueById;
