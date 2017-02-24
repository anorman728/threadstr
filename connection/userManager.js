/*
 * Functions to manipulate database.
 * TODO: Reorganize order of functions.
 */

var arrayTools = require(__dirname+'/../jsTools/arrayTools');

/**
 * Checks email address and default display name to see if they exist.
 * The callback's only parameter is an array containing what already exists in
 * database (i.e., will be empty array if neither the email address nor the
 * default display name already exists.)
 *
 *@access   Public
 *@param    String      emailAddress        The email address to check.
 *@param    String      defaultDisplayName  The default display name to check.
 *@param    Object      callback            Callback function, with array
 *                                          containing what already exists in
 *                                          the database as only parameter.
 *@throws   Exception                       If emailAddress is not a string.
 *@throws   Exception                       If emailAddress is not valid format.
 *@throws   Exception                       If defaultDisplayName is not a
 *                                          nonempty string.
 */

function validateUserData(emailAddress,defaultDisplayName,callback){
    // Throw exceptions.
        if (typeof emailAddress != "string"){
            throw "emailAddress must be string.";
        }
        if (!(/\S+@\S+\.\S+/.test(emailAddress))){
            console.log(emailAddress);//dmz1
            throw "Not a valid email address.";
        }
        if (typeof defaultDisplayName != "string" || defaultDisplayName ==''){
            throw "defaultDisplayName must be nonempty string.";
        }
        // Todo: Throw exception if username contains non alphanumeric characters.

    var queryDum = `
        SELECT
            count(default_display_name) as default_display_name ,
            count(email_address) as email_address
        FROM
            users
        WHERE
            default_display_name    = ? OR
            email_address           = ?
    `;

    defaultDisplayName = defaultDisplayName.trim();
    emailAddress = emailAddress.trim();
    var columnValues = [defaultDisplayName,emailAddress];

    queryXSS(queryDum,columnValues,function(err,rows,fields){
        if (err) console.log(err);
        var returnArr = [];
        var checkArr = ['default_display_name','email_address'];
        for (var i=0,len=checkArr.length;i<len;i++){
            if (rows[0][checkArr[i]]>0){
                returnArr.push(checkArr[i]);
            }
        }
        callback(returnArr);
    });
}

/**
 * Adds user to database.  No return value, but the callback function's one
 * parameter is the new user id.
 * Password is not part of attributesJSON because it needs to be treated
 * differently.
 *
 *@access   Public
 *@param    Object      attributesJSON      JSON object of the data to add to
 *                                          database.  Keys must be column
 *                                          names, like
 *                                          {'default_display_name':'username'}.
 *                                          Can't include passwords.
 *@param    String      password            The password for the new user.
 *                                          (Already salted and hashed on
 *                                          frontend, but will do it again.
 *@param    Function    callback            Callback function.  First parameter
 *                                          is the new user's id.  Second
 *                                          parameter is the verification code
 *                                          to be sent through email.
 *@throws   Exception                       If attributesJSON is not a JSON
 *                                          object.
 *@throws   Exception                       If email address is not a string.
 *@throws   Exception                       If email address is not valid.
 *@throws   Exception                       If default_display_name is not a
 *                                          nonempty string.
 *@throws   Exception                       If default_display_name is not
 *                                          alphanumeric.
 *@throws   Exception                       If password is not a string or is
 *                                          less than 6 characters.
 *@throws   Exception                       If callback is not a function.
 *
 */

