const axios = require("axios");
const e = require("express");
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
    
    event_describe = match_date + ',' + time + ',' + minute + ',' +type_describe
    return event_describe

  }

  async function getMatchesInfo(matches_ids_list){
    let promises = [];
    matches_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/fixtures/${id}?include=events.player`, {
          params: {
            api_token: process.env.api_token,
          },
        })
      )
    );
    let matches_info = await Promise.all(promises);
    const matches_rel_info = await extractRelevantMatchesData(matches_info);
    return matches_rel_info
  }


  async function extractRelevantMatchData(match_info) {
    const {stage_id,season_id,league_id,time, id, localteam_id, visitorteam_id, venue_id}=match_info.data.data
      game_hour = time.starting_at.time.split(':').slice(0,2).join(':')
      game_date = time.starting_at.date.split('-').reverse().join('/')
      let stadium_info = await getStadiumName(venue_id) 
      if ("scores" in match_info.data.data){ // this game belong to past-games.
        const {localteam_score,visitorteam_score} = match_info.data.data.scores
        events = match_info.data.data.events.data.map((array_item) => {
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
          date: game_date,
          hour: game_hour,
          host_team: localteam_id,
          away_team: visitorteam_id,
          stadium: stadium_info,
          results: {'home_goal': localteam_score,'away_goal:':visitorteam_score},
          events: events
        }  
      }
      return{ // this game belong to futregames.
        match_id: id,
        league_id: league_id,
        season_id: season_id,
        stage_id: stage_id,
        date: game_date,
        hour: game_hour,
        host_team: localteam_id,
        away_team: visitorteam_id,
        stadium: stadium_info,
      }
  }


  async function extractRelevantMatchesData(matches_info) {
    return await Promise.all(matches_info.map( async (match_info) => {
        return extractRelevantMatchData(match_info)
      }))
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

    const matche_rel_info = await extractRelevantMatchData(match_info);
    return matche_rel_info
  }


  exports.getMatchInfo=getMatchInfo
  exports.getMatchesInfo=getMatchesInfo;
