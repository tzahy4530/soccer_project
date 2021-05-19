var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const matches_utils = require("./utils/matches_utils");



router.get("/:matchId", async (req, res, next) => {
  try {
    const match_details = await matches_utils.getMatchInfo(
      req.params.matchId
    )
    //we should keep implementing team page.....
    res.send(match_details);
  } catch (error) {
    next(error);
  }
});

router.get("/stage/:stageId", async (req, res, next) => {
  try {
    const match_details = await matches_utils.getAllMatchesInfoByStageId(
      req.params.stageId
    )
    //we should keep implementing team page.....
    res.send(match_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
