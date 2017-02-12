/**
 * Note that I've started making up some docblock standards for Express.js to
 * make documentation easier.
 * At the moment, I haven't applied it to all of them.
 *
 *  The kinds of details in this documentation:
 *      @method
 *          Either "GET" or "POST" (or another query type if I ever decide to use them).
 *      @query
 *          Value that comes from user in the get requests.  Variable name will
 *          be what's attached to query object.
 *      @body
 *          Value that comes from user in post requests.  Variable name will be
 *          what's attached to the body object.
 *      @send
 *          For routes that are intended to display a page, will simply be
 *          "HTML."  For anything else, will be a data type, like String or
 *          Object (for JSON object).
 *      @script
 *          Define JS files to use.  (Only applies when @sends is HTML.)
 */

var root = __dirname;

var getPW = require(root + '/connection/getPasswords');
var configData = require(root + '/config.json');
var fs = require('fs');

getPW.getDatabasePassword(function(password){
    // Set password for database.
        dbPassword = password;
    // Create connection
        var connection = require(root+'/connection/connection');
        con = connection.con;

        var express = require('express');
        var bodyParser = require('body-parser');
        var app = express();

    // Common header.
        var common = require(root+'/pages/common');
        common.setSystemNotifications();

    // Static files
        app.use('/',express.static('static'));

    // client-sessions

        /*
           Use with req.session.
           Variables used are:
                userID
           Add all added variables here, because these act like globals, more or
           less.
         */

        const clientSessions = require('client-sessions');

        app.use(clientSessions({
            cookieName: 'session',
            secret: 'h$998lasdbvsku^kj82inq',
            duration: 1000*60*60*24*60
        }));

    // bodyParser.urlencoded (for POST values)
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));

    /**
     * Frontpage.
     *
     *@method   GET
     *@script           frontPage.js        Not asynchronous.
     *@send     HTML
     */

    app.get('/',function(req,res){
        var pageTitle = "Threadstr";
        var frontPage = require(root+'/pages/frontPage');
        var scripts = [{isAsync:false,src:'/frontPage.js'}];
        common.setHtmlHeader(pageTitle,false,scripts);
        common.setPageHeader(pageTitle);
        common.setMainDiv(frontPage.mainPage());
        var output = common.commonHTML();
        res.send(output);
    });

    /**
     * Login ajax.
     *
     *@method   POST
     *@sends    Boolean
     */

    app.post('/isLoggedIn',function(req,res){
        if (typeof req.session.userID!='undefined' && req.session.userID!=''){
            res.send(true);
        } else {
            res.send(false);
        }
    });

    /**
     * Create account page.
     *
     *@method   GET
     *@script           createAccount.js        Not asynchronous.
     *@send     HTML
     */

    app.get('/createAccount',function(req,res){
        var pageTitle = "Threadstr: Create Account";
        var createAccount = require(root+'/pages/createAccount');
        var scripts = [{isAsync:false,src:'/createAccount.js'}];
        common.setHtmlHeader(pageTitle,false,scripts);
        common.setPageHeader(pageTitle);
        common.setMainDiv(createAccount.createAccountPage());
        var output = common.commonHTML();
        res.send(output);
    });

    /**
     * Check email and default display name ajax.
     *
     *@method   POST
     *@body     String      emailAddress
     *@body     String      defaultDisplayName
     *@send     String
     */

    app.post('/validateUser',function(req,res){
        var db = require(root+'/connection/userManager');
        db.validateUserData(req.body.emailAddress,req.body.defaultDisplayName,function(output){
            res.send(output);
        });
    });

    /**
     * Submit data to create account.  Will send an email to the new user.
     * Response sent back will simply be "Success."
     *
     *@method   POST
     *@body     Object      data        JSON object with data for new user.
     *@body     String      password    New user's password.
     *@send     String
     */

    app.post('/createAccountSubmit',function(req,res){
        var db = require(root+'/connection/userManager');
        db.addUser(req.body.data,req.body.password,function(userID,verifyCode){
            res.send("Success.");
            var sendMail = require(root+'/nodemailer/nodemailer');
            var fullUrl = req.protocol + '://' + req.get('host');
            sendMail.sendVerificationEmail(req.body.data.email_address,verifyCode,userID,fullUrl);
        });
    });

    /**
     * Request new email verification.
     * Will send a new email to the user.
     * The send value is true if the emailaddress is found and false if it isn't.
     *
     *@method   POST
     *@body     String      emailAddress
     *@send     Boolean
     */

    app.post('/requestNewEmailVerification',function(req,res){
        var db = require(root+'/connection/userManager');
        db.getUserRowFromEmailAddress(req.body.emailAddress,function(data){
            if (data===false){
                res.send(false);
            } else {
                res.send(true);
                var sendMail = require(root+'/nodemailer/nodemailer');
                var fullUrl = req.protocol + '://' + req.get('host');
                sendMail.sendVerificationEmail(req.body.emailAddress,data['verify_code'],data['user_id'],fullUrl);
            }
        });
    });

    /**
     * Verify account.
     *
     *@method   GET
     *@query    String      userId      Id of user to verify.
     *@query    String      code        Verification code that needs to match.
     *@send     HTML
     */

    app.get('/verifyCode',function(req,res){
        var pageTitle = "Threadstr: Verify Account";
        var verifyCode = require(root+'/pages/verifyCode');
        common.setHtmlHeader(pageTitle,false,false);
        common.setPageHeader(pageTitle);
        if (typeof req.query.userId!='string' || typeof req.query.code!='string'){
            common.setMainDiv(`<p class="formContainer">Unable to validate.  Doublecheck that you clicked the link from the verification email.</p>`);
            res.send(common.commonHTML());
        } else {
            verifyCode.verifyCode(req.query.userId,req.query.code,function(outputHtml){
                common.setMainDiv(outputHtml);
                var output = common.commonHTML();
                res.send(output);
            });
        }
    });

    /**
     * Log in.  Sets the user's cookie.  Sends string of "success" if
     * successful, "no match" if email and password do not match, and "not
     * verified" if the user has not been verified.
     *
     *@method   POST
     *@body     String      emailAddress    Email address of user logging in.
     *@body     String      password        User's password.
     *@send     String
     */

    app.post('/login',function(req,res){
        var db = require(root+"/connection/userManager");
        db.checkEmailAndPassword(req.body.emailAddress,req.body.password,function(results,userID){
            if (results=='success'){
                req.session.userID = userID;
            }
            res.send(results);
        });
    });

    /**
     *Logout functionality.
     *
     *@method    POST
     *@send      Boolean
     */

    app.post('/logout',function(req,res){
        req.session.userID = '';
        res.send(true);
    });

    /** Password management. */

        /**
         * Send email to reset password.  Meant to be used as Ajax call.
         *
         *@method   POST
         *@body     String      emailAddress    Email address of account to reset.
         *@sends    String                      "Success" if email address
         *                                      exists in database and will send
         *                                      an email to the user.
         *                                      "No email" if email exists in
         *                                      database.
         */

        app.post('/resetPassword',function(req,res){
            var db = require(root+"/connection/userManager");
            // For the moment, going to simply reuse the getUserRowFromEmailAddress function, but, in the future, might be faster to create a function specifically for this.
            db.getUserRowFromEmailAddress(req.body.emailAddress,function(data){
                if (data!==false){
                    res.send("success");
                    var sendMail = require(root+'/nodemailer/nodemailer');
                    var fullUrl = req.protocol + '://'+ req.get('host');
                    var secondOffset = 60*60*12;
                    sendMail.resetEmailPassword(req.body.emailAddress,data.user_id,fullUrl,secondOffset);
                } else {
                    res.send("no email");
                }
            });
        });

        /**
         * Page for resetting password.  Checks the value of resetPasswordLimit,
         * but does not actually reset the password.  That's done through a
         * different route, called via ajax.  This just creates the page to reset
         * it.
         *
         *@method    GET
         *@query     String      userId                  Id of user to reset the
         *                                               password of.
         *@query     String      resetPasswordConfirm    This needs to match
         *                                               reset_password_confirm
         *                                               in the user row in the
         *                                               database.
         *@send      HTML
         */

        app.get('/resetPasswordPage',function(req,res){
            var pageTitle = "Threadstr: Reset Password";
            var scripts = [{isAsync:false,src:'/resetPasswordPage.js'}]
            common.setHtmlHeader(pageTitle,false,scripts);
            common.setPageHeader(pageTitle);
            var resetPasswordPage = require(root+'/pages/resetPasswordPage');
            resetPasswordPage.createResetPasswordPage(req.query.userId,req.query.resetPasswordConfirm,function(html){
                common.setMainDiv(html);
                var output = common.commonHTML();
                res.send(output);
            });
        });

        /**
         * Respond to reset password request.  Checks if the reset password
         * confirm code matches, then sends string of "success" if changed
         * successfully, "no match" if resetPasswordConfirmCode doesn't match,
         * and "expired" if time has expired.
         *
         *@method   POST
         *@body     String      newPassword             Password to change to.
         *@body     String      userId                  User id to change.
         *@body     String      resetPasswordConfirm    Confirmation code.
         *@send     String
         */

        app.post('/resetPasswordAction',function(req,res){
            var db = require(root+'/connection/userManager');
            var userId = parseInt(req.body.userId);
            db.resetPasswordConfirmCheck(userId,req.body.resetPasswordConfirm,function(data){
                switch (data){
                    case "success":
                        db.changePassword(userId,req.body.newPassword,function(){
                            res.send(data);
                        });
                        break;
                    default:
                        res.send(data);
                }
            });
        });

    /**
     * Options page.  No queries.
     *
     *@method   GET
     *@send     HTML
     */

    app.get('/userOptions',function(req,res){
        var pageTitle = "Threadstr: User Options";
        var userOptions = require(root+'/pages/userOptions');
        var scripts = [{isASync:false,src:'/userOptions.js'}];
        common.setHtmlHeader(pageTitle,false,scripts);
        common.setPageHeader(pageTitle);
        userOptions.userOptionsPage(req.session.userID,function(data){
            common.setMainDiv(data);
            var output = common.commonHTML();
            res.send(output);
        });
    });

    // Start server.

        var listeningMsg = "Listening...";

        if (configData['privateKey']=='' || configData['certificate']==''){
            app.listen(8000,function(){
                console.log(listeningMsg);
            });
        } else {
            var privateKey = fs.readFileSync(configData['privateKey']);
            var certificate = fs.readFileSync(configData['certificate']);
            const https = require('https');
            https.createServer({
                key: privateKey,
                cert: certificate
            },app).listen(8000,function(){
                console.log(listeningMsg);
            });
        }

});
