
var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const association_users_utils = require("./utils/association_users_utils");
const users_utils = require("./utils/users_utils");
const auth_utils = require("./utils/auth_utils");

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


router.use(async function (req, res, next) {
  try{
    const is_association = await auth_utils.isAssociationUser(req.user_id)
    if(is_association){next();}
    else {res.sendStatus(403);}
  }catch(err){next(err)}
  });



router.put("/event/:eventId", async (req, res, next) => {
  try {
    event_description = req.body.date + ',' + req.body.time + 
      ',' + req.body.minute + ',' + req.body.description
    await association_users_utils.updateEvent(req.params.eventId, event_description)
    res.status(200).send("The event was successfully updated.");
  } catch (error) {
    next(error);
  }
});

router.post("/event/", async (req, res, next) => {
  try {
    event_description = req.body.date + ',' + req.body.time + 
      ',' + req.body.minute + ',' + req.body.description
    await association_users_utils.addEvent(req.body.match_id, event_description)
    res.status(200).send("The event was successfully added.");
  } catch (error) {
    next(error);
  }
});


router.put("/results/:matchId", async (req, res, next) => {
  try {
    await association_users_utils.updateMatchResults(req.params.matchId,
        req.body.home_goal, req.body.away_goal)
    res.status(200).send("The results was successfully added.");
  } catch (error) {
    next(error);
  }
});


router.post("/addMatch", async (req, res, next) => {
  try {
    // check if Referee is clear Before!!!!!!
    
    //referee is clear Dr.Shaked.
    await association_users_utils.addNewMatch(
      req.body.date, req.body.hour, req.body.host_team, req.body.away_team,
      req.body.league_id, req.body.season_id, req.body.stage_id, 
      req.body.stadium
    )
    res.status(200).send("The match was successfully added.");
  } catch (error) {
    next(error);
  }
});

router.delete("/event/:eventId", async (req, res, next) => {
  try {
    await association_users_utils.deleteEvent(req.params.eventId)
    res.status(200).send("The event was successfully deleted.");
  } catch (error) {
    next(error);
  }
});

router.delete("/deleteMatch/:matchId", async (req, res, next) => {
  try {
    await association_users_utils.deleteMatch(req.params.matchId)
    res.send("The match was successfully deleted.");
  } catch (error) {
    next(error);
  }
});
// roleId 2 meaning referee role
// status 0 meaning pending for user approval
/**
 * request for append user as role to Role table 
 * checking if the user existing in user table and if it not exist in Roles table already
 */
router.post("/AppointmentReferee", async (req,res,next) => {
  try{
    user_id = req.body.user_id
    user_exist = await users_utils.userExist(user_id)
    if (!user_exist){
      throw {staus:404, message: 'userId doesnt exist in system'};
    }
    const appointmentAble = await association_users_utils.appointmentableToReferee(user_id)
    if (!appointmentAble){
      throw {status: 404, message: 'userId is already referee or not appointmentable to referee'};
    }
    try{
      await association_users_utils.sendRefereeAppointmentRequest(user_id)
    } catch(err){
      throw {status:404, message: 'Appointment request has already been sent to this userId'}
    }
    res.status(200).send('Referee appointment request have been sent to user.');
  }
  catch(error){
    next(error);
  }

})

module.exports = router;
