$(document).ready(function(){

    $('#deleteAccountSubmitLabel').on('click',function(){
        var userID = $('#userIDValue').val();
        var verifyCode = $('#verifyCodeValue').val();
        var password = $('#passwordValue').val();
        var updateField = '#deleteAccountSubmitMessage';
        confirmDelete(userID,verifyCode,password,updateField);
    });

});



function confirmDelete(userID,verifyCode,password,updateField){
    $(updateField).html('Sending delete request...');
    confirmDeleteAjax(userID,verifyCode,password,function(data){
        switch (data){
            case 'success':
                $(updateField).html('Account has been deleted.  You now have a chance at a new life.');
                logout();
                break;
            case 'badVerifyCode':
                $(updateField).html('Unable to verify.  Make sure that you followed the link from the delete request email that was sent to you.');
                break;
            case 'badPassword':
                $(updateField).html('Incorrect password.');
                break;
            case 'expired':
                $(updateField).html('Request has expired.  Please create a new request if you still need to delete this account.');
                break;
        }
    });
}

function confirmDeleteAjax(userID,verifyCode,password,callback){
    $.ajax({
        'url'      : '/deleteAccountAction',
        'type'     : 'POST',
        'data'     : {'userID':userID,'verifyCode':verifyCode,'password':password},
        'success'  : function(data){
            callback(data);
        },
    });
}
