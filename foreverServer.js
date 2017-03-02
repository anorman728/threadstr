var forever = require('forever-monitor');

var serverName = 'server.js';
var maxRestarts = 10;

var child = new (forever.Monitor)(serverName,{
    max: maxRestarts,
    silent: false,
    args: []
});

child.on('exit',function(){
    console.log(`${serverName} has exited after ${maxRestarts} restarts.`);
});

child.start();
