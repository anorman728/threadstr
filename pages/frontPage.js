// Front page.

var gui = require(__dirname+'/gui');

function mainPage(){
    var returnVal = gui.buttonHtml('createNewThread','Create new thread');
    return returnVal;
}

module.exports = {
    mainPage    : mainPage
};
