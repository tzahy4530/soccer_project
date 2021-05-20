
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
        
    for (match_info in match_details){  
      const match_id = await DButils.execQuery(
       `INSERT INTO dbo.matches (date, hour, host_team, away_team, referee_id, stadium, home_goal, away_goal)
        VALUES ('${match_info.date}', '${match_info.hour}','${match_info.home_team}',
        '${match_info.away_team}', '${match_info.referee_id}','${match_info.stadium}', '${match_info.results.home_goal}',
        '${match_info.results.away_goal}');
        SELECT SCOPE_IDENTITY() as id;`
      );
      
      for (e in match_info.events){
        await DButils.execQuery(
          `INSERT INTO dbo.events (match_id, description)
           VALUES ('${match_id.id}', '${e.event}';`
         );  
      } 
    }
    

    res.send(match_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
