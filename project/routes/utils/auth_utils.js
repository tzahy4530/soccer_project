const DButils = require("./DButils");
const bcrypt = require("bcryptjs");

async function validUsername(username){
  const users = await DButils.execQuery(
    "SELECT username FROM dbo.users"
  );
  if (users.find((x) => x.username === username)){
    return false
  }
  return true
}

async function addNewUser(username,firstname,lastname,password,email,link){
  const user_id = await DButils.execQuery(
    `INSERT INTO dbo.users (username, firstname, lastname, password, email, link)
     VALUES ('${username}', '${firstname}',
      '${lastname}', '${password}', '${email}', '${link}');
      SELECT SCOPE_IDENTITY() as id`
  );
  await DButils.execQuery(
    `INSERT INTO dbo.Roles (userId, roleId)
     VALUES ('${user_id[0].id}', '${process.env.fanRole}')`
  )
}

async function validLoginDetails(username, password){
  const user = (
    await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    )
  )[0];

  // check that username exists & the password is correct
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return false
  }
  return true
}

async function getUserIdByUsername(username){
  const user = (
    await DButils.execQuery(
      `SELECT * FROM dbo.users WHERE username = '${username}'`
    )
  )[0];
  return user.userId
}

function hashPassword(password){
  return bcrypt.hashSync(
    password,
    parseInt(process.env.bcrypt_saltRounds)
  );
}
  exports.hashPassword = hashPassword;
  exports.getUserIdByUsername = getUserIdByUsername;
  exports.validLoginDetails = validLoginDetails;
  exports.addNewUser = addNewUser;
  exports.validUsername = validUsername;