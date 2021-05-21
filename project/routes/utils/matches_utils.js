const axios = require("axios");
const e = require("express");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

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
    stage_id: match_details[0].stage_id,
    host_team: match_details[0].host_team,
    away_team: match_details[0].away_team,
    date: match_details[0].date,
    hour: match_details[0].hour,
    referee_id: match_details[0].referee_id 
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

async function getAllSeassons(){
  cuurent_seasson_id = 17328
  seassons = await axios.get(`${api_domain}/seasons/${cuurent_seasson_id}`, {
    params: {
      include: "stages",
      api_token: process.env.api_token,
    },
  })
  return seassons.data.data.stages.data.map((stage)=>{
    return stage.id
  })
}

async function getStageMatches(stage_id) {
  const matches_ids = await DButils.execQuery(
    `select match_id from dbo.Matches where stage_id='${stage_id}'`
  );
  return matches_ids;
}

async function getMatchesInfo(matches_ids_array){
  return await Promise.all(matches_ids_array.map((match_id) => {
    return getMatchInfo(match_id)
  }))
}

exports.getStageMatches=getStageMatches;
exports.getMatchInfo=getMatchInfo;
exports.getMatchesInfo=getMatchesInfo;
