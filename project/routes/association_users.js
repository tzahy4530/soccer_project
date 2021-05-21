
var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const association_users_utils = require("./utils/association_users_utils");

router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT userId FROM dbo.users")
      .then((users) => {
        if (users.find((x) => x.userId === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});


router.use(async function (req, res, next) {
    DButils.execQuery(`SELECT permissions FROM dbo.users WHERE userId = '${req.user_id}'`)
      .then((permissions) => {
        if (permissions[0].permissions >= 2) {
          next();
        }
        else {
          res.sendStatus(403);
        }
      })
      .catch((err) => next(err));
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
    await association_users_utils.addNewMatch(
      req.body.date, req.body.hour, req.body.host_team, req.body.away_team,
      req.body.stage_id, req.body.referee_id, req.body.stadium
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

module.exports = router;