function addUser(attributesJSON,password,callback){
    /* Exceptions */
        if (typeof attributesJSON!='object' || attributesJSON.constructor!={}.constructor){
            throw "attributesJSON must be JSON object.";
        }
        if (typeof attributesJSON['email_address']!='string'){
            throw "email_address must be string.";
        }
        if (!(/[^@]+@[^@]+(\.)(.)+$/.test(attributesJSON['email_address']))){
            throw "Not a valid email address.";
        }
        if (typeof attributesJSON['default_display_name']!='string' || attributesJSON['default_display_name']==''){
            throw 'default_display_name must be nonempty string.';
        }
        if (!(/^\w+$/.test(attributesJSON['default_display_name']))){
            throw "default_display_name must be alphanumeric.";
        }
        if (typeof password!='string' || password.length<6){
            throw "password must be string >=6 characters.";
        }
        if (typeof callback!='function'){
            throw "callback must be function.";
        }
    for (var key in attributesJSON){
        if (typeof attributesJSON[key] == 'string'){
            attributesJSON[key] = attributesJSON[key].trim();
        }
    }
    var returnVal = validateUserData(attributesJSON['email_address'],attributesJSON['default_display_name'],function(returnArr){
        if (returnArr.length!=0){
            throw "Properties already exist: "+returnArr.join(', ');
        } else {
            var bcrypt = require('bcrypt-nodejs');
            var salt = bcrypt.genSaltSync();
            var verifyCode = cleanGetValue(bcrypt.genSaltSync());
            var passwordHash = bcrypt.hashSync(password,salt);
            var columnNamesArr = [];
            var columnValuesArr = [];
            var questionArr = [];
            for (var columnName in attributesJSON){
                columnNamesArr.push(columnName);
                columnValuesArr.push(attributesJSON[columnName]);
                questionArr.push('?');
            }
            var columnNames = con.escape(columnNamesArr.join(','));
            columnNames = columnNames.substring(1,columnNames.length-1);// Because escape is suddenly adding quotes.
            var questionMarks = questionArr.join(',');
            var queryDum = `
                INSERT INTO
                    users(
                        ${columnNames},
                        time_joined,
                        password_salt,
                        password_hash,
                        verify_code
                    )
                VALUES(
                    ${questionMarks},
                    UNIX_TIMESTAMP(),
                    '${salt}',
                    '${passwordHash}',
                    '${verifyCode}'
                )
            `;
            queryXSS(queryDum,columnValuesArr,function(err,result){
                if (err) {console.log(err);}
                callback(result.insertId,verifyCode);
            });
        }
    });
}

/**
 * Get MySQL row for user based on emailAddress.
 * Callback function has one parameter, being a JSON object with all data from
 * that row if a match exists, but a bool of "false" if it doesn't exist.
 *
 *@access   Public
 *@param    String      emailAddress        Email address.
 *@param    Function    callback            Callback function.
 *@throws   Exception                       If emailAddress is not a string.
 *@throws   Exception                       If callback is not a function.
 */

function getUserRowFromEmailAddress(emailAddress,callback){
    // Exceptions
        if (typeof emailAddress!='string' || emailAddress==''){
            throw "getUserRowFromEmailAddress: emailAddress must be nonempty string.";
        }
        if (typeof callback!='function'){
            throw "getUserRowFromEmailAddress: callback must be nonempty string.";
        }
    var queryDum = `
        SELECT
            * 
        FROM
            users
        WHERE
            email_address = ?
    `;
    var columnValues = [emailAddress];
    queryXSS(queryDum,columnValues,function(err,rows,fields){
        if (err) console.log(err);
        if (rows.length==0){
            callback(false);
        } else {
            callback(rows[0]);
        }
    });
}

/**
   Get MySQL row fror user based on userId.
   Callback function has one parameter, being a JSON object with all data from
   that row if a match exists, but a bool of "false" if it doesn't exist.

  @access   Public
  @param    String|Number   userId      User id.
  @param    Function        callback    callback funcion.
 */

function getUserRowFromId(userId,callback){
    // Exceptions
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if ((typeof userId=='string' && userId=='') || (typeof userId!='string' && typeof userId!='number')){
            throw `${func}: userId must be nonempty string or number.`;
        }
        if (typeof callback!='function'){
            throw `${func}: callback must be function.`;
        }
    var queryDum = `
        SELECT
            *
        FROM
            users
        WHERE
            user_id = ?
    `;
    var columnValues = [userId];
    queryXSS(queryDum,columnValues,function(err,rows,fields){
        if (err) console.log(err);
        if (rows.length==0){
            callback(false);
        } else {
            callback(rows[0]);
        }
    });
}

/**
 * Check if user verification data is correct.
 *
 *@param    String      userId      User id to validate.
 *@param    String      verifyCode  Code to match.
 *@param    Object      callback    Callback function with one parameter: True
 *                                  if match, false if no match.
 *@throws   Exception               If userId or verifyCode are not strings.
 *@throws   Exception               If callback is not a function.
 */

