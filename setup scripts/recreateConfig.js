var fs = require('fs');
var filePath = __dirname+'/../config.json'; 
var blankJSON = {};

//fs.unlinkSync(filePath);
//
//
//fs.writeFile(filePath,JSON.stringify(blankJSON),function(err){
//    if (err) {console.log(err);}
//});

function createConfig(){
    fs.writeFile(filePath,JSON.stringify(blankJSON),function(err){
        if (err) {console.log(err);}
    });
}

fs.access(filePath,fs.F_OK, function(err){
    if (!err) {
        fs.unlink(filePath,function(err){
            createConfig();
        });
    } else {
        createConfig();
    }
});
