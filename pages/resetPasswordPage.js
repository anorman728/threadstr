// Create reset password page.

var gui = require(__dirname+'/gui');

/**
 * Create the html for the page.  Will determine if userId and
 * resetPasswordConfirm match to determine whether or not to use
 * createPageMatch or createPageNoMatch.
 *
 *@access   Public
 *@param    String      userId                  User ID.
 *@param    String      resetPasswordConfirm    Needs to match
 *                                              reset_password_confirm.
 *@param    Function    callback                Callback function.
 *@throws   Exception                           If userId is not a string.
 *@throws   Exception                           If resetPasswordConfirm is not a
 *                                              string.
 *@throws   Exception                           If callback is not a function.
 */

function createResetPasswordPage(userId,resetPasswordConfirm,callback){
    // Exceptions
        if (typeof userId!='string'){
            throw "createResetPasswordPage: userId must be string.";
        }
        if (typeof resetPasswordConfirm!='string'){
            throw "createResetPasswordPage: resetPasswordConfirm must be string.";
        }
        if (typeof callback!='function'){
            throw "createResetPasswordPage: callback must be function.";
        }
    var db = require(__dirname+'/../connection/userManager');
    db.getUserRowFromId(userId,function(data){
        if (data==false){
            throw `Error: No row found for ${userId}.`;
        } else {
            var emailAddress = data['email_address'];
            db.resetPasswordConfirmCheck(userId,resetPasswordConfirm,function(result){
                switch (result) {
                    case 'success':
                        createPageMatch(userId,emailAddress,resetPasswordConfirm,function(data){
                            callback(data);
                        });
                        break;
                    case 'expired':
                        callback(createPageExpired(emailAddress));
                        break;
                    case 'no match':
                        callback(createPageNoMatch(emailAddress));
                        break;
                }
            });
        }
    });
}


/**
 * Create form for resetting password.
 * The callback function has one parameter, being the form html.
 *
 *@access   Private
 *@param    String|Number   userId                  User id.
 *@param    String          emailAddress            Email address of user.
 *@param    String          resetPasswordConfirm    Confirmation code.
 *@param    Function        callback                Callback function.
 *@throws   Exception                               If userId is neither string
 *                                                  nor number.
 *@throws   Exception                               If emailAddress is not a
 *                                                  string.
 *@throws   Exception                               If resetPasswordConfirm is
 *                                                  not a string.
 *@throws   Exception                               If callback is not a
 *                                                  function.
 */

function createPageMatch(userId,emailAddress,resetPasswordConfirm,callback){
    var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
    // Exceptions.
        if (typeof userId!='string' && typeof userId!='number'){
            throw `${func}: userId must be string or number.`;
        }
        if (typeof emailAddress!='string'){
            throw `${func}: emailAddress must be string.`;
        }
        if (typeof resetPasswordConfirm!='string'){
            throw `${func}: resetPasswordConfirm must be string or number.`;
        }
        if (typeof callback!='function'){
            throw `${func}: callback must be function.`;
        }
    // Build form.
        var textTitle = gui.textItem(`Reset password for ${emailAddress}:`,'textTitle');
        var newPassword = gui.textInput("New password:","newPassword",true);
        var confirmPassword = gui.textInput("Confirm password:","confirmPassword",true);
        var userId = gui.invisibleInput("userId",userId);
        var resetPasswordConfirm = gui.invisibleInput("resetPasswordConfirm",resetPasswordConfirm);
        var submitButton = gui.buttonInput("Reset Password","resetPasswordSubmit");
        var formItems = [
            textTitle               ,
            newPassword             ,
            confirmPassword         ,
            userId                  ,
            resetPasswordConfirm    ,
            submitButton
        ];
        var form = gui.createForm('resetPasswordForm',formItems);
    callback(form);
}

/**
 * Create form if the resetPasswordConfirm time is expired.
 *
 *@access   Private
 *@param    String      emailAddress    User's email address.
 *@return   String
 *@throws   Exception                   If emailAddress is not a string.
 */

function createPageExpired(emailAddress){
    // Exceptions.
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof emailAddress!='string'){
            throw `${func}: emailAddress must be a string.`;
        }
    // Build form.
        var message = gui.textItem(`The previous request to reset the password for ${emailAddress} has expired.  If you still need to reset the password, please request another email from the Log in menu.`,'message');
        var formItems = [message];
        var form = gui.createForm('resetPasswordForm',formItems);
    return form;
}

/**
 * Create form if the resetPasswordConfirm code does not match.
 *
 *@access   Private
 *@param    String      emailAddress        User's email address.
 *@return   String
 *@throws   Exception                       If emailAddress is not a string.
 */

function createPageNoMatch(emailAddress){
    // Exceptions.
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof emailAddress!='string'){
            throw `${func}: emailAddress must be string.`;
        }
    // Build form.
        var message = gui.textItem(`The link used to reach this page does not match the one needed to reset the password for ${emailAddress}.`,'message');
        var formItems = [message];
        var form = gui.createForm('resetPasswordForm',formItems);
    return form;
}

module.exports = {
    createResetPasswordPage     : createResetPasswordPage
};
