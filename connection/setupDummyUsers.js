/**
 * Run this script to create dummy accounts for testing.
 * This won't be usable for logging in via browser at the moment (10/21/2016)
 * because the client-side hash hasn't been created yet.
 */

var dummyUsername01 = "dummyUser01";
var dummyEmailAddress01 = "dummy01@fakemail.com";
var dummyPassword01 = "alongcameaspider47";

var dummyUsername02 = "dummyUser02";
var dummyEmailAddress02 = "dummy02@fakemail.com";
var dummyPassword02 = "alongcamepolly48";

var getPW = require(__dirname+'/getPasswords');

getPW.getDatabasePassword(function(password){
    // Set pasword for database.
        dbPassword = password;
    // Create connection.
        var connection = require('./connection');
        con = connection.con;

    var userManager = require('./userManager');
    main(userManager);
});

function main(userManager){
    addDummy01(userManager);
}

function addDummy01(userManager){
    var attributesJSON = {
        'default_display_name' :dummyUsername01        ,
        'email_address'        :dummyEmailAddress01
    };
    userManager.addUser(attributesJSON,dummyPassword01,function(){
        addDummy02(userManager);
    });
}

function addDummy02(userManager){
    var attributesJSON = {
        'default_display_name'  : dummyUsername02,
        'email_address'         : dummyEmailAddress02
    };
    userManager.addUser(attributesJSON,dummyPassword02,function(){
        con.end();
    });
}
