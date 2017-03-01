$(document).ready(function(){
    trigger();

    $("#passwordValue").change(function(){  
        trigger();
    });
    $("#confirmPasswordValue").change(function(){
        trigger();
    });
    $('#defaultDisplayNameValue').change(function(){
        trigger();
    });
    $('#emailAddressValue').change(function(){
        trigger();
    });

    $('#createAccountSubmitLabel').on('click',function(){
        $('#createAccountSubmitMessage').html('');
        var errorMsg = "<p style=\"color:red;\">There are problems noted above or blank fields.  They will need to be corrected before submitting.</p>";
        var tf = ($('#emailAddressValue').val()!='');
        if (!createAccountPasswordsMatch()) tf=false;
        if (!passwordLength($('#passwordValue').val())) tf=false;
        if (!checkDefaultDisplayName($('#defaultDisplayNameValue').val())) tf=false;
        if (!checkEmailAddress($('#emailAddressValue').val())) tf=false;
        if (tf){
            validateUser($('#emailAddressValue').val(),$('#defaultDisplayNameValue').val(),function(data){
                var i,len;
                for (i=0,len=data.length;i<len;i++){
                    if ((data[i])=='email_address'){
                        tf=false;
                    }
                    if ((data[i])=='default_display_name'){
                        tf=false;
                    }
                }
                if (tf){
                    $('#createAccountSubmitMessage').html('<p>Loading...</p>');
                    var password = $('#passwordValue').val();
                    var data = {
                        'default_display_name'  : $('#defaultDisplayNameValue').val(),
                        'email_address'         : $('#emailAddressValue').val(),
                        'timezone'              : $('#timezoneValue').val()
                    };
                    submitData(data,password,function(tf){
                        if (tf){
                            $('#createAccountSubmitMessage').html(createAccountMessage);
                        } else {
                            $('#createAccountSubmitMessage').html('<p>Error: Unable to contact server.</p>');
                        }
                    });
                }
            });
        } else {
            $('#createAccountSubmitMessage').html(errorMsg);
        }
    });

});

var createAccountMessage = '<p>An email has been sent to your address.  Please verify to activate your account.</p> <p><a href="#" onclick="resendEmail();return false;">Click here</a> to resend email.</p>';

/**
 * Check if passwords match for this particular page.
 *
 *@return   Boolean
 */

function createAccountPasswordsMatch(){
    var password = $("#passwordValue").val();
    var confirmPassword = $("#confirmPasswordValue").val();
    return passwordsMatch(password,confirmPassword);
}

/**
 * Give warning if passwords don't match
 */
function warnPasswordsDoNotMatch(){
    if (!createAccountPasswordsMatch()){
        $("#confirmPasswordMessage").html('<p style="color:red;">Passwords do not match.</p>');
    }
}

/**
 * Give snarky message if password contains "password."
 */

function lousyPassword(){
    var regex = /password/ig;
    if ($("#passwordValue").val().match(regex)){
        $("#passwordMessage").html('<p style="color:red">Including the word "password" in your password is a terrible idea.  It will be accepted, but the system cannot respect you.');
    }
}

/**
 * Give warning if password is bad.
 */

function warnPasswordIsBad(){
    var dumStr = $('#passwordValue').val();
    if (!(passwordLength(dumStr) || dumStr=='')){
        $("#passwordMessage").html('<p style="color:red;">Password must be six characters long or longer.</p>');
    }
}

/**
 * Warn if default display name is not alphanumeric plus spaces.
 */

function warnDefaultDisplayNameNotAlphanumericPlusSpaces(){
    var dumStr = $('#defaultDisplayNameValue').val();
    if (!checkDefaultDisplayName(dumStr) && dumStr!=''){
        $('#defaultDisplayNameMessage').html('<p style="color:red;">Default Display Name must be nonempty, alphanumeric, plus spaces.</p>');
    }
}

/**
 * Warn if email address is already taken.
 */

function warnValidateEmail(){
    var emailAddress = $('#emailAddressValue').val();
    var defaultDisplayName = "dumval";

    if (emailAddress!='' && checkEmailAddress(emailAddress)){
        validateUser(emailAddress,defaultDisplayName,function(data){
            var i,len;
            for (i=0,len=data.length;i<len;i++){
                if (data[i]=='email_address'){
                    $('#emailAddressMessage').html("<p style=\"color:red;\">This email address is already taken.</p>");
                }
            }
        });
    }
}

/**
 * Trigger event.
 */

function trigger(){
    resetField('password');
    resetField('confirmPassword');
    resetField('defaultDisplayName');
    resetField('emailAddress');

    lousyPassword();
    passwordNoMatchMessage('password','confirmPassword');
    passwordMessage('password');

    warnDefaultDisplayNameNotAlphanumericPlusSpaces();

    warnEmailAddressInvalid($('#emailAddressValue').val(),'emailAddress');

    warnEmailAddressTaken($('#emailAddressValue').val(),'emailAddress');
    warnDefaultDisplayNameTaken($('#defaultDisplayNameValue').val(),'defaultDisplayName');
}

/**
 * Submit data to create account.
 *
 *@param    Object      data        JSON object containing all data.
 *@param    Object      callback    Callback function.  One parameter that's
 *                                  true if successful and false if failed.
 *@throws   Exception               If data is not an object.
 *@throws   Exception               If callback is not an object.
 */

function submitData(data,password,callback){
    // Exceptions
        if (typeof data!='object'){
            throw "submitData: data must be JSON object.";
        }
        if (typeof password!='string'){
            throw "submitData: password must be string.";
        }
        if (typeof callback!='function'){
            throw "submitData: callback must be function.";
        }
    var dataToSend = {
        'data'      : data,
        'password'  : password
    };
    $.ajax({
        'url'       : 'createAccountSubmit',
        'type'      : 'POST',
        'data'      : dataToSend,
        'success'   : function(data){
            var tf = (data=="Success.");
            callback(tf);
        },
        'error'     : function(data){
            callback(false);
        }
    });
}

/**
 * Resend verify email for account.
 *
 *@param    String      emailAddress    Email address to resend to.
 *@param    Function    callback        Callback function with one parameter--
 *                                      True if email address exists, false if
 *                                      it doesn't.
 *@throws   Exception                   If emailAddress is not a string.
 *@throws   Exception                   If callback is not a function.
 */

function resendVerifyEmail(emailAddress,callback){
    // Exceptions
        if (typeof emailAddress!='string'){
            throw "resendVerifyEmail: emailAddress must be string.";
        }
        if (typeof callback!='function'){
            throw "resendVerifyEMail: callback must be function.";
        }
    $.ajax({
        'url'      : 'requestNewEmailVerification'  ,
        'type'     : 'POST'                         ,
        'data'     : {'emailAddress' : emailAddress},
        'success'  : function(data){
            callback(data);
        }
    });
}

/**
 * Trigger to resend email.
 */

function resendEmail(){
    $('#createAccountSubmitMessage').html("Loading...");
    resendVerifyEmail($('#emailAddressValue').val(),function(tf){
        if (tf){
            $('#createAccountSubmitMessage').html(createAccountMessage);
        } else {
            var dumStr = '<p>An error has occurred: Unable to find email address in database.  Please try creating account again.<p>';
            $('#createAccountSubmitMessage').html(dumStr);
        }
    });
}

