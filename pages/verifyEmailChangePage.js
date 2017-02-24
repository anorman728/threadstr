/* 
   Functions for changeEmailAddressVerify page. 
   Will both perform actions requested and create HTML to display.
 */

var db = require(__dirname+'/../connection/userManager');

/**
 * Move unverified_email_address to email_address iff verifyCode matches
 * change_email_verify_code and current unix time is before change_email_limit.
 * Callback function contains one parameter: HTML to display.
 *
 *@access   Public
 *@param    Number      userID
 *@param    String      verifyCode
 *@param    Function    callback
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If verifyCode is not a string..
 *@throws   Exception               If callback is not a function.
 */

function confirmAndGetPage(userID,verifyCode,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof userID != 'number' || !Number.isInteger(userID)){
            throw `${func}: userID must be integer.`;
        }
        if (typeof verifyCode != 'string'){
            throw `${func}: verifyCode must be a string.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be a function.`;
        }
    db.checkChangeEmailVerifyCode(userID,verifyCode,function(result){
        switch (result){
            case 'match':
                db.verifyNewEmail(userID,function(){
                    callback(matchHtml());
                });
                break;
            case 'nomatch':
                callback(noMatchHtml());
                break;
            case 'expired':
                callback(expiredHtml());
                break;
            default:
                throw `Unknown callback result: ${result}.`;
        }
    });
}

/**
 * Build HTML if a match is found.
 *
 *@access   Private
 *@return   String
 */

function matchHtml(){
    var returnStr = `<p class="formContainer">Email address has successfully been changed.</p>`;
    return returnStr;
}

/**
 * Build HTML if no match is found.
 *
 *@access   Private
 *@return   String
 */

function noMatchHtml(){
    var returnStr = `<p class="formContainer">Unable to verify.  Double-check that you clicked the link from the verification email.</p>`;
    // Small amount of code duplication here-- This string also appears verbatim in server.js.  May want to fix that in the future.
    return returnStr;
}

module.exports = {
    confirmAndGetPage   : confirmAndGetPage
}

/**
 * Build HTML if verification email has expired.
 *
 *@access   Private
 *@return   String
 */

function expiredHtml(){
    var returnStr = `<p class="formContainer">Email change request has expired.  If you still want to change your email address, you will need to make another request through the options page.</p>`;
    return returnStr;
}