function checkVerifyUser(userId,verifyCode,callback){
    // Exceptions
        if (typeof userId!='string' || typeof verifyCode!='string'){
            throw "checkVerifyUser: userId and verifyCode must be strings.";
        }
        if (typeof callback!='function'){
            throw "checkVerifyUser: callback must be function.";
        }
    var queryDum = `
        SELECT
            verify_code
        FROM
            users
        WHERE
            user_id = ?
    `;
    var columnValues = [userId];
    queryXSS(queryDum,columnValues,function(err,rows,fields){
        if (err) console.log(err);
        callback((rows[0]['verify_code']==verifyCode));
    });
}

/**
 * Verify user if information is correct.
 *
 *@param    String      userId      The userid to check.
 *@param    String      verifyCode  The code to check.
 *@param    Object      callback    Callback function with one parameter: True
 *                                  if successful, string with explanation if
 *                                  not.
 *@throws   Exception               If either userId or verifyCode are not
 *                                  strings.
 */

function verifyUser(userId,verifyCode,callback){
    // Exceptions
        if (typeof userId!='string' || typeof verifyCode!='string'){
            throw "verifyUser: userId and verifyCode must be strings.";
        }
    checkVerifyUser(userId,verifyCode,function(tf){
        if (tf){
            var queryDum = `
                UPDATE
                    users
                SET
                    email_verified = 1
                WHERE
                    user_id = ?
            `;
            var columnValues = [userId];
            queryXSS(queryDum,columnValues,function(err,result){
                if (err) {
                    console.log(err);
                    callback("Unable to connect to database.");
                } else {
                    callback(true);
                }
            });
        } else {
            callback("userId and code do not match.");
        }
    });
}

/**
 * Reset reset_password_confirm and reset_password_limit.
 *
 *@access   Public
 *@param    String|Number   UserId          User Id to reset.
 *@param    Number          secondsOffset   Seconds until expired.
 *@param    Function        callback        Callback function to use.  There is
 *                                          one parameter, being the new value
 *                                          of reset_password_confirm.
 *@throws   Exception                       If userId is neither string nor
 *                                          number.
 *@throws   Exception                       If callback is not a function.
 *@throws   Exception                       If userId is not in database.
 *@throws   Exception                       If secondsOffset is not an integer.
 */

function resetPasswordResetInfo(userId,secondsOffset,callback){
    // Exceptions
        if (typeof userId != 'string' && typeof userId!='number'){
            throw "resetPasswordResetInfo: userId must be string or number.";
        }
        if (typeof callback != 'function'){
            throw "resetPasswordResetInfo: callback must be function.";
        }
        if (typeof secondsOffset != 'number' || !Number.isInteger(secondsOffset) || secondsOffset<0){
            throw "resetPasswordResetInfo: secondsOffset must be nonnegative integer.";
        }
    var bcrypt = require('bcrypt-nodejs');
    var resetPasswordConfirm = cleanGetValue(bcrypt.genSaltSync());
    var queryDum = `
        UPDATE
            users
        SET
            reset_password_confirm     = ?,
            reset_password_limit       = UNIX_TIMESTAMP() + ${secondsOffset}
        WHERE
            user_id = ?
    `;
    var columnVals = [resetPasswordConfirm,userId];
    queryXSS(queryDum,columnVals,function(err,rows,fields){
        if (err) console.log(err);
        callback(resetPasswordConfirm);
    });
}

/**
 * Check if passwordConfirmCheck matches what's in the database *and* if it's
 * expired.
 * Callback function has one string parameter: "success" if matches and within
 * time limit, "expired" if time is expired (regardless of match), and "no
 * match" if time has not expired but there is no match.
 *
 *@access   Public
 *@param    String|Number   userId                  The id of the user row to
 *                                                  check.
 *@param    String          resetPasswordConfirm    Confirm code to check.
 *@param    Function        callback                Callback function.
 *@throws   Exception                               If userId is neither string
 *                                                  nor number.
 *@throws   Exception                               If resetPasswordConfirm is
 *                                                  not a string.
 *@throws   Exception                               If callback is not a
 *                                                  function.
 */

