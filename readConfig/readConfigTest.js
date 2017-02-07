/*
 * Unit test for readConfig.
 */

var readConfig = require('./readConfig');

console.log("\nContents of testFile01:");
console.log(readConfig.readFile('testFile01'));

console.log("\nreadFile on a non-existent file, so should return \"false\":");
console.log(readConfig.readFile('testFile02'));

console.log("\nShould return \"test setting value\":");
console.log(readConfig.readConfigSetting("test setting name","testFile01"));

console.log("\nShould return \"test setting value 2\":");
console.log(readConfig.readConfigSetting("test setting name 2","testFile01"));

console.log("\nLooking for a nonexistent setting:");
console.log(readConfig.readConfigSetting("setting does not exist","testFile01"));

console.log("\nShould return whatever database password is set to be in the config file:");
console.log(readConfig.readConfigSetting("database password"));

