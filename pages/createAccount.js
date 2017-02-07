// Create Account Page

var gui = require(__dirname+'/gui');

function createAccountPage(){
    var formTitle              = gui.textItem("<h3>Enter information below to create new account</h3>",'createAccountTitle');
    var emailAddress           = gui.textInput("Email Address:","emailAddress")             ;
    var defaultDisplayName     = gui.textInput("Default Display Name:","defaultDisplayName");
    var password               = gui.textInput("Password:","password",true)                 ;
    var confirmPassword        = gui.textInput("Confirm Password:","confirmPassword",true)  ;
    var timezone               = gui.timezoneInput("Timezone:","timezone")                  ;
    var submit                 = gui.buttonInput("Create Account","createAccountSubmit")   ;
    var formItems = [
         formTitle          ,
         emailAddress       ,   
         defaultDisplayName ,   
         password           ,   
         confirmPassword    ,   
         timezone           ,   
         submit
    ];
    return gui.createForm("createAccount",formItems);
}

module.exports = {
    createAccountPage   : createAccountPage
};
