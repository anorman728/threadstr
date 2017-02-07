/*
 * Connect to database.
 */

var mysql   = require('mysql');
connection  = mysql.createConnection({
    host    : 'localhost'       ,
    user    : 'root'            ,
    password: global.dbPassword ,
    database: "threadr"         ,
});

/** Query the database every five seconds to keep the connection from closing. */
setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

module.exports = {
    con : connection
}

