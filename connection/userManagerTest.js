/**
 * Unit tests for userManager.js.
 * Variable naming fail: The difference between the function names and the
 * variable names are only different in the order of the words.
 */

var userID;
var testUsername = "testUser01";
var testEmailAddress = "test01@fakemail.com";
var testPassword = "password01";
var testTimezone = 'UTC';

var testUsernameChange = "testUser02";
var testEmailAddressChange = "test02@fakemail.com";
var testPasswordChange = "password02";
var testTimezoneChange = 'CST';

var getPW = require(__dirname+'/getPasswords');

getPW.getDatabasePassword(function(password){
    // Set password for database.
        dbPassword = password;
    // Create connection
        var connection = require(__dirname+'/connection');
        con = connection.con;
        console.log('');

    var databaseFunctions = require(__dirname+'/userManager');

    main(databaseFunctions);

});

function main(databaseFunctions){
    clearData(databaseFunctions);
}

function displayTable(callback){
    if (!(callback instanceof Function)){
        callback = function(){};
    }
    var queryDum = `SELECT * FROM users WHERE default_display_name='${testUsername}' OR default_display_name='${testUsernameChange}'`;
    con.query(queryDum,function(err,rows){
        if (err) {console.log(err);}
        console.log(rows);
        callback();
    });
}

function clearData(databaseFunctions){
    var queryDum = "DELETE FROM users WHERE default_display_name=\"testUser01\" OR default_display_name=\"testUser02\"";
    con.query(queryDum,function(){
        testAddUser(databaseFunctions);
    });
}

function testAddUser(databaseFunctions){
    var attributesJSON = {
        'default_display_name':testUsername,
        'email_address':testEmailAddress,
        'timezone':testTimezone,
    };
    databaseFunctions.addUser(attributesJSON,testPassword,function(returnID){
        console.log("User information:");
        displayTable(function(){
            userID = returnID;
            testValidateUserData(attributesJSON,databaseFunctions);
        });
    });
}

function testValidateUserData(attributesJSON,databaseFunctions){
    databaseFunctions.validateUserData(attributesJSON['email_address'],attributesJSON['default_display_name'],function(returnArr){
        console.log("\nShould return what properties already exist.");
        console.log(returnArr);
        testChangeDefaultName(databaseFunctions);
    });
}

//function testChangeDefaultName(databaseFunctions){
//    databaseFunctions.changeDefaultName(userID,testUsernameChange,function(){
//        console.log("\ndefault_display_name should be changed.");
//        displayTable();
//        testChangeEmailAddress(databaseFunctions);
//    });
//}

function testChangeEmailAddress(databaseFunctions){
    databaseFunctions.changeEmailAddress(userID,testEmailAddressChange,function(){
        console.log("\nemail_address should be changed.");
        displayTable();
        testChangeTimezone(databaseFunctions);
    });
}

function testChangeTimezone(databaseFunctions){
    databaseFunctions.changeTimezone(userID,testTimezoneChange,function(){
        console.log("\ntime_zone should be changed.");
        displayTable();
        testChangePassword(databaseFunctions);
    });
}

function testChangePassword(databaseFunctions){
    databaseFunctions.changePassword(userID,testPasswordChange,function(){
        console.log("\npassword_hash should be changed (but not salt).");
        displayTable();
        testChangeEmailVerification(databaseFunctions);
    });
}

function testChangeEmailVerification(databaseFunctions){
    databaseFunctions.changeEmailVerification(userID,1,function(){
        console.log("\nemail_verified should be changed to 1.");
        displayTable();
        endCon();
    });
}

function endCon(){
    con.end();
}

// Todo: End connection.
