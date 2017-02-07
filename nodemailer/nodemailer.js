/**
 * Manage emails.
 */

// Todo: Hide password.

var nodemailer = require('nodemailer');
var signature = `<p>Please note that the <em>only</em> time Threadstr will request that you click on a link in an email is when verifying an account or resetting a password.  If you did not expect the email, then you should not click on any links, as it could be a scammer trying to steal your personal data.<br>
Be safe while browsing, and <em>never</em> click on a link from an email if you can avoid it.  For any website (not just Threadstr), it's better to go to the homepage and log in from there instead of clicking a link in an email.</p>
`;

var configData = require(__dirname+'/../config.json');
var sendFrom = configData['send from'];
var fullEmail = configData['nodemailer']['auth']['user'];
var mailTransport = nodemailer.createTransport(configData['nodemailer']);

/**
 * Send mail.
 *
 *@param    String      recipient       Email address of recipient.
 *@param    String      subject         Subject line.
 *@param    String      message         HTML message.
 *@throws   Exception                   If recipient, subject, or message are
 *                                      not strings.
 */

function sendMail(recipient,subject,message){
    // Exceptions
        if (typeof recipient!='string' || typeof subject!='string' || typeof message!='string'){
            throw "sendMail:  recipient, subject, and message must all be strings.";
        }
    mailTransport.sendMail({
        from                   : `"${sendFrom}" <${fullEmail}>`        ,
        to                     : recipient                             ,
        subject                : subject                               ,
        html                   : message                               ,
        generateTextFromHtml   : true
    }, function(err){
        if (err) console.log('Unable to send email: ' + err);
    });
}

/**
 * Send verification email.
 *
 *@param    String      recipient       Email address of recipient.
 *@param    String      verifyCode      The verification code.
 *@throws   Exception                   If recipient or verifyCode are not
 *                                      strings.
 *@throws   Exception                   If userId is neither string nor number.
 *@throws   Exception                   If url is not a string.
 */

function sendVerificationEmail(recipient,verifyCode,userId,url){
    // Exceptions
        if (typeof recipient!='string' || typeof verifyCode!='string'){
            throw "sendVerificationEmail: recipient and verifyCode must be strings.";
        }
        if (typeof userId!='string' && typeof userId!='number'){
            throw "sendVerificationEmail: userId must be either string or number.";
        }
        if (typeof url!='string'){
            throw "sendVerificationEmail: url must be string.";
        }
    var urlcode = `${url}/verifyCode?userId=${userId}&code=${verifyCode}`;
    var message = `<p>Thank you for signing up for Threadstr.  Please <a href="${urlcode}">click here</a> to verify your account, or copy and paste the url below.</p>
    ${urlcode}`;
    message += signature;
    sendMail(recipient,"Threadstr account verification",message);
}


/**
 * Send email to reset password.
 *
 *@access   Public
 *@param    String          recipient       Email address to send email to.
 *@param    String|Number   userId          User id.
 *@param    String          url             Url for resetting password.
 *@param    Number          secondsOffset   The number of seconds until the
 *                                          reset expires.
 *@throws   Exception                       If recipient or url are not strings.
 *@throws   Exception                       If userId is neither string nor
 *                                          number.
 *@throws   Exception                       If secondsOffset is defined and not
 *                                          a number.
 */

function resetEmailPassword(recipient,userId,url,secondsOffset){
    // Exceptions
        if (typeof recipient!='string' || typeof url!='string'){
            throw "resetEmailPassword: recipient and url must be strings.";
        }
        if (typeof userId!='string' && typeof userId!='number'){
            throw "resetEmailPassword: userId must be either string or number.";
        }
        if (typeof secondsOffset!='number' || !Number.isInteger(secondsOffset) || secondsOffset<0){
            throw "resetEmailPassword: secondsOffset must be nonnegative integer.";
        }
    // Need to create and get reset_password_confirm code.
    var nodemailer = require(__dirname+'/../connection/userManager');
    nodemailer.resetPasswordResetInfo(userId,secondsOffset,function(resetPasswordConfirm){
        var urlcode = `${url}/resetPasswordPage?userId=${userId}&resetPasswordConfirm=${resetPasswordConfirm}`;
        var message = `
            <p>Threadstr has received a request to reset a password for an account associated with this email address.</p>
            <p>If you did not make the request and did not expect this email, then please ignore this.  Otherwise, click on the link below or copy and paste it into your browser.</p>
            <p><a href="${urlcode}">${urlcode}</a></p>
        `;
        message += signature;
        sendMail(recipient,"Reset Threadstr password",message);
    });
}


module.exports = {
    sendMail                : sendMail              ,
    sendVerificationEmail   : sendVerificationEmail ,
    resetEmailPassword      : resetEmailPassword
};
