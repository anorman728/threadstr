/**
 * Page to verify/validate user so that they can start logging in.
 */

var db = require(__dirname+"/../connection/userManager");

/**
 * Create html for output.
 *
 *@param    String      userId      User id to validate.
 *@param    String      code        Code to match to userId.
 *@param    Function    callback    Callback function, with one parameter--
 *                                  What's sent back to the browser.
 *@throws   Exception               If either userId or code is not a string.
 *@throws   Exception               If callback is not a function.
 */
function verifyCode(userId,code,callback){
    // Exceptions
        if (typeof userId!='string' || typeof code!='string'){
            throw "verifyCode: userId and code must be strings.";
        }
        if (typeof callback!='function'){
            throw "verifyCode: callback must be function.";
        }
    db.verifyUser(userId,code,function(result){
        var resultStr;
        if (result===true){
            resultStr = "Your account has been verified.  You can now log in.";
        } else if (result=="userId and code do not match."){
            resultStr = "Unable to verify.  User ID and verfification code do not match.  Doublecheck that you clicked the link in the verification email.";
        } else {
            resultStr = "Unable to verify: Internal server error.  Please try again.";
        }
        resultStr = `<div class="formContainer"><p>${resultStr}</p></div>`;
        callback(resultStr);
    });
}

module.exports = {
    verifyCode  : verifyCode
};
