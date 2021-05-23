var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

router.get("/:leagueID", async(req,res,next)=>{
  try{
    res.send(await league_utils.getLeagueById(req.params.leagueID));
  }catch(error){
    next(error);
  }

});

router.get("/", async(req,res,next)=>{
    try{ 
      const leagues_details= await league_utils.getAllLeagues();
      res.send(leagues_details);
    }catch(error){
      next(error);
     }
  }
);

module.exports = router;
