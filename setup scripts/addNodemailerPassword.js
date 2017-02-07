var prompt = require('prompt');
var configPath= __dirname+'/../config.json';
var config = require(configPath);
var fs = require('fs');

var initialMessage = `
    
    You will now need to enter basic information for an email account to
      communicate with users.

    There is currently no option to prompt the user for the password on startup
      like there is for the database, but that's a planned update.

    This can be edited in the config.json file at any time.
`;

var servicePrompt = {
    properties: {
        userinput : {
            description: `Please enter the service name.`,
            required: true
        }
    }
};

var userPrompt = {
    properties: {
        userinput : {
            description: `Please enter the full email address.`,
            required : true
        }
    }
};

var passwordPrompt = {
    properties: {
        userinput : {
            description : `Please enter email address's password.`,
            required : true
        }
    }
};

var displayNamePrompt = {
    properties: {
        userinput : {
            description: `Please enter full name to send from.`,
            required: true
        }
    }
};

startGettingData();

function startGettingData(){
    var nodemailerObj = {
        "service"   : "",
        "auth"      : {
            "user": "",
            "pass": ""
        }
    };
    console.log(initialMessage);
    requestInfo01(nodemailerObj);
}

function requestInfo01(nodemailerObj){
    prompt.start();
    prompt.get(servicePrompt,function(err,result){
        if (err) console.log(err);
        nodemailerObj["service"] = result.userinput;
        requestInfo02(nodemailerObj);
    });
}

function requestInfo02(nodemailerObj){
    prompt.start();
    prompt.get(userPrompt,function(err,result){
        if (err) console.log(err);
        nodemailerObj["auth"]["user"] = result.userinput;
        requestInfo03(nodemailerObj);
    });
}

function requestInfo03(nodemailerObj){
    prompt.start();
    prompt.get(passwordPrompt,function(err,result){
        if (err) console.log(err);
        nodemailerObj["auth"]["pass"] = result.userinput;
        requestInfoSendFrom(nodemailerObj);
    });
}

function requestInfoSendFrom(nodemailerObj){
    prompt.start();
    prompt.get(displayNamePrompt,function(err,result){
        if (err) console.log(err);
        var sendFrom = result.userinput;
        writeToFile(nodemailerObj,sendFrom);
    });
}

function writeToFile(nodemailerObj,sendFrom){
    config.nodemailer = nodemailerObj;
    config['send from'] = sendFrom;
    fs.writeFile(configPath,JSON.stringify(config),function(err){
        if (err) console.log(err);
    });
}
