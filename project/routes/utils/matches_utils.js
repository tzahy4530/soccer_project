const axios = require("axios");
const e = require("express");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

function getMatchInfo(match_details,events){
  match_rel_details = {
    match_id: match_details.match_id,
    stage_id: match_details.stage_id,
    host_team: match_details.host_team,
    away_team: match_details.away_team,
    date: match_details.date,
    hour: match_details.hour,
    referee_id: match_details.referee_id 
  }
  
  if (match_details.home_goal != null){
    match_rel_details.results = {
      home_goal: match_details.home_goal,
      away_goal: match_details.away_goal
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

// exports.getAllMatchesInfoByStageId=getAllMatchesInfoByStageId;
exports.getMatchInfo=getMatchInfo;
// exports.getMatchesInfo=getMatchesInfo;
