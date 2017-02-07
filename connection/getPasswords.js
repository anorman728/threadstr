/**
 *Get the password, either by prompting the user or by reading the config file.
 */

var prompt = require('prompt');
var config = require(__dirname+'/../config.json');

function getDatabasePassword(callback){
    var storedPassword = config['database password'];
    if (storedPassword=='undefined' || storedPassword==''){
        var schema = {
            properties : {
                password : {
                    description: "Please enter database password:",
                    type: 'string',
                    required: true,
                    hidden: true
                }
            }
        }
        prompt.start();
        prompt.get(schema,function(err,result){
            if (err) {console.log(err);}
            callback(result.password);
            return result.password;
        });
    } else {
        callback(storedPassword);
        return storedPassword;
    }
}

module.exports = {
    getDatabasePassword: getDatabasePassword
}
