const axios = require("axios");
const e = require("express");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

  function describeEvent(type, player_name, match_date, match_hour, time, related_player_name) {
    let type_describe;

    if (type.includes('goal')){
      type_describe = type + ' by ' + player_name + '.'
    }

    else if (type.includes('card')){
      type_describe = type + ' to ' + player_name + '.'
    }

    else if ('substitution' == type){
      type_describe = type + ' of ' + player_name + ' by ' + related_player_name  + '.'
    }
    else if (type.includes('off')){
      type_describe = type + ' by ' + player_name + '.'
    }

    else if ('injury' == type) {
      type_describe = type + ' of ' + player_name + '.'
    }
    else return null
    
    // time in game.
    let minute = time
    let splited_hour = match_hour.split(':')
    while(parseInt(splited_hour[1]) + parseInt(time) >= 60){
      splited_hour[0] = String(parseInt(splited_hour[0]) + 1)
      time = parseInt(time) - 60
    }
    splited_hour[1] = String(parseInt(splited_hour[1]) + parseInt(time))
    if (splited_hour[1].length == 1) splited_hour[1] = '0' + splited_hour[1]
    time = splited_hour[0] + ':' + splited_hour[1]
    
    event_describe = match_date + ',' + time + ',' + minute + ',' +type_describe.replace("'","''")
    return event_describe

  }

  async function getMatchesInfo(matches_ids_list){
    let promises = [];
    matches_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/fixtures/${id}`, {
          params: {
            include: "events.player",
            api_token: process.env.api_token,
          },
        })
      )
    );
    let matches_info = await Promise.all(promises);
    const matches_rel_info = extractRelevantMatchesData(matches_info);
    for (i in matches_rel_info){
      matches_rel_info[i].stadium = await getStadiumName( matches_rel_info[i].stadium)
    }
    return matches_rel_info
  }


  function extractRelevantMatchData(match_info) {
    const {id, season_id, league_id, time, stage_id, referee_id, localteam_id, visitorteam_id, venue_id}=match_info
      game_hour = time.starting_at.time.split(':').slice(0,2).join(':')
      game_date = time.starting_at.date.split('-').reverse().join('/')
      if ("scores" in match_info){ // this game belong to past-games.
        const {localteam_score,visitorteam_score} = match_info.scores
        events = match_info.events.data.map((array_item) => {
          try{
            const {type,player_name,minute,related_player_name} = array_item
            return {'event' : describeEvent(type,player_name,game_date,game_hour,minute,related_player_name)}
          }
          catch(error){
            throw error
          }
        }) 
        return{
          match_id: id,
          league_id: league_id,
          season_id: season_id,
          stage_id: stage_id,
          referee_id: referee_id,
          date: game_date,
          hour: game_hour,
          home_team: localteam_id,
          away_team: visitorteam_id,
          stadium: venue_id,
          results: {'home_goal': localteam_score,'away_goal':visitorteam_score},
          events: events
        }  
      }
      return{ // this game belong to futregames.
        match_id: id,
        league_id: league_id,
        season_id: season_id,
        stage_id: stage_id,
        referee_id: referee_id,
        date: game_date,
        hour: game_hour,
        home_team: localteam_id,
        away_team: visitorteam_id,
        stadium: venue_id,
      }
  }


  function extractRelevantMatchesData(matches_info) {
    return matches_info.map((match_info) => {
        return extractRelevantMatchData(match_info.data.data)
      })
  }

  async function getStadiumName(venue_id){
    const venue_info = await axios.get(`${api_domain}/venues/${venue_id}`, {
      params: {
        api_token: process.env.api_token,
      },
    })
    return venue_info.data.data.city + ',' + venue_info.data.data.name;
  }


  async function getMatchInfo(match_id){
    const match_info = await axios.get(`${api_domain}/fixtures/${match_id}`, {
          params: {
            include: "events.player",
            api_token: process.env.api_token,
          },
        })

    const match_rel_info = await extractRelevantMatchData(match_info);
    return match_rel_info
  }

async function getAllMatchesInfoByStageId(stage_id){
  const matches_info = await axios.get(`${api_domain}/stages/${stage_id}`, {
    params: {
      include: "fixtures,results",
      api_token: process.env.api_token,
    },
  })
  const matches_ids_list = matches_info.data.data.fixtures.data.map((match_info) =>
  {
    return match_info.id
  })
  const gamesInfo = await getMatchesInfo(matches_ids_list.slice(0,20))
  
  
  return gamesInfo
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

async function initMatchDB(){
  try {
    const match_details = await getAllMatchesInfoByStageId(
      77448541
    )
    if (match_details.length == 0) return
    
    for (i in match_details){  
      const match_id = await DButils.execQuery(
      `INSERT INTO dbo.matches (date, hour, host_team, away_team, referee_id, stage_id, stadium, home_goal, away_goal)
        VALUES ('${match_details[i].date}', '${match_details[i].hour}',
        '${match_details[i].home_team}','${match_details[i].away_team}',
        '${match_details[i].referee_id}','${match_details[i].stage_id}',
        '${match_details[i].stadium}','${match_details[i].results.home_goal}',
        '${match_details[i].results.away_goal}');
        SELECT SCOPE_IDENTITY() as id;`
      );
      
      for (k in match_details[i].events){
        await DButils.execQuery(
          `INSERT INTO dbo.events (match_id, description)
          VALUES ('${match_id[0].id}','${match_details[i].events[k].event}');`
        );  
      } 
    } 
    }catch(err){
      throw err  
  }
}
  exports.initMatchDB=initMatchDB;
  exports.getAllMatchesInfoByStageId=getAllMatchesInfoByStageId;
  exports.getMatchInfo=getMatchInfo;
  exports.getMatchesInfo=getMatchesInfo;
