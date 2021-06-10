var express = require("express");
var router = express.Router();
const matches_utils = require("./utils/matches_utils");


/**
 * Get match details by match ID.
 */
router.get("/:matchId", async (req, res, next) => {
  try {
    const match_rel_details = await matches_utils.getMatchInfo(
      req.params.matchId)
    res.send(match_rel_details);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all matches details by stage ID.
 */
router.get("/stage/:stageId", async (req, res, next) => {
  try {
    const matches_ids = await matches_utils.getStageMatches(req.params.stageId)
    matches_ids_array = []
    matches_ids.map((element) => matches_ids_array.push(element.match_id));
    const matches_rel_details = await matches_utils.getMatchesInfo(matches_ids_array)
    res.send(matches_rel_details);  
  } catch (error) {
    next(error);
  }
});

/**
 * Get all matches details by season ID.
 */
router.get("/season/:seasonId/", async (req, res, next) => {
  try {
    const matches_ids = await matches_utils.getSeasonMatches(req.params.seasonId)
    matches_ids_array = []
    matches_ids.map((element) => matches_ids_array.push(element.match_id));
    const matches_rel_details = await matches_utils.getMatchesInfo(matches_ids_array)
    res.send(matches_rel_details);  
  } catch (error) {
    next(error);
  }
});

/**
 * Get all matches details by league ID.
 */
router.get("/league/:leagueId/", async (req, res, next) => {
  try {
    const matches_ids = await matches_utils.getLeagueMatches(req.params.leagueId)
    matches_ids_array = []
    matches_ids.map((element) => matches_ids_array.push(element.match_id));
    const matches_rel_details = await matches_utils.getMatchesInfo(matches_ids_array)
    res.send(matches_rel_details);  
  } catch (error) {
    next(error);
  }
});

module.exports = router;
