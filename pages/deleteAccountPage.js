/* Build deleteAccountsPage. */

/**
 * Get html for deleting an account if the verifyCode matches, error if it
 * doesn't.
 * Callback function has one parameter, being the html to display.
 *
 *@access   Public
 *@param    Number      userID
 *@param    String      verifyCode
 *@param    Function    callback
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If verifyCode is not a string.
 *@throws   Exception               If callback is not a function.
 */

function confirmAndGetPage(userID,verifyCode,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof userID != 'number' || !Number.isInteger(userID)){
            throw `${func}: userID must be an integer.`;
        }
        if (typeof verifyCode != 'string'){
            throw `${func}: verifyCode must be a string.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be a function.`;
        }
    var db = require(__dirname+'/../connection/userManager');
    db.checkDeleteAccountVerifyCode(userID,verifyCode,function(result){
        if (result=='nomatch'){
            callback(noMatchHtml());
        } else if (result=='expired'){
            callback(expiredHtml());
        } else if (result=='match'){
            callback(deleteConfirmHtml(userID,verifyCode));
        } else {
            console.log(`Unknown result value: ${result}.`);
        }
    });
}

/**
 * Build html if match does not exist.
 *
 *@access   Private
 *@return   String
 */

function noMatchHtml(){
    var common = require(__dirname+'/common');
    var returnVal = common.messagesObj['unableToVerify'];
    return returnVal;
}

/**
 * Build HTML if verification email has expired.
 *
 *@access   Private
 *@return   String
 */

function expiredHtml(){
    var common = require(__dirname+'/common');
    var returnStr = common.messagesObj['expired'];
    return returnStr;
}

/**
 * Build HTML to confirm deleting account.
 *
 *@access   Private
 *@param    Number      userID          Put into a hidden field.
 *@param    String      verifyCode      Put into a hidden field.
 *@return   String
 *@throws   Exception                   If userID is not an integer.
 */

function deleteConfirmHtml(userID,verifyCode){
    
    var gui             = require(__dirname+'/gui');
    var formTitle       = gui.textItem("<h3>Delete account confirmation</h3>",'deleteAccountTitle');
    var formDescription = gui.textItem(`
        <p>Please enter your password to confirm that you want to delete your account.</p>
        <p>This will wipe your account from the database, as if no account with this email address ever existed.  This cannot be undone.</p>
        <p>The actual posts will not be deleted, but the default display name will show the deleted user number.</p>
    `,'deleteAccountDescription');
    var passwordInput   = gui.textInput("Enter password:",'password',true);
    var userIDInput     = gui.invisibleInput('userID',userID.toString());
    var verifyCodeInput = gui.invisibleInput('verifyCode',verifyCode);
    var submit          = gui.buttonInput('Confirm Delete Account','deleteAccountSubmit');

    var formItems = [
        formTitle       ,
        formDescription ,
        passwordInput   ,
        userIDInput     ,
        verifyCodeInput ,
        submit
    ];
    return gui.createForm('deleteConfirm',formItems);
}

module.exports = {
    confirmAndGetPage   : confirmAndGetPage
}
