const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


async function getTeamsInfo(teams_ids_list){
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

async function getTeamInfo(team_id){
  const team_info = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      api_token: process.env.api_token,
    },
  })
  return extractRelevantTeamData(team_info)
}

function extractRelevantTeamData(team_info) {
    //const { fullname, image_path, position_id } = player_info.data.data;
    const {name, id, logo_path, short_code, coach}=team_info.data.data;
    return {
      name: name,
      logo: logo_path,
      id: id,
      short_code: short_code,
    };
}

function extractRelevantTeamsData(teams_info) {
    return teams_info.map((team_info) => {
      //const { fullname, image_path, position_id } = player_info.data.data;
      const {name, id, logo_path, short_code, coach}=team_info.data.data;
      return {
        name: name,
        logo: logo_path,
        id: id,
        short_code: short_code,
      };
    });
  }

  exports.getTeamsInfo=getTeamsInfo;
  exports.getTeamInfo=getTeamInfo;