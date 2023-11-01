const mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stoked",
});
 connection.connect(function (err) {
  if (err) {
    console.log("error occurred while connecting");
  } else {
    console.log("connection created with Mysql successfully");
  }
});


module.exports=connection;