function resetPasswordConfirmCheck(userId,resetPasswordConfirm,callback){
    // Exceptions
        if (typeof userId!='string' && typeof userId!='number'){
            throw "resetPasswordConfirmCheck: userId must be string or number.";
        }
        if (typeof resetPasswordConfirm!='string'){
            throw "resetPasswordConfirmCheck: resetPasswordConfirm must be string.";
        }
        if (typeof callback!='function'){
            throw "resetPasswordConfirmCheck: callback must be function.";
        }
    resetPasswordConfirm = con.escape(resetPasswordConfirm);
    columnVals = [userId];
    var queryDum = `
        SELECT
            (${resetPasswordConfirm}=reset_password_confirm) as resetPasswordConfirm,
            (UNIX_TIMESTAMP()<reset_password_limit) as timeNotExpired
        FROM
            users
        WHERE
            user_id = ?
    `;
    queryXSS(queryDum,columnVals,function(err,rows,columns){
        if (err) console.log(err);
        if (rows[0]['resetPasswordConfirm']==0){
            callback('no match');
        } else if (rows[0]['timeNotExpired']==0){
            callback('expired');
        } else {
            callback('success');
        }
    });
}

/**
 * Check email and password for logging in.
 *
 *@access   Public
 *@param    String      emailAddress        Email address to check.
 *@param    String      password            Password to check.
 *@param    Function    callback            Callback function with two
 *                                          parameters: First is "success" if
 *                                          email and password match and account
 *                                          is verified, "no match" if they
 *                                          don't match, and "not verified" if
 *                                          the email and password match, but
 *                                          the account is not verified.  Second
 *                                          is the userId if first is "success,"
 *                                          and undefined in all other cases.
 *@throws   Exception                       If emailAddress or password is not a
 *                                          string.
 *@throws   Exception                       If callback is not a function.
 */

function checkEmailAndPassword(emailAddress,password,callback){
    // Exceptions
        if (typeof emailAddress!='string' || typeof password!='string'){
            throw "checkEmailAndPassword: emailAddress and password must be strings.";
        }
        if (typeof callback!='function'){
            throw "checkEmailAndPassword: callback must be a function.";
        }
    var queryDum = `
        SELECT
            user_id         ,
            password_hash   ,
            password_salt   ,
            email_verified
        FROM
            users
        WHERE
            email_address = ?
    `;
    var columnVals = [emailAddress];
    queryXSS(queryDum,columnVals,function(err,rows,fields){
        if (err) console.log(err);
        if (rows.length==0){
            callback("no match");
        } else {
            var bcrypt = require('bcrypt-nodejs');
            var salt = rows[0]['password_salt'];
            var passwordHash = bcrypt.hashSync(password,salt);
            if (passwordHash==rows[0]['password_hash']){
                if (rows[0]['email_verified']==1){
                    callback('success',rows[0]['user_id']);
                } else {
                    callback('not verified');
                }
            } else {
                callback('no match');
            }
        }
    });
}

/**
 * Check id and password, for actions needing secondary password verification.
 * Callback function has one parameter:  "True" if id and password match and
 * "false" if they don't.
 *
 *@access   Public
 *@param    Number      userID
 *@param    String      password
 *@param    Function    callback
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If password is not a string.
 *@throws   Exception               If callback is not a function.
 */

