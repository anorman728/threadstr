// Script to run when every page is loaded.

$(document).ready(function(){

    updateHeader();

    /**
     * Determine if user is logged in.
     *
     *@param    Object      callback    Callback function with one parameter, true
     *                                  or false.
     */

    function isLoggedIn(callback){
        $.ajax({
            'url'       : 'isLoggedIn',
            'type'      : 'POST',
            'success'   : function(data){
                callback(data);
            }
        });
    }

    /**
     * Update which header buttons are hidden.
     */

    function updateHeader(){
        $('#loginDiv').parent().css('display','none');
        isLoggedIn(function(tf){
            if (tf){
                $("#login").hide();
                $("#createAccount").hide();
                $("#logout").show();
                $("#options").show();
            } else {
                $("#login").show();
                $("#createAccount").show();
                $("#logout").hide();
                $("#options").hide();
            }
        });
    }

    /** Home page link */
    $("#logoDiv").on('click',function(){
        window.location.href = "/";
    });

    /** Log in. */

    $("#login").on('click',function(){
        $("#loginDiv").parent().css('display','');
        $("#emailAddressLoginValue").focus();
    });


    /** Close login box. */

    function closeLogin(){
        $("#loginDiv").parent().css('display','none');
    }

    $("#cancelSubmitLabel").on('click',function(){
        closeLogin();
    });

    /** Create account */

    $("#createAccount").on('click',function(){
        window.location.href = "/createAccount";
    });

    /** Options page */

    $('#options').on('click',function(){
        window.location.href = '/userOptions';
    });

    /**
     * Try to log in.
     *
     *@param    String      emailAddress    Email address to check.
     *@param    String      password        Password to check.
     *@param    Function    callback        Callback function with one
     *                                      parameter, true if login was
     *                                      successful, false otherwise.
     *@throws   Exception                   If emailAddress or password is not a
     *                                      string.
     *@throws   Exception                   If callback is not a function.
     */

    function loginCheck(email,password,callback){
        // Exceptions
            if (typeof email!='string' || typeof password!='string'){
                throw "loginCheck: emailAddress and password must be strings.";
            }
            if (typeof callback!='function'){
                throw "loginCheck: callback must be function.";
            }
        var dataToSend = {
            'emailAddress' : email,
            'password'     : password
        }
        $.ajax({
            'url'       : 'login',
            'type'      : 'POST',
            'data'      : dataToSend,
            'success'   : function(data){
                callback(data)
            }
        });
    }

    function logIn(){
        loginCheck($('#emailAddressLoginValue').val(),$('#passwordLoginValue').val(),function(data){
            if (data=='success'){
                updateHeader();
            } else if (data=='not verified'){
                $('#loginSubmitMessage').html('<p style="color:red;">Password is correct, but the account has not been verified through email.</p><p>Please verify, or reset the password through email, which will automatically verify.</p>');
            } else if (data=='no match') {
                $('#loginSubmitMessage').html('<p style="color:red;">Email and password do not match.</p>');
            } else {
                $('#loginSubmitMessage').html('<p style="color:red;">An error has occurred.  Please try again.');
            }
        });
    }

    $('#loginSubmitLabel').on('click',function(data){
        logIn();
    });

    /** Pressing enter on password field. */

    $("#passwordLoginValue").keypress(function(e){
        if (e.which == 13){
            logIn();
        }
    });

    $('#emailAddressLoginValue').keypress(function(e){
        if (e.which == 13){
            $('#passwordLoginValue').focus();
        }
    });

    /** Log out */

    $('#logout').on('click',function(){
        logout();
    });

    function logout(){
        $.ajax({
            'url'      : 'logout',
            'type'     : 'POST',
            'success'  : function(data){
                updateHeader();
            }
        });
    }

    /** Reset password */

    $('#resetPasswordLabel').on('click',function(){
        var emailAddress = $('#emailAddressLoginValue').val();
        var regex = /\S+@\S+\.\S+/;
        if (emailAddress.match(regex)){
            resetPassword(emailAddress,function(data){
                if (data=='success'){
                    $('#resetPasswordMessage').html('<p>A password reset email has been sent to '+emailAddress+'.</p>');
                } else if (data=='no email') {
                    $('#resetPasswordMessage').html('<p style="color:red;">The email address '+emailAddress+' was not found in the database.  Please create a new account if you want to use this email address.');
                } else {
                    $('#resetPasswordMessage').html('<p style="color:red;">An error has occurred.  Please try again.</p>');
                }
            });
        } else {
            $('#emailAddressLoginMessage').html('<p style="color:red;">This email address is not valid.</p>');
        }
    });

    function resetPassword(emailAddress,callback){
        $.ajax({
            'url'       : 'resetPassword'                   ,
            'type'      : 'POST'                            ,
            'data'      : {'emailAddress' : emailAddress}   ,
            'success'   : function(data){
                callback(data);
            },
            'error'     : callback('fail')
        });
    }

});

