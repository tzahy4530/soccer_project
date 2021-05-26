var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const league_utils = require("./utils/league_utils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const coaches_utils = require("./utils/coaches_utils");

router.get("/teamFullDetails/:teamId", async (req, res, next) => {

  try {
    const team_players_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    const team_details = await teams_utils.getTeamInfoById(
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

router.get("/teamFullDetails/search/:teamName", async (req, res, next) => {
  try {
    const team_details = await teams_utils.getTeamInfoByName(
      req.params.teamName
    )
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});

router.get("/teamFullDetails/", async (req, res, next) => {
  try {
    const seasson_details = await league_utils.getLeagueCurrentSeassonId();
    const teams_details = await teams_utils.getAllTeamsInfoBySeassonId(
      seasson_details.current_season_id)
    //we should keep implementing team page.....
    res.send(teams_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
