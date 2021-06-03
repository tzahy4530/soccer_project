require("dotenv").config();
const sql = require("mssql");

var pool;
var poolConnect;

async function openDBPool(config){
  pool = new sql.ConnectionPool(config); 
  poolConnect = await pool.connect(); 

}

async function closeDBPool(){
  await pool.close()
}

exports.execQuery = async function (query) {
  try {
    var result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};

exports.openDBPool = openDBPool
exports.closeDBPool = closeDBPool