function checkIdAndPassword(userID,password,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (!Number.isInteger(userID)){
            throw `${func}: userId must be an integer.`;
        }
        if (typeof password != 'string'){
            throw `${func}: password must be string.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be a function.`;
        }
    var queryDum = `
        SELECT
            password_hash,
            password_salt
        FROM
            users
        WHERE
            user_id = ?
    `;
    var columnVals = [userID];
    queryXSS(queryDum,columnVals,function(err,rows,fields){
        if (err) console.log(err);
        if (rows.length==0){
            callback(false);
        } else {
            var bcrypt = require('bcrypt-nodejs');
            var salt = rows[0]['password_salt'];
            var passwordHash = bcrypt.hashSync(password,salt);
            if (passwordHash==rows[0]['password_hash']){
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

/**
 * Changes the default display name for the defined userID.  Callback function
 * has no parameters.
 *
 *@access   Public
 *@param    Number      userID          The user_id of the user.
 *@param    String      newDefaultName  Name that we want to change to.
 *@param    Function    callback        Callback function.  There are no 
 *                                      parameters.                      
 *@throws   Exception                   If userID is not an integer.
 *@throws   Exception                   If newDefaultName is not a nonempty 
 *                                      string.                             
 *@throws   Exception                   If newDefaultName is not alphanumeric.
 *                                      
 */

function changeDefaultName(userID,newDefaultName,callback){
    // Throw exceptions
        if (!Number.isInteger(userID)){
            throw "userID must be integer.";
        }
        if (typeof newDefaultName!='string' || newDefaultName==''){
            throw "newDefaultName must be nonempty string.";
        }
        if (!(/^\w+$/.test(newDefaultName))){
            throw "default_display_name must be alphanumeric.";
        }
    validateUserData('dummyaddress@dum.com',newDefaultName,function(returnArr){
        if (arrayTools.arrayIncludes(returnArr,'default_display_name')){
            throw "newDefaultName already exists.";
        } else {
            var queryDum = `
                UPDATE
                    users
                SET
                    default_display_name = ?
                WHERE
                    user_id = ?
            `;
            var columnValues = [newDefaultName,userID];
            queryXSS(queryDum,columnValues,function(err,result){
                if (err) {console.log(err);}
                callback();
            });
        }
    });
}

/**
 * Add email address to "unverified_email_address" column (which will move to
 * the "email_address" column once it's been verified through email).
 * Callback function has one parameter-- The value put into the
 * change_email_verify_code column.
 *
 *@access   Private
 *@param    Number      userID              user_id of the user.
 *@param    String      newEmailAddress     New email address to use.
 *@param    Number      expirySeconds       Number of seconds before email
 *                                          change expires.
 *@param    Function    callback            Callback function.  Does not have 
 *                                          any parameters.                   
 *@throws   Exception                       If userID is not an integer.
 *@throws   Exception                       If newEmailAddress is not valid.
 *@throws   Exception                       If expirySeconds is not an integer.
 *@throws   Exception                       If callback is not a function.
 *                                          
 */

function addUnverifiedEmailAddress(userID,newEmailAddress,expirySeconds,callback){
    /* Exceptions */
        if (!Number.isInteger(userID)){
            throw "userID must be integer.";
        }
        if (typeof newEmailAddress!='string' || !(/^\S+@\S+\.\S+$/.test(newEmailAddress))){
            throw "Not a valid email address.";
        }
        if (typeof expirySeconds != "number" || !Number.isInteger(expirySeconds)){
            throw "expirySeconds must be integer.";
        }
        if (typeof callback != 'function'){
            throw "callback must be function.";
        }
    bcrypt = require('bcrypt-nodejs');
    var verifyCode = cleanGetValue(bcrypt.genSaltSync());
    validateUserData(newEmailAddress,'dummyname',function(returnArr){
        if (arrayTools.arrayIncludes(returnArr,'email_address')){
            throw "newEmailAddress already exists.";
        } else {
            var queryDum = `
                UPDATE
                    users
                SET
                    unverified_email_address    = ?                ,
                    change_email_verify_code    = "${verifyCode}"  ,
                    change_email_limit          = UNIX_TIMESTAMP() + ${expirySeconds}
                WHERE
                    user_id = ?
            `;
            var columnValues = [newEmailAddress,userID];
            queryXSS(queryDum,columnValues,function(err,result){
                if (err) {console.log(err);}
                callback(verifyCode);
            });
        }
    });
}

/**
 * Change the timezone of the defined user.  Callback function has no
 * parameters.
 *
 *@access   Public
 *@param    Number      userID          user_id of the user.
 *@param    String      newTimezone     New timezone to use.
 *@param    Object      callback        Callback function.  Does not have any
 *                                      parameters.
 *@throws   Exception                   If userID is not an integer.
 *@throws   Exception                   If newTimezone is not a nonempty string.
 */

function changeTimezone(userID,newTimezone,callback){
    // Throw exceptions.
        if (!Number.isInteger(userID)){
            throw "userID must be integer.";
        }
        if (typeof newTimezone!='string' || newTimezone==''){
            throw "newTimezone must be nonempty string.";
        }
    var queryDum = `
        UPDATE
            users
        SET
            timezone = ?
        WHERE
            user_id = ?
    `
    var columnValues = [newTimezone,userID];
    queryXSS(queryDum,columnValues,function(err,result){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * Change the password of the defined user.  Callback function has no
 * parameters.
 *
 *@access   Public
 *@param    Number      userID          user_id of the user.
 *@param    String      newPassword     New password to use.
 *@param    Object      callback        Callback function.  Does not have any
 *                                      parameters.
 *@throws   Exception                   If userID is not an integer.
 *@throws   Exception                   If newPassword is not a string >= 6
 *                                      characters.
 */

function changePassword(userID,newPassword,callback){
    // Throw exceptions.
        if (!Number.isInteger(userID)){
            throw "userID must be integer.";
        }
        if (typeof newPassword!='string' || newPassword.length<6){
            throw "password must be string >=6 characters.";
        }
    // Get salt.
        var queryDum = `
            SELECT
                password_salt
            FROM
                users
            WHERE
                user_id = ?
        `;
        var columnValues = [userID];
        queryXSS(queryDum,columnValues,function(err,rows,fields){
            if (err) {console.log(err);}
            var salt = rows[0]['password_salt'];
            // Salt and set new password.
            var bcrypt = require('bcrypt-nodejs');
            var passwordHash = bcrypt.hashSync(newPassword,salt);
            queryDum = `
                UPDATE
                    users
                SET
                    password_hash = ?,
                    email_verified = 1
                WHERE
                    user_id = ?
            `;
            columnValues = [passwordHash,userID];
            queryXSS(queryDum,columnValues,function(err,result){
                if (err) {console.log(err);}
                callback();
            });
        });
}

/**
 * Change email verification of the defined user.  Callback function has no
 * parameters.
 *
 *@access   Public
 *@param    Number      userID          user_id of the user.
 *@param    Number      validateValue   1 or 0.
 *@param    Object      callback        Callback function.  Does not have any
 *                                      parameters.
 *@throws   Exception                   If userUD is not an integer.
 *@throws   Exception                   If validateValue is neither 1 or 0.
 *
 */

function changeEmailVerification(userID,validateValue,callback){
    // Throw exceptions.
        if (!Number.isInteger(userID)){
            throw "userID must be integer.";
        }
        if (validateValue!=0 && validateValue!=1){
            throw "validateValue must be 0 or 1.";
        }
    var queryDum = `
        UPDATE
            users
        SET
            email_verified = ?
        WHERE
            user_id = ?
    `;
    var columnValues = [validateValue,userID];
    queryXSS(queryDum,columnValues,function(err,result){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * Call addUnverifiedEmailAddress if and only if ID and password match and new
 * email address isn't already taken.
 * Callback function has one parameter-- verification code if it matches, empty
 * string if it doesn't.
 * Could be refactored-- there's a little bit of pyramid of death here.
 *
 *@access   Public
 *@param    Integer     userID
 *@param    String      password
 *@param    String      newEmailAddress
 *@param    Number      expirySeconds       Number of seconds before expires.
 *@param    Function    callback
 *@throws   Exception                       If userID is not an integer.
 *@throws   Exception                       If password is not a string.
 *@throws   Exception                       If newEmailAddress is not a string.
 *@throws   Exception                       If expirySeconds is not an integer.
 *@throws   Exception                       If callback is not a function.
 */

function attemptAddUnverifiedEmailAddress(userID,password,newEmailAddress,expirySeconds,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof userID != 'number' || !Number.isInteger(userID)){
            throw `${func}: userID must be integer.`;
        }
        if (typeof password != 'string'){
            throw `${func}: password must be string.`;
        }
        if (typeof newEmailAddress != 'string'){
            throw `${func}: newEmailAddress must be string.`;
        }
        if (typeof expirySeconds != 'number' || !Number.isInteger(expirySeconds)){
            throw `${func}: expirySeconds must be integer.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be function.`;
        }
    validateUserData(newEmailAddress,'dummyDisplayName',function(arrDum){
        var i,len;
        var exists = false;
        for (i=0,len=arrDum.length;i<len;i++){
            if (arrDum[i]=='email_address'){
                exists = true;
            }
        }
        if (!exists){
            checkIdAndPassword(userID,password,function(match){
                if (match){
                    addUnverifiedEmailAddress(userID,newEmailAddress,expirySeconds,function(data){
                        callback(data);
                    });
                } else {
                    callback('');
                }
            });
        } else {
            callback('');
        }
    });
}

/**
 * Check if verifyCode matches the change_email_verify_code for the given
 * userID and that time has not expired.
 * Callback function has one string parameter: "match" if match exists,
 * "nomatch" if row is not found, and "expired" if row is found but the time has
 * expired.
 *
 *@access   Public
 *@param    Number      userID
 *@param    String      verifyCode
 *@param    Function    callback
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If verifyCode is not a string.
 *@throws   Exception               If callback is not a function.
 */

function checkChangeEmailVerifyCode(userID,verifyCode,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof userID != 'number' || !Number.isInteger(userID)){
            throw `${func}: userID must be a integer.`;
        }
        if (typeof verifyCode != 'string'){
            throw `${func}: verifyCode must be a string.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be a function.`;
        }
    var queryDum = `
        SELECT
            ( change_email_limit > UNIX_TIMESTAMP() )   as isNotExpired ,
            change_email_verify_code
        FROM
            users
        WHERE
            user_id = ?
    `;
    var valuesArr = [userID];
    con.query(queryDum,valuesArr,function(err,result){
        if (err) console.log(err);
        if (result.length==0){
            callback('nomatch');
        } else if (result[0]['change_email_verify_code']!=verifyCode){
            callback ('nomatch');
        } else if (result[0]['isNotExpired']==0) {
            callback('expired');
        } else {
            callback('match');
        }
    });
}

/**
 * Copy unverified_email_address to email_address for given userID.
 * Callback function has no parameters.
 *
 *@access   Public
 *@param    Number      userID
 *@param    Function    callback    
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If callback is not a function.
 */

function verifyNewEmail(userID,callback){
    /* Exceptions */
        var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
        if (typeof userID != 'number' || !Number.isInteger(userID)){
            throw `${func}: userID must be integer.`;
        }
        if (typeof callback != 'function'){
            throw `${func}: callback must be function.`;
        }
    var queryDum = `
        UPDATE
            users
        SET
            email_address = unverified_email_address
        WHERE
            user_id = ?
    `;
    var valuesArr = [userID];
    con.query(queryDum,valuesArr,function(err,result){
        if (err) console.log(err);
        callback();
    });
}

/**
 * "Cleans" a value for the GET method, meaning will remove anything that will
 * make it invalid for a url bar.  Intended to be used with randomized values.
 *
 *@access   Private
 *@param    String      inputStr    String to clean.
 *@return   String
 *@throws   Exception               If inputStr is not a string.
 */

function cleanGetValue(inputStr){
    var returnStr = encodeURIComponent(inputStr);
    returnStr = returnStr.replace(/%(.*?){1,3}/g,"a");
    return returnStr;
}

module.exports = {
    validateUserData                    : validateUserData                   ,
    addUser                             : addUser                            ,
    getUserRowFromEmailAddress          : getUserRowFromEmailAddress         ,
    getUserRowFromId                    : getUserRowFromId                   ,
    changeDefaultName                   : changeDefaultName                  ,
    changeTimezone                      : changeTimezone                     ,
    changePassword                      : changePassword                     ,
    changeEmailVerification             : changeEmailVerification            ,
    verifyUser                          : verifyUser                         ,
    checkEmailAndPassword               : checkEmailAndPassword              ,
    checkIdAndPassword                  : checkIdAndPassword                 ,
    resetPasswordResetInfo              : resetPasswordResetInfo             ,
    resetPasswordConfirmCheck           : resetPasswordConfirmCheck          ,
    attemptAddUnverifiedEmailAddress    : attemptAddUnverifiedEmailAddress   ,
    checkChangeEmailVerifyCode          : checkChangeEmailVerifyCode         ,
    verifyNewEmail                      : verifyNewEmail
};
