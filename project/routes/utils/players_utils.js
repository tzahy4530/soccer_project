const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}


function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const {player_id, fullname, image_path, position_id,
       common_name, nationality, birthdate, birthcountry, height, weight} = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      id: player_id,
      name: fullname,
      common_name: common_name,
      position: position_id,
      team_name: name,
      nationality: nationality,
      birthdate: birthdate,
      birthcountry: birthcountry,
      height: height,
      weight: weight,
      image: image_path,
    };
  });
}


async function getPlayersByTeam(team_id) {
  const player_ids_list = await getPlayerIdsByTeam(team_id);
  const players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
