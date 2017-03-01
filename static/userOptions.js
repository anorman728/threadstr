$(document).ready(function(){

    /* Reset password. */

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

    /* Change email address. */

        $("#newEmailAddressValue").on('change',function(){
            updateEmailAddressMessages();
        });

        $('#confirmEmailAddressValue').on('change',function(){
            updateEmailAddressMessages();
        });

        $('#changeEmailSubmitLabel').on('click',function(){
            var newEmailAddress = $('#newEmailAddressValue').val();
            var confirmEmailAddress = $('#confirmEmailAddressValue').val();
            var password = $('#confirmPasswordEmailChangeValue').val();
            var updateField = "changeEmailSubmit";
            validateEmailChangeForm(newEmailAddress,confirmEmailAddress,password,function(tf){
                if (tf) {
                    changeEmail(newEmailAddress,password,updateField);
                } else {
                    $('#'+updateField+'Message').html('<span style="color:red;">There are problems above that need to be fixed or blank fields.</span>');
                }
            });
        });

    /* Delete account. */

        $('#deleteAccountSubmitButtonLabel').on('click',function(){
            var updateField = '#deleteAccountSubmitButtonMessage';
            deleteAccount(function(tf){
                if (tf) {
                    $(updateField).html('An email has been sent to you to verify that you want to delete this account.');
                }
            });
        });

});

/* Change password. */

    function updatePasswordMessages(){
        resetField('newPassword');
        resetField('confirmPassword');
        passwordMessage('newPassword')
        passwordNoMatchMessage('newPassword','confirmPassword');
    }

    function resetPassword(pass01,pass02,currentPass,updateField){
        updatePasswordMessages();
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

/* Change email address. */

    function updateEmailAddressMessages(){
        resetField('newEmailAddress');
        resetField('confirmEmailAddress');
        resetField('confirmPassword');
        var newEmail = $('#newEmailAddressValue').val();
        var confirmEmail = $('#confirmEmailAddressValue').val();
        warnEmailAddressInvalid(newEmail,'newEmailAddress');
        warnEmailAddressTaken(newEmail,'newEmailAddress');
        warnEmailsDoNotMatch(newEmail,confirmEmail,'confirmEmailAddress');
    }

    function validateEmailChangeForm(newEmailAddress,confirmEmailAddress,password,callback){
        if (newEmailAddress=='' || confirmEmailAddress==''){
            callback(false);
        } else if (newEmailAddress!=confirmEmailAddress){
            callback(false);
        } else if (!checkEmailAddress(newEmailAddress)){
            callback(false);
        } else {
            validateUser(newEmailAddress,'dummyDisplayName',function(data){
                var i,len;
                var tf = true;
                for (i=0,len=data.length;i<len;i++){
                    if (data[i]=='email_address'){
                        tf = false;
                    }
                }
                callback(tf);
            });
        }
    }

    function changeEmail(newEmailAddress,password,updateField){
        /* Exceptions */
            var fName = "changeEmail";
            if (typeof newEmailAddress != 'string'){
                throw fName+": newEmailAddress must be string.";
            }
            if (typeof password != 'string'){
                throw fName+": password must be string.";
            }
            if (typeof updateField != 'string'){
                throw fName+": updateField must be string.";
            }
        updateEmailAddressMessages();
        resetField(updateField);
        changeEmailAjax(password,newEmailAddress,function(tf){
            if (tf) {
                $('#'+updateField+'Message').html('An email has been sent to your new address.  Please verify to confirm a change in email address.');
            } else {
                $('#'+updateField+'Message').html('<span style="color:red;">Invalid password.</span>');
            }
        });
    }

    function changeEmailAjax(password,newEmailAddress,callback){
        $.ajax({
            'url'      : '/changeEmailAddress',
            'type'     : 'POST',
            'data'     : {'password':password,'newEmailAddress':newEmailAddress},
            'success'  : function(data){
                callback(data);
            },
        });
    }

/* Delete account. */

    function deleteAccount(callback){
        $.ajax({
            'url'       : '/deleteAccountRequest',
            'type'      : 'POST',
            'success'   :function(data){
                callback(data);
            },
        });
    }
