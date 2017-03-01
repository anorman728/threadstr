/*
 * Connect to database.
 */

var mysql   = require('mysql');
connection  = mysql.createConnection({
    host    : 'localhost'       ,
    user    : 'root'            ,
    password: global.dbPassword ,
    database: "threadstr"       ,
});

/** Query the database every ten minutes to keep the connection from closing. */
setInterval(function () {
    connection.query('SELECT 1');
}, 600000);

/**
 * Version of query that converts all parameterized values to html values, to
 * prevent XSS attacks.  Can't be too careful.
 * Behaves (or should behave) exactly like the normal query command.
 * Callback function has three parameters-- err, rows, fields.
 *
 *@access   Public
 *@param    String      queryStr
 *@param    Object      valuesArr
 *@param    Function    callback
 *@throws   Exception               If queryStr is not a string.
 *@throws   Exception               If valuesArr is not an array.
 *@throws   Exception               If callback is not a function.
 *@throws   Exception               If any values in valuesArr are neither
 *                                  strings nor numbers.
 */

function queryXSS(queryStr,valuesArr,callback){
    /* Exceptions (more later) */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof queryStr != 'string'){
            throw `${func}: queryStr must be string.`
        }
        if (typeof valuesArr != 'object' || !Array.isArray(valuesArr)){
            throw `${func}: valuesArr must be an array.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be function.`;
        }
    var htmlEntities = require('html-entities').AllHtmlEntities;
    var safeValuesArr = [];
    var i,len;
    var typeofDum;
    for (i=0,len=valuesArr.length;i<len;i++){
        typeofDum = (typeof valuesArr[i]);
        switch (typeofDum){
            case 'string':
                safeValuesArr.push(htmlEntities.encode(valuesArr[i]));
                break;
            case 'number':
                safeValuesArr.push(valuesArr[i]);
                break;
            default:
                throw `${func}: Invalid type in valuesArr: ${typeofDum}.`;
        }
    }
    connection.query(queryStr,safeValuesArr,function(err,rows,fields){
        callback(err,rows,fields);
    });
}

module.exports = {
    con         : connection,
    queryXSS    : queryXSS
}

