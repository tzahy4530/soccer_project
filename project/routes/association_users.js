var express = require("express");
var router = express.Router();
const association_users_utils = require("./utils/association_users_utils");
const users_utils = require("./utils/users_utils");
const matches_utils = require("./utils/matches_utils");
const auth_utils = require("./utils/auth_utils");
const league_utils = require("./utils/league_utils")

router.use(async function(req, res, next) {
    try {
        if (req.session && req.session.user_id) {
            const valid = await auth_utils.isValidSession(req.session.user_id)
            if (valid) {
                req.user_id = req.session.user_id;
                next();
            }
        } else {
            res.sendStatus(401);
        }
    } catch (err) { next(err) }
});


router.use(async function(req, res, next) {
    try {
        const is_association = await auth_utils.isAssociationUser(req.user_id)
        if (is_association) { next(); } else { res.sendStatus(403); }
    } catch (err) { next(err) }
});



router.put("/event/:eventId", async(req, res, next) => {
    try {
        event_description = req.body.date + ',' + req.body.time +
            ',' + req.body.minute + ',' + req.body.description
        await association_users_utils.updateEvent(req.params.eventId, event_description)
        res.status(200).send("The event was successfully updated.");
    } catch (error) {
        next(error);
    }
});

router.post("/event/", async(req, res, next) => {
    try {
        event_description = req.body.date + ',' + req.body.time +
            ',' + req.body.minute + ',' + req.body.description
        await association_users_utils.addEvent(req.body.match_id, event_description)
        res.status(200).send("The event was successfully added.");
    } catch (error) {
        next(error);
    }
});


router.put("/results/:matchId", async(req, res, next) => {
    try {
        await association_users_utils.updateMatchResults(req.params.matchId,
            req.body.home_goal, req.body.away_goal)
        res.status(200).send("The results was successfully added.");
    } catch (error) {
        next(error);
    }
});


router.post("/addMatch", async(req, res, next) => {
    try {
        const validDate = await matches_utils.isValidDateForMatch(
            req.body.host_team, req.body.away_team, req.body.date, req.body.stadium)
        if (!validDate) {
            throw { status: 403, message: "Match date isn't available." }
        }
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

router.delete("/event/:eventId", async(req, res, next) => {
    try {
        await association_users_utils.deleteEvent(req.params.eventId)
        res.status(200).send("The event was successfully deleted.");
    } catch (error) {
        next(error);
    }
});

router.delete("/deleteMatch/:matchId", async(req, res, next) => {
    try {
        await association_users_utils.deleteMatch(req.params.matchId)
        res.send("The match was successfully deleted.");
    } catch (error) {
        next(error);
    }
});


/**
 * request for append user as role to Role table 
 * checking if the user existing in user table and if it not exist in Roles table already
 */
router.post("/AppointmentReferee", async(req, res, next) => {
    try {
        username = req.body.username;
        user_id = await auth_utils.getUserIdByUsername(username);
        user_exist = await users_utils.userExist(user_id);
        if (!user_exist) {
            throw { staus: 404, message: 'userId doesnt exist in system' };
        }
        const appointmentAble = await association_users_utils.appointmentableToReferee(user_id)
        if (!appointmentAble) {
            throw { status: 404, message: 'userId is already referee or not appointmentable to referee' };
        }
        try {
            await association_users_utils.sendRefereeAppointmentRequest(user_id)
        } catch (err) {
            throw { status: 404, message: 'Appointment request has already been sent to this userId' }
        }
        res.status(200).send('Referee appointment request have been sent to user.');
    } catch (error) {
        console.log(error.message);
        next(error);
    }
});

router.post("/AppointmentRefereeToSeason", async(req, res, next) => {
    try {
        const username = req.body.username;
        const user_id = await auth_utils.getUserIdByUsername(username);
        const is_referee = await association_users_utils.isReferee(user_id);
        if (!is_referee) {
            throw { status: 404, message: 'userId is not define as referee' };
        }
        await association_users_utils.addRefereeToSeason(user_id, req.body.league_id, req.body.season_id)
        res.status(201).send(`referee was appointments to chosen season`);
    } catch (error) {
        next(error);
    }
});

router.post("/appointmentRefereeToMatch", async(req, res, next) => {
    try {
        const username = req.body.username;
        const user_id = await auth_utils.getUserIdByUsername(username);
        const league_id = req.body.league_id;
        const season_id = req.body.season_id;
        const match_id = req.body.match_id;
        const isRefereeInSeason = await association_users_utils.isRefereeInSeason(user_id, league_id, season_id);
        if (!isRefereeInSeason) {
            throw { status: 404, message: 'user id isnt appointment to referee in chosen season' };
        }
        const checkValidDateForRefereeAppointment = await association_users_utils.checkValidDateForRefereeAppointment(user_id, match_id);
        if (!checkValidDateForRefereeAppointment) {
            throw { status: 404, message: 'referee is appointment to other game in this date' };
        }
        await association_users_utils.appointmentRefeereToMatch(user_id, match_id);
        res.status(202).send('referee was added successfully to chosen match');
    } catch (error) {
        next(error);
    }
});

router.post("/gameSchedulingPolicy", async(req, res, next) => {
    try {
        const league_id = req.body.league_id
        const seasson_id = req.body.seasson_id
        let all_teams = await league_utils.getAllTeamsInLeague(seasson_id);
        let all_stadiums = await league_utils.getAllStadiums(all_teams);
        const all_pairs = []
        for (let i = 0; i < all_teams.length - 1; i++) {
            for (let j = i + 1; j < all_teams.length; j++) {
                all_pairs.push([all_teams[i], all_teams[j]])
                all_pairs.push([all_teams[j], all_teams[i]])
            }
        }
        let date = new Date(Date.now())
        let stage
        for (let i = 0; i < all_pairs.length; i++) {
            // console.log(all_pairs[i]);
            const stadium = all_stadiums[all_pairs[i][0]];
            try{
                stage = (await league_utils.getLeagueDetails(league_id)).current_stage_id
            } catch(e){
                stage = 1
            }

            date = new Date(date + ( 3600 * 1000 * 24));
            let y = date.getFullYear(),
                m = date.getMonth() + 1, // january is month 0 in javascript
                d = date.getDate();
            let date_string = String(d)+'/'+String(m)+'/'+String(y)
            association_users_utils.addNewMatch(date_string,"12:00",all_pairs[i][0],all_pairs[i][1],league_id,seasson_id,stage,stadium)
        }
        res.status(202).send('All games was added successfully');
    } catch (error) {
        next(error);
    }
});



module.exports = router;