const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


async function getMatchesInfo(matches_ids_list){
    let promises = [];
    teams_ids_list.map((id) =>
      promises.push(
        axios.get(`${api_domain}/match/${id}`, {
          params: {
            api_token: process.env.api_token,
          },
        })
      )
    );
    let matches_info = await Promise.all(promises);
    return extractRelevantMatchData(teams_info);
  }


function extractRelevantMatchData(teams_info) {
    return teams_info.map((match_info) => {
      //const { fullname, image_path, position_id } = player_info.data.data;
      const {name, id, logo_path, short_code}=match_info.data.data;
      return {
        name: name,
        logo: logo_path,
        id: id,
        short_code: short_code
      };
    });
  }

  exports.getMatchesInfo=getMatchesInfo;