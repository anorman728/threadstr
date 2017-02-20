$(document).ready(function(){

    // Reset password 

        $("#newPasswordValue").on('change',function(){
            updatePasswordMessages();
        });

        $("#confirmPasswordValue").on('change',function(){
            updatePasswordMessages();
        });

        $("#resetPasswordSubmitLabel").on('click',function(){
            var currentPass = $('#currentPasswordValue').val();
            var pass01 = $('#newPasswordValue').val();
            var pass02 = $('#confirmPasswordValue').val();
            var updateField = "resetPasswordSubmit";
            resetPassword(pass01,pass02,currentPass,updateField);
        });

});

function updatePasswordMessages(){
    resetField('newPassword');
    resetField('confirmPassword');
    passwordMessage('newPassword')
    passwordNoMatchMessage('newPassword','confirmPassword');
}

function resetPassword(pass01,pass02,currentPass,updateField){
    resetField(updateField);
    var updateFieldDum= '#'+updateField+'Message';
    if (!passwordsMatch(pass01,pass02)){
        $(updateFieldDum).html('Passwords do not match.');
    } else if (!passwordLength(pass01)){
        $(updateFieldDum).html('Password length is not valid.');
    } else {
        resetPasswordAjax(currentPass,pass01,function(data){
            $(updateFieldDum).html("Updating password...");
            if (data==true){
                $(updateFieldDum).html("Password successfully updated.");
            } else if (data==false){
                $(updateFieldDum).html("\"Current password\" is incorrect.");
            }
        });
    }
}

function resetPasswordAjax(currentPassword,newPassword,callback){
    $.ajax({
        'url'      : '/resetPasswordLoggedInAction',
        'type'     : 'POST',
        'data'     : {'currentPassword': currentPassword,'newPassword': newPassword},
        'success'  : function(data){
            callback(data);
        },
    });
}
