var express = require("express");
var router = express.Router();
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const matches_utils = require("./utils/matches_utils");
const auth_utils = require("./utils/auth_utils");

/**
 * Authenticate all incoming requests by middleware
 */
 router.use(async function (req, res, next) {
  try{
    if (req.session && req.session.user_id) {
        const valid = await auth_utils.isValidSession(req.session.user_id)
        if(valid){
          req.user_id = req.session.user_id;
          next();}}
  else {
    res.sendStatus(401);
  }}catch(err){next(err)}
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_id = req.body.playerId;
    if (typeof player_id === 'undefined' ){
      throw { status: 400, message: "Bad request, one of the argument not given." };
    }
    try{
    await users_utils.markPlayerAsFavorite(user_id, player_id);
    } catch(err){
      throw { status: 404, message: "wrong id, association member dosen't exists." }
    }
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.delete("/favoritePlayers/:playerId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    await users_utils.deleteFavoritePlayer(user_id,req.params.playerId)
    res.status(200).send("The Player was successfully deleted.");
  } catch (error) {
    next(error);
  }
});



/**
 * This path gets body with teamId and save this team in the favorites list of the logged-in user
 */
 router.post("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_id = req.body.teamId;
    if (typeof team_id === 'undefined' ){
      throw { status: 400, message: "Bad request, one of the argument not given." };
    }
    try{
    await users_utils.markTeamAsFavorite(user_id, team_id);
    }catch(err){
      throw { status: 404, message: "wrong id, team dosen't exists." };
    }
    res.status(201).send("The team successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites teams that were saved by the logged-in user
 */
router.get("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_ids = await users_utils.getFavoriteTeams(user_id);
    let team_ids_array = [];
    team_ids.map((element) => team_ids_array.push(element.team_id)); //extracting the teams ids into array
    const results = await teams_utils.getTeamsInfoById(team_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.delete("/favoriteTeams/:teamId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    await users_utils.deleteFavoriteTeam(user_id, req.params.teamId)
    res.status(200).send("The Team was successfully deleted.");
  } catch (error) {
    next(error);
  }
});

/**
 * Function for user approve referee role for himself
 */
router.post("/refereeApprove", async(req,res,next)=>{
  try{
      const awaiting_for_approval= users_utils.awaitingRefereeRequest(req.user_id)
      if (!awaiting_for_approval){
        throw {status:404, message:'this user doesnt panding for approva'};
      }
      users_utils.userRefereeAppointment(req.user_id)
      res.status(200).send('userId approved request to be referee.');
  } 
  catch(error){
    next(error);
  }

});

/**
 * This path gets body with matchId and save this team in the favorites list of the logged-in user
 */
 router.post("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_id = req.body.matchId;
    if (typeof match_id === 'undefined' ){
      throw { status: 400, message: "Bad request, one of the argument not given." };
    }
    try{
    await users_utils.markMatchAsFavorite(user_id, match_id);
    } catch(err){
      throw { status: 404, message: "wrong id, match dosen't exists." };
    }
    res.status(201).send("The match successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites matches that were saved by the logged-in user
 */
router.get("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_ids = await users_utils.getFavoriteMatches(user_id);
    let match_ids_array = [];
    match_ids.map((element) => match_ids_array.push(element.match_id)); //extracting the players ids into array
    const results = await matches_utils.getMatchesInfo(match_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});


router.delete("/favoriteMatches/:matchId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    users_utils.deleteFavoriteMatch(user_id, req.params.matchId)
    res.status(200).send("The Match was successfully deleted.");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
