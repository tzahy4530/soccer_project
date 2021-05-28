var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    res.status(200).send(league_details);
  } catch (error) {
    next(error);
  }
});

router.get("/:leagueId/:seasonId", async(req,res,next)=>{
  try{
    const result = await league_utils.getSeasonByLeagueID(req.params.leagueId,req.params.seasonId);
    if (res.length==0){
      throw 'league doesnt exist';
    }
    res.status(200).send(result);
  }catch(error){
    next(error);
  }

});

router.get("/:leagueId", async(req,res,next)=>{
  try{
    res.status(200).send(await league_utils.getLeagueById(req.params.leagueId));
  }catch(error){
    next(error);
  }

});

router.get("/", async(req,res,next)=>{
    try{ 
      const leagues_details= await league_utils.getAllLeagues();
      res.status(200).send(leagues_details);
    }catch(error){
      next(error);
     }
  }
);

module.exports = router;
