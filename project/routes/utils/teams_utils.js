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
    return extractRelevantTeamData(teams_info);
  }


function extractRelevantTeamData(teams_info) {
    return teams_info.map((team_info) => {
      //const { fullname, image_path, position_id } = player_info.data.data;
      const {name, id, logo_path, short_code}=team_info.data.data;
      return {
        name: name,
        logo: logo_path,
        id: id,
        short_code: short_code
      };
    });
  }

  exports.getTeamsInfo=getTeamsInfo;