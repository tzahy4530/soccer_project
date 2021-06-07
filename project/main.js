//#region global imports
const DButils = require("./routes/utils/DButils")
const server_utils = require("./routes/utils/server_utils")

const DBconfig = {
  user: process.env.tedious_userName,
  password: process.env.tedious_password,
  server: process.env.tedious_server,
  database: process.env.tedious_database,
  options: {
    encrypt: true,
    enableArithAbort: true
  }
};
DButils.openDBPool(DBconfig)
server_utils.openServer()

// change
// process.on("SIGINT", function () {
//   if (server) {
//     server.close(() => console.log("server closed"));
//   }
// });
//