var server;
var path = require("path");
const session = require("client-sessions");
var logger = require("morgan");
var cors = require("cors");
var express = require("express");
var app = express();
require("dotenv").config();
const DButils = require("./DButils");

app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
    session({
        cookieName: "session", // the cookie key name
        secret: process.env.COOKIE_SECRET, // the encryption key
        duration: 24 * 60 * 60 * 1000, // expired after 20 sec
        activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
        cookie: {
            httpOnly: false,
        },
        //the session will be extended by activeDuration milliseconds
    })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

// middleware to serve all the needed static files under the dist directory - loaded from the index.html file
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));

app.get("/api", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const corsConfig = {
    origin: true,
    credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

const port = process.env.PORT || "3000";
const auth = require("../auth");
const users = require("../users");
const league = require("../league");
const teams = require("../teams");
const matches = require("../matches");
const players = require("../players");
const ass_users = require("../association_users");
//#endregion

//#region cookie middleware
app.use(function(req, res, next) {
    if (req.session && req.session.user_id) {
        DButils.execQuery("SELECT userId FROM users")
            .then((users) => {
                if (users.find((x) => x.user_id === req.session.user_id)) {
                    req.user_id = req.session.user_id;
                }
                next();
            })
            .catch((error) => next());
    } else {
        next();
    }
});
//#endregion

// ----> For cheking that our server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use("/users", users);
app.use("/league", league);
app.use("/teams", teams);
app.use("/matches", matches);
app.use("/players", players);
app.use("/associationUsers", ass_users);
app.use(auth);



app.use(function(err, req, res, next) {
    res.status(err.status || 500).send(err.message);
});


function openServer() {
    server = app.listen(port, () => {
        console.log(`Server listen on port ${port}`);
    });
}

function closeServer() {
    console.log("server stop.")
    server.close()
}

exports.openServer = openServer;
exports.closeServer = closeServer;