
var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const matches_utils = require("./utils/matches_utils");



router.get("/:matchId", async (req, res, next) => {
  try {
    const match_rel_details = await matches_utils.getMatchInfo(
      req.params.matchId)
    res.send(match_rel_details);
  } catch (error) {
    next(error);
  }
});

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

module.exports = router;
