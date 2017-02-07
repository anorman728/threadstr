var fs = require('fs');

/*
 * Check if file exists.  Return contents if it does, return false if it does not.
 *
 *@param    String          filePath    The path of the file to read.
 *@returns  String|Boolean
 */

function readFile(filePath){
    try {
        var content = fs.readFileSync(filePath,'utf-8');
        content = content.trim();
        return content;
    } catch (err){
        return false;
    }
}


/*
 * Read a particular setting from the config file.
 * In the future, may want to refactor this to read the file once and store all
 * settings into a JSON object.
 *
 *@param    String      configName      The name of the configuration to read. 
 *                                      Will return the value of said setting. 
 *@param    String      configFile      Optional.  The path of the configuration  
 *                                      file name.  Will default to the standard  
 *                                      config file in the root directory.        
 *@returns  String
 */

function readConfigSetting(configName,configFile){
    if (arguments.length == 1){
        configFile = '../config';
    }
    var configFilePath = __dirname+"/"+configFile
    var configContents = readFile(configFilePath);
    var configJSONStr = configContents.replace(/#.*(\n|$)/g,'\n');
        configJSONStr = configJSONStr.replace(/^\n/,'');
        configJSONStr = configJSONStr.replace(/\n$/,'');
        configJSONStr = '{'+configJSONStr.replace(/\n/g,',')+'}';
    var configJSON = JSON.parse(configJSONStr);
    return configJSON[configName];
}

module.exports = {
    readFile : readFile,
    readConfigSetting : readConfigSetting
};