/**
 * Reset field.
 *
 *@param    String      fieldName       Field to clear.
 */

function resetField(fieldName){
    $('#'+fieldName+'Message').html("<p>&nbsp;</p>");
}

/**
 * Check if password is acceptable length.
 *
 *@param    String      password        Password to check.
 *@return   Boolean
 *@throws   Exception                   If password is not a string.
 */

function passwordLength(password){
    // Exceptions
        if (typeof password!='string'){
            throw "passwordLength: password must be string.";
        }
    return (password.length>=6);
}

/**
 * Display message if password is not correct.
 *
 *@param    String      passwordField       Name of the password field.
 */

function passwordMessage(passwordField){
    password = $('#'+passwordField+'Value').val();
    if (!passwordLength(password) && password.length!=0){
        $('#'+passwordField+'Message').html('<p style="color:red;">Password must be at least six characters long.</p>');
    }
}

/**
 * Check if passwords match.
 *
 *@param    String      newPassword
 *@param    String      confirmPassword
 *@return   Boolean
 *@throws   Exception                   If newPassword or confirmPassword is not
 *                                      string.
 */

function passwordsMatch(newPassword,confirmPassword){
    if (typeof newPassword!='string' || typeof confirmPassword!='string'){
        throw "passwordsMatch: newPassword and confirmPassword must be strings.";
    }
    return (newPassword==confirmPassword);
}

/**
 * Display warning if two fields do not match.
 *
 *@param    String      passwordField           Name of the password field.
 *@param    String      confirmPasswordField    Name of the confirm password
 *                                              field.
 *@throws   Exception                           If either passwordField or
 *                                              confirmPasswordField is not a
 *                                              string.
 */

function passwordNoMatchMessage(passwordField,confirmPasswordField){
    // Exceptions
        if (typeof passwordField!='string' || typeof confirmPasswordField!='string'){
            throw   "passwordNoMatch: passwordField and confirmPasswordField must be strings.";
        }
    password = $('#'+passwordField+'Value').val();
    confirmPassword = $('#'+confirmPasswordField+'Value').val();
    if (!passwordsMatch(password,confirmPassword)){
        var field = '#'+confirmPasswordField+'Message';
        $(field).html('<p style="color:red;">Passwords do not match</p>');
    }
}

/**
 * Check that default display name is alphanumeric plus spaces.
 *
 *@param    String      inputName       Name to check.
 *@return   Boolean
 */

function checkDefaultDisplayName(inputName){
    if (typeof inputName!='string') return false;
    if (inputName.length==0) return false;
    var regex = /^([a-z0-9]|\s)+$/gi;
    if (inputName.match(regex)){
        return true;
    } else {
        return false;
    }
}

/** 
 * Display warning mesage based on invalid display name.
 *
 *@param    String      displayNameField        Name of default display name
 *                                              field.
 *@throws   Exception                           If displayNameField is not a
 *                                              string.
 */

function defaultDisplayNameBadMessage(displayNameField){
    // Exceptions
        if (typeof displayNameField!='string'){
            throw "defaultDisplayNameBadMessage: displayNameField must be string.";
        }
    displayName= $('#'+displayNameField+'Value').val();
    if (!checkDefaultDisplayName(displayName)){
        var field = '#'+displayName+'Message';
        $(field).html('<p style="color:red;">Default Diplsy Name must be nonempty, alphanumeric, plus spaces.</p>');
    }
}

/**
 * Check if email address is valid(ish).
 *
 *@param    String      inputEmail      Email address to check.
 */

function checkEmailAddress(inputEmail){
    var regex = /\S+@\S+\.\S+/;
    if (inputEmail.match(regex)){
        return true;
    } else {
        return false;
    }
}

/**
 * Check if email address or default display name is already taken.
 *
 *@param    String      emailAddress        Email address to check.
 *@param    String      defaultDisplayName  Default display name to check.
 *@param    Object      callback            Callback function with JSON object
 *                                          with results.
 *@throws   Exception                       If either emailAddress or
 *                                          defaultDisplayName are not strings.
 */

function validateUser(emailAddress,defaultDisplayName,callback){
    // Exceptions
        if (typeof emailAddress!='string'){
            throw "emailAddress must be string.";
        }
        if (typeof defaultDisplayName!='string'){
            throw "defaultDisplayName must be string.";
        }
    $.ajax({
        'url'       : 'validateUser',
        'type'      : 'POST',
        'data'      : {
            'emailAddress'      : emailAddress,
            'defaultDisplayName': defaultDisplayName
        },
        'success'   : function(data){
            callback(data);
        },
    });
}

