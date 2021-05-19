const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const teams_utils = require("./teams_utils");

async function getCoachInfoByTeam(team_id) {
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "coach",
      api_token: process.env.api_token,
    },
  });
  return extractRelevantCoachData(team.data.data.coach,team.data.data.name);
}

async function getCoachInfoById(coach_id) {
  const coach_info = await axios.get(`${api_domain}/coaches/${coach_id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
  const team_info = await teams_utils.getTeamInfo(coach_info.data.data.team_id)
  return extractRelevantPlayerData(coach_info.data,team_info.name);
}


function extractRelevantCoachData(coach_info,team_name) {
    const {coach_id, fullname, image_path,common_name, nationality, birthdate, birthcountry} = coach_info.data;
    return {
      id: coach_id,
      name: fullname,
      common_name: common_name,
      team_name: team_name,
      nationality: nationality,
      birthdate: birthdate,
      birthcountry: birthcountry,
      image: image_path,
    }
}

exports.getCoachInfoById = getCoachInfoById;
exports.getCoachInfoByTeam = getCoachInfoByTeam;
