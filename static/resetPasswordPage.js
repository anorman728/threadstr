$(document).ready(function(){

    $('#newPasswordValue').change(function(){
        resetField('newPassword');
        updatePasswordMatchMessage();
        updatePasswordLengthMessage();
    });

    $('#confirmPasswordValue').change(function(){
        resetField('confirmPassword');
        updatePasswordMatchMessage();
    });

    $('#resetPasswordSubmit').on('click',function(){
        if (!checkPasswordMatch()){
            $('#resetPasswordSubmitMessage').html('<p style="color:red;">Passwords do not match.</p>');
        } else if (!checkPasswordLength()){
            $('#resetPasswordSubmitMessage').html('<p style="color:red;">Password must be at least six characters long.</p>');
        } else {
            resetPasswordUpdate();
        }
    });
});

/**
 * Reset password with newPassword.
 * Callback function parameter is a string.
 *      'Success' if successful.
 *      'No match' if userId and resetPasswordConfirm combination don't exist in
 *      database.
 *
 *@param    String      newPassword             The new password to use.
 *@param    String      userId                  User Id.
 *@param    String      resetPasswordConfirm    Reset password confirmation
 *                                              code.
 *@throws   Exception                           If newPassword is not a string.
 *@throws   Exception                           If userId is not a string.
 *@throws   Exception                           If resetPasswordConfirm is not a
 *                                              string.
 */

function resetPassword(newPassword,userId,resetPasswordConfirm,callback){
    // Exceptions
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof newPassword!='string'){
            throw func+': newPassword must be string.';
        }
        if (typeof userId!='string'){
            throw func+': userId must be string.';
        }
        if (typeof resetPasswordConfirm!='string'){
            throw func+': resetPasswordConfirm must be string.';
        }
    var sendData = {
        'newPassword'          : newPassword,
        'userId'               : userId     ,
        'resetPasswordConfirm' : resetPasswordConfirm
    };
    $.ajax({
        'url'       : 'resetPasswordAction',
        'type'      : 'POST',
        'data'      : sendData,
        'success'   : function(data){
            callback(data);
        }
    });
}

function resetPasswordUpdate(){
    var newPassword = $('#newPasswordValue').val();
    var userId = $('#userIdValue').val();
    var resetPasswordConfirm = $('#resetPasswordConfirmValue').val();

    var messageOutput = '#resetPasswordSubmitMessage';
    $(messageOutput).html('<p>Sending request...</p>');
    resetPassword(newPassword,userId,resetPasswordConfirm,function(data){
        switch (data){
            case 'success':
                $(messageOutput).html('<p>Password changed.  You can now log in from the Log in menu.');
                break;
            case 'no match':
                $(messageOutput).html('<p>Confirmation code not correct.  Make sure that you followed the link from the reset password email.</p>');
                break;
            case 'expired':
                $(messageOutput).html('<p>Password request expired.  If you still need to reset the password, please request a new reset email.</p>');
                break;
            default:
                $(messageOutput).html('<p>Error trying to connect with server.  Please try again.</p>');
        }
    });
}

/**
 * Check that passwords match.
 *
 *@return   Boolean
 */

function checkPasswordMatch(){
    var newPassword = $('#newPasswordValue').val();
    var confirmPassword = $('#confirmPasswordValue').val();

    if (newPassword==confirmPassword){
        return true;
    } else {
        return false;
    }
}

/**
 * Update message for password matching.
 */

function updatePasswordMatchMessage(){
    if (!checkPasswordMatch()){
        $('#confirmPasswordMessage').html('<p style="color:red;">Passwords do not match.</p>');
    }
}

/**
 *  Check if password is long enough.
 */

function checkPasswordLength(){
    var newPassword = $('#newPasswordValue').val();
    if (newPassword.length>=6){
        return true;
    } else {
        return false;
    }
}

/**
 * Update password length message.
 */

function updatePasswordLengthMessage(){
    if (!checkPasswordLength()){
        $('#newPasswordMessage').html('<p style="color:red;">Password must be at least six characters long.</p>');
    }
}

/**
 */

function resetField(fieldName){
    $(`#${fieldName}Message`).html('<p>&nbsp;</p>');
}
