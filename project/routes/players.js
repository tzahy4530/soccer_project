var express = require("express");
var router = express.Router();
const players_utils = require("./utils/players_utils");

/** get player's information by giving his ID */
router.get("/:playerId", async(req, res, next) => {
    try {
        const player_info = await players_utils.getPlayerInfoById(req.params.playerId)
        res.send(player_info);
    } catch (error) {
        next(error);
    }
});

/** search players by name, return information about them. */
router.get("/search/:playerName", async(req, res, next) => {
    try {
        const players_info = await players_utils.getPlayerInfoByName(
            req.params.playerName
        )
        res.send(players_info);
    } catch (error) {
        next(error);
    }
});

module.exports = router;