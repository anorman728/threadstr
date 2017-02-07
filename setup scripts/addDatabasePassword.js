var prompt = require('prompt');
var configPath = __dirname+'/../config.json';
var config = require(configPath);
var fs = require('fs');

var initialMessage = `
    
    You need to determine if you want the server to prompt
      the user for the database password when starting
      server.js.

    If the password is stored on the server, then it will be
      visible to anybody that has access the server (including
      crackers).  This is unavoidable in any system that does
      not prompt the user for the password.

    Prompting the user to input the password is
      theoretically more secure, but it does not account for
      the human factor-- Putting the password on post-it notes
      and emailing them to each other can actually make the
      server less secure.

    If you choose to prompt the user, make sure that the
      database password is not the same as the server
      password.
    
  You can change this later by changing the config.json
    file.`;

var choiceSchema = {
    properties : {
        userinput : {
            description: `Do you want to prompt the user to enter the database 
password when starting the program?`,
            type    : 'string',
            pattern : /^(y|n||)$/i,
            message : 'Please enter \'y\' or \'n\'.',
            required: true,
            default : 'y'
        }
    }
}

function requestChoice(){
    console.log(initialMessage);
    prompt.start();
    prompt.get(choiceSchema, function(err,result){
        if (err) {console.log(err);}
        actOnChoice(result);
    });
}

var pwSchema = {
    properties : {
        password : {
            description: `Enter the password that you will use for the database.  
            (You will be asked to enter this again when MySQL is installed.)`,
            required: true
        }
    }
}

function actOnChoice(choice){
    if (choice.userinput=='n'){
        prompt.start();
        prompt.get(pwSchema, function(err,result){
            if (err) {console.log(err);}
            writeToFile(result.password);
        });
    } else {
        writeToFile('');
    }
}

function writeToFile(databasePassword){
    config['database password'] = databasePassword;
    fs.writeFile(configPath,JSON.stringify(config),function(err){
        if (err) {console.log(err);}
    });
}

requestChoice();
