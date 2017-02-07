// Options Page.

var gui = require(__dirname+'/gui');
var db = require(__dirname+'/../connection/userManager');

/**
 * Public function to choose between "not logged in" and "logged in" variants of
 * this page, depending on whether or not userId is a nonempty string.
 * Callback function has one parameter, being the html of the page.
 *
 *@access   Public
 *@param    String|Undefined    userId      User id, as set by client-session.
 *@param    Function            callback    Callback function.
 *@return   String
 */

function userOptionsPage(userId,callback){
    if ((typeof userId!='string' && typeof userId!='number') || userId==''){
        callback(notLoggedIn());
    } else {
        db.getUserRowFromId(userId,function(data){
            if (data===false){
                callback(notFound());
            } else {
                callback(loggedIn(data));
            }
        });
    }
}

/**
 * Return html if no user is logged in.
 *
 *@access   Private
 *@return   String
 */

function notLoggedIn(){
    var textTitle = gui.textItem('<h4>Not logged in</h3>','errorTitle');
    var textMessage = gui.textItem("<p>Please log in before accessing the Options page.</p>",'textTitle');
    var formItems = [textTitle,textMessage];
    var form = gui.createForm('pleaseLogIn',formItems);
    return form;
}

/**
 * Create html if user is not found.
 *
 *@access   Private
 *@return   String
 */

function notFound(){
    var textTitle = gui.textItem("<h4>Error</h3>",'errorTitle');
    var textMessage = gui.textItem("<p>There is a problem with your session.  Please log out and log in again.</p>",'textTitle');
    var formItems = [textTitle,textMessage];
    var form = gui.createForm('errorSession',formItems);
    return form;
}

/**
 * Create html if user is logged in.
 *
 *@access   Private
 *@param    Object      data            JSON object with user data.
 *@return   String
 *@throws   Exception                   If data is not an object.
 */

function loggedIn(data){
    // Exceptions
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof data!='object'){
            throw `${func}: data must be object.`;
        }
    var optionsTitle = gui.textItem("<h2>User options</h2>",'userOptionsTitle');
    var formItems = [optionsTitle];

    // Reset password.
        formItems = formItems.concat(resetPasswordForm());
    // Change email address.
        formItems = formItems.concat(changeEmailAddressForm(data['email_address']));
    // Delete account.
        formItems = formItems.concat(deleteAccountForm());
    // Change default display name.
        formItems = formItems.concat(changeDefaultDisplayNameForm(data['default_display_name']));
    // Change timezone,
        formItems = formItems.concat(changeTimezoneForm(data['timezone']));

    // Create form
        var returnHtml = gui.createForm('optionsForm',formItems);

    return returnHtml;
}

/**
 * Get array for portion of form for resetting password.
 *
 *@access   Private
 *@return   Object
 */

function resetPasswordForm(){
    var resetPasswordTitle         = gui.textItem('<h4>Reset Password</h3>','resetPasswordTitle');
    var newPassword                = gui.textInput('New password:','newPassword',true);
    var confirmPassword            = gui.textInput('Confirm password:','confirmPassword',true);
    var resetPasswordSubmitButton  = gui.buttonInput("Reset Password","resetPasswordSubmit");

    var returnArr = [resetPasswordTitle,newPassword,confirmPassword,resetPasswordSubmitButton];
    
    return returnArr;
}

/**
 * Get array for resetting email address.
 *
 *@access   Private
 *@return   Object
 */

function changeEmailAddressForm(emailAddress){
    var changeEmailTitle        = gui.textItem('<h4>Change Email Address</h3>','changeEmailTitle');
    var changeEmailMsg          = gui.textItem('<p>Requires email confirmation</p>','changeEmailMsg');
    var currentEmailAddress     = gui.textItem(`<p>Current email address is <em>${emailAddress}</em>.`,'currentEmailText');
    var newEmailAddress         = gui.textInput('New email address:','newEmailAddress',false);
    var confirmEmailAddress     = gui.textInput('Confirm email address:','confirmEmailAddress',false);
    var changeEmailSubmitButton = gui.buttonInput('Request email','changeEmailSubmitButton');

    var returnArr = [changeEmailTitle,changeEmailMsg,currentEmailAddress,newEmailAddress,confirmEmailAddress,changeEmailSubmitButton];
    return returnArr;
}

/**
 * Get array for deleting account.
 *
 *@access   Private
 *@return   Object
 */

function deleteAccountForm(){
    var deleteAccountTitle = gui.textItem('<h4>Delete account</h3>','deleteAccountTitle');
    var deleteAccountMsg = gui.textItem('<p>Requires email confirmation</p>','deleteAccountMsg');
    var deleteAccountSubmitButton = gui.buttonInput('Request email','deleteAccountSubmitButton');

    var returnArr = [deleteAccountTitle,deleteAccountMsg,deleteAccountSubmitButton];
    return returnArr;
}

/**
 * Change default display name gui.
 *
 *@access   Private
 *@param    String          defaultDisplayName      Current Default Display
 *                                                  Name.
 *@return   Object
 *@throws   Exception                               If defaultDisplayName is not
 *                                                  a string.
 */

function changeDefaultDisplayNameForm(defaultDisplayName){
    // Exceptions
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof defaultDisplayName!='string'){
            throw `${func}: defaultDispayName must be string.`;
        }
    var changeDefaultDisplayNameTitle          = gui.textItem('<h4>Change Default Display Name</h3>','changeDefaultDisplayNameTitle');
    var currentDefaultDisplayName              = gui.textItem(`<p>Current Default Display Name is <em>${defaultDisplayName}</em>.`,'currentDefaultDisplayName');
    var newDefaultDisplayName                  = gui.textInput('New Default Display Name','newDefaultDisplayName',false);
    var changeDefaultDisplayNameSubmitButton   = gui.buttonInput('Change Display Name','changeDefaultDisplayNameSubmitButton');
    
    var returnArr = [changeDefaultDisplayNameTitle,currentDefaultDisplayName,newDefaultDisplayName,changeDefaultDisplayNameSubmitButton];
    return returnArr;
}

/**
 * Change timezone gui.
 *
 *@access   Private
 *@param    String      timezone        Current timezone.
 *@return   Object
 *@throws   Exception                   If timezone is not a string.
 */

function changeTimezoneForm(timezone){
    // Exceptions
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof timezone!='string'){
            throw `${func}: timezone must be string.`;
        }
    var changeTimezoneTitle            = gui.textItem('<h4>Change timezone</h3>','changeTimezoneTItle');
    var timezoneDroplist               = gui.timezoneInput('Change timezone:','changeTimezone',timezone);
    var changeTimezoneSubmitButton     = gui.buttonInput('Change Timezone','changeTimezoneButton');

    var returnArr = [changeTimezoneTitle,timezoneDroplist,changeTimezoneSubmitButton];
    return returnArr;
}

module.exports = {
    userOptionsPage : userOptionsPage
}
