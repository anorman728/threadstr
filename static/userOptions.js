$(document).ready(function(){

    // Reset password 

        $("#newPasswordValue").on('change',function(){
            resetField('newPassword');
            passwordMessage('newPassword');
        });

        $("#confirmPasswordValue").on('change',function(){
            resetField('confirmPassword');
            passwordNoMatchMessage('newPassword','confirmPassword');
        });

    
});
