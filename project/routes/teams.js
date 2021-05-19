var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const coaches_utils = require("./utils/coaches_utils");

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  let team_details = [];
  try {
    const team_players_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    const team_details = await teams_utils.getTeamInfo(
      req.params.teamId
    )
    const team_coach_details = await coaches_utils.getCoachInfoByTeam(
      req.params.teamId
    )
    team_details.coach = team_coach_details
    team_details.team_players = team_players_details
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
