const axios = require("axios");
const api_domain = process.env.api_domain;
/** this function get list of teams id and return list of team info for each team */
async function getTeamsInfoById(teams_ids_list){
    let promises = [];
    teams_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/teams/${id}`, {
          params: {
            api_token: process.env.api_token,
          },
        })
      )
    );
    let teams_info = await Promise.all(promises);
    return extractRelevantTeamsData(teams_info);
  }
/** this function get single team id and return team info */
async function getTeamInfoById(team_id){
  const team_info = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      api_token: process.env.api_token,
    },
  })
  return extractRelevantTeamData(team_info.data.data)
}
/** this function get name and return list of team info fro each team that match to given name  */
async function getTeamInfoByName(team_name){
  const team_info = await axios.get(`${api_domain}/teams/search/${team_name}`, {
    params: {
      api_token: process.env.api_token,
    },
  })
  return extractRelevantTeamsData(team_info)
}
/** return info about all team that take a part in given season */
async function getAllTeamsInfoBySeassonId(seasson_id){
  const all_teams = await axios.get(`${api_domain}/teams/season/${seasson_id}`, {
    params: {
      api_token: process.env.api_token,
    },
  })
return extractRelevantTeamsData(all_teams);

}

/** this function get team info object from api and extract : id, name, logo path and short code .only for internal usage */
function extractRelevantTeamData(team_info) {
    //const { fullname, image_path, position_id } = player_info.data.data;
    const {name, id, logo_path, short_code}=team_info;
    return {
      id: id,
      name: name,
      logo: logo_path,
      short_code: short_code,
    };
}

/** this function get an object of teams info and return team info for each team the object contain .only for internal usage */
function extractRelevantTeamsData(teams_info) {
  try{
    return teams_info.map((team_info) => {
      //const { fullname, image_path, position_id } = player_info.data.data;
      return extractRelevantTeamData(team_info.data.data)
    });
  } catch(err){
      try{
      return teams_info.data.data.map((team_info) => {
        //const { fullname, image_path, position_id } = player_info.data.data;
        return extractRelevantTeamData(team_info)
      });
   } catch(err){
       throw err
  }
  } 

}


  exports.getTeamsInfoById=getTeamsInfoById;
  exports.getTeamInfoById=getTeamInfoById;
  exports.getTeamInfoByName=getTeamInfoByName;
  exports.getAllTeamsInfoBySeassonId=getAllTeamsInfoBySeassonId;