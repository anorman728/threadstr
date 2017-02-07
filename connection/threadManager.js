/*
 * Functions to manage individual threads.
 */

/**
 * Create a thread.
 * Callback's only parameter is the thread_id of the created thread.
 *
 *@access   Public
 *@param    Object      attributesJSON      JSON object with thread's attributes.
 *@param    String      password            Password to use.  Can be an empty
 *                                          string if thread is not
 *                                          password-protected.
 *@param    Object      callback            Callback function.  Only one
 *                                          parameter, being the thread_id of
 *                                          the created thread.
 *@throws   Exception                       If password is not a string.
 *@throws   Exception                       If password is nonempty and less
 *                                          than 6 characters.
 *@throws   Exception                       If attributesJSON is not a JSON
 *                                          object.
 *@throws   Exception                       If
 *                                          attributesJSON['passsword_protected']
 *                                          exists and is neither 1 nor 0.
 *@throws   Exception                       If attributesJSON['join_type'] is
 *                                          not length 3.
 *@throws   Exception                       If
 *                                          attributesJSON['requires_email_verification']
 *                                          exists and is neither 0 nor 1.
 */

function createThread(attributesJSON,password,callback){
    // Throw exceptions.
        if (typeof password!='string'){
            throw "Password must be string.  (Empty string if not being used for this thread.)";
        }
        if (password!='' && password.length<6){
            throw "Nonempty passwords must be >=6 characters.";
        }
        if (typeof attributesJSON!='object' || attributesJSON.constructor!={}.constructor){
            throw "attributesJSON must be JSON object.";
        }
        if (!Number.isInteger(attributesJSON['owner_user_id'])){
            throw "user_id must be integer.";
        }
        if (attributesJSON['thread_name'].length=0){
            throw "thread_name must be nonempty string.";
        }
        if (attributesJSON.hasOwnProperty('password_protected') && attributesJSON['password_protected']!=0 && attributesJSON['password_protected']!=1){
            throw "password_protected must be undefined, 0, or 1.  Found "+attributesJSON['password_protected'];
        }
        if (attributesJSON['join_type'].length!=3){
            throw "join_type must be string of length 3.";
        }
        if (attributesJSON.hasOwnProperty('requires_email_verification') && attributesJSON['requires_email_verification']!=0 && attributesJSON['requires_email_verification']!=1){
            throw "requires_email_verification must be undefined, 0, or 1."
        }

    var bcrypt = require('bcrypt-nodejs');
    var salt = bcrypt.genSaltSync();
    if (password!=''){
        var bycrypt = require('bcrypt-nodejs');
        var passwordHash = bcrypt.hashSync(password,salt);// For encryption reasons, it's not technically necessary to salt a second time, but bcrypt requires it.
        var passwordProtected = 1;
    } else {
        var passwordHash = '';
        var passwordProtected = 0;
    }

    var columnNamesArr = [];
    var columnValuesArr = [];
    var questionArr = [];
    for (var columnName in attributesJSON){
        columnNamesArr.push(columnName);
        columnValuesArr.push(attributesJSON[columnName]);
        questionArr.push('?');
    }

    var columnNames = columnNamesArr.join(',');
    var questionMarks = questionArr.join(',');
    var queryDum = `
        INSERT INTO
            threads(
                ${columnNames}      ,
                password_salt       ,
                password_hash       ,
                password_protected  ,
                time_created        ,
                most_recent_view
            )
        VALUES(
            ${questionMarks}    ,
            '${salt}'           ,
            '${passwordHash}'   ,
            ${passwordProtected},
            UNIX_TIMESTAMP()    ,
            UNIX_TIMESTAMP()
        )
    `;

    con.query(queryDum,columnValuesArr,function(err,result){
        if (err) {console.log(err);}
        var queryDum= `
            INSERT INTO
                thread_users(
                    thread_id,
                    user_id
                )
            VALUES(
                ?,
                ?
            )
        `;
        var returnVal = result.insertId;
        var values = [returnVal,attributesJSON['owner_user_id']];
        con.query(queryDum,values,function(err,result){
            if (err) {console.log(err);}
            callback(returnVal);
        });
    });
}

/**
 * Checks if user is in thread (i.e., has permission to post in thread).
 * Callback function has one parameter, which is true or false.
 *
 *@access   Public
 *@param    Number      threadID    thread_id of thread to check.
 *@param    Number      userID      user_id of thread to check.
 *@param    Object      callback    Callback function, with parameter as true or
 *                                  false, corresponding to whether user exists
 *                                  in thread.
 *@throws   Exception               If threadID is not an integer.
 *@throws   Exception               If userID is not an integer.
 */

function isUserInThread(threadID,userID,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (!Number.isInteger(userID)){
            throw "userID must be an integer.";
        }

    var queryDum = `
        SELECT
            thread_id,
            user_id
        FROM
            thread_users
        WHERE
            thread_id = ?   AND
            user_id   = ?
    `;
    var values = [threadID,userID];
    con.query(queryDum,values,function(err,rows){
        if (err) {console.log(err);}
        if (rows.length!=0){
            callback(true);
        } else {
            callback(false);
        }
    });
}

/**
 * Add user to thread (i.e., gives user permission to post in thread).
 * Callback function has one parameter, being the thread_users_id.
 *
 *@access   Public
 *@param    Number      threadID    The thread_id of the thread. 
 *@param    Number      userID      The user_id of the user to add.
 *@param    String      displayName The name to display for the user in this
 *                                  thread.
 *@param    Object      callback    Callback function.  Has one parameter, being
 *                                  the thread_users_id.
 *@throws   Exception               If threadID is not an integer.
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If displayName is not a string.
 */

function addUserToThread(threadID,userID,displayName,callback){
    // Throw exceptions.
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (!Number.isInteger(userID)){
            throw "userID must be an integer.";
        }
        if (typeof displayName!='string'){
            throw "displayName must be string.";
        }
    isUserInThread(threadID,userID,function(tf){
        if (tf){
            throw "User already exists in thread.";
        } else {
            var queryDum = `
                INSERT INTO
                    thread_users(
                        thread_id       ,
                        user_id         ,
                        display_name
                    )
                VALUES(
                    ?,
                    ?,
                    ?
                )
            `;
            var values = [threadID,userID,displayName];
            con.query(queryDum,values,function(err,results){
                if (err) {console.log(err);}
                callback(results.insertId);
            });
        }
    });
}

/**
 * Remove user from thread.
 * Callback function has no parameters.
 *
 *@param    Number      threadID    The thread_id from which to delete the user.
 *@param    Number      userID      The user_id to delete.
 *@param    Object      callback    Callback function, which has no parameters.
 *@throws   Exception               If threadID is not an integer.
 *@throws   Exception               If userID is not an integer.
 */

function deleteUserFromThread(threadID,userID,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (!Number.isInteger(userID)){
            throw "userID must be an integer.";
        }

    var queryDum = `
        DELETE FROM
            thread_users
        WHERE
            thread_id   = ? AND
            user_id     = ?
    `;

    var values = [threadID,userID];

    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        callback();
    });
}

var regex = new RegExp(/[\0\x08\x09\x1a\n\r"'\\\%]/g)
function escaper(char){
    var m = ['\\0', '\\x08', '\\x09', '\\x1a', '\\n', '\\r', "'", '"', "\\", '\\\\', "%"];
    var r = ['\\\\0', '\\\\b', '\\\\t', '\\\\z', '\\\\n', '\\\\r', "''", '""', '\\\\', '\\\\\\\\', '\\%'];
    return r[m.indexOf(char)];
};

/**
 * Edit a thread's property.  Callback function has no parameters.
 *
 *@param    Number              threadID    thread_id of the thread to edit.
 *@param    String              property    Name of property to edit (i.e.,
 *                                          column name).
 *@param    String|Number       newvalue    New value.
 *@param    Object              callback    Callback function.  No parameters.
 *@throws   Exception                       If threadID is not an integer.
 *@throws   Exception                       If property is not a string.
 *@throws   Exception                       If newvalue is neither string nor
 *                                          number.
 */

function editThreadProperty(threadID,property,newvalue,callback){
    // Throw exceptions.
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (typeof property!='string'){
            throw "property must be string.";
        }
        if (typeof newvalue!='string' && typeof newvalue!='number'){
            throw "newvalue must be string or number (0 or 1 for booleans)";
        }
    var cleanProperty = property.replace(regex,escaper);
    var queryDum = `
        UPDATE
            threads
        SET
            ${cleanProperty} = ?
        WHERE
            thread_id = ?
    `;
    var values = [newvalue,threadID];
    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * Update the Unix time of the most recent view of a thread.
 *
 *@access   Public
 *@param    Number      threadID    ID of thread to update.
 *@param    Object      callback    Callback function.  No parameters.
 *@throws   Exception               If threadID is not an integer.
 */

function updateMostRecentView(threadID,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be integer.";
        }
    var queryDum = `
        UPDATE
            threads
        SET
            most_recent_view = UNIX_TIMESTAMP()
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * Updates the number of views of a thread.
 *
 *@access   Public
 *@param    Number      threadID    ID of the thread to update.
 *@param    Object      callback    Callback function.  No parameters.
 *@throws   Exception               If threadID is not an integer.
 */

function updateNumberOfViews(threadID,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
    var queryDum = `
        UPDATE
            threads
        SET
            number_of_views = number_of_views + 1
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * Create a post.
 *
 *@param    Number      threadID    ID of thread in which to create a post.
 *@param    Number      userID      ID of user creating the post.
 *@param    String      content     Content of post.
 *@param    Object      callback    Callback function, with thread_content_id as
 *                                  parameter.
 *@throws   Exception               If threadID is not an integer.
 *@throws   Exception               If userID is not an integer.
 *@throws   Exception               If content is not a string.
 */

function createPost(threadID,userID,content,callback){
    // Todo: Email users that want updates.
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (!Number.isInteger(userID)){
            throw "userID must be an integer.";
        }
        if (typeof content!="string"){
            throw "content must be string.";
        }
    var queryDum = `
        INSERT INTO
            thread_content(
                thread_id   ,
                user_id     ,
                content     ,
                time_posted ,
                edit_time
            )
        VALUES(
            ?,
            ?,
            ?,
            UNIX_TIMESTAMP(),
            UNIX_TIMESTAMP()
        )
    `;
    var values = [threadID,userID,content];
    con.query(queryDum,values,function(err,result){
        if (err) {console.log(err);}
        callback(result.insertId);
    });
}

/**
 * Edit the contents of a post.
 *
 *@access   Public
 *@param    Number      threadContentID ID of post.
 *@param    String      newcontent      New content of post.
 *@param    Object      callback        Callback function.  No parameters.
 *@throws   Exception                   If threadContentID is not an integer.
 *@throws   Exception                   If newContent is not a string.
 */

function editPost(threadContentID,newContent,callback){
    // Throw exceptions
        if (!Number.isInteger(threadContentID)){
            throw "threadContentID must be an integer.";
        }
        if (typeof newContent!='string'){
            throw "newContent must be string.";
        }
    var queryDum = `
        UPDATE
            thread_content
        SET
            content = ?
        WHERE
            thread_content_id = ?
    `;
    var values = [newContent,threadContentID];
    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        callback();
    });
}

/**
 * "Hard delete" means wipe from the server altogether, not just setting
 * is_deleted to 1.
 *
 *@access   Public
 *@param    Number      threadID    ID of thread to delete.
 *@param    Object      callback    Callback function.  No parameters.
 *@throws   Exception               If threadID is not an integer.
 */

function hardDeleteThread(threadID,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be integer.";
        }
    var queryDum = `
        DELETE FROM
            threads
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err){
        if (err) {console.log(err);}
        var queryDum = `
            DELETE FROM
                thread_content
            WHERE
                thread_id = ?
        `;
        con.query(queryDum,values,function(){
            if (err) {console.log(err);}
            var queryDum = `
                DELETE FROM
                    thread_users
                WHERE
                    thread_id = ?
            `;
            con.query(queryDum,values,function(){
                if (err) {console.log(err);}
                callback();
            });
        });
    });
}

/**
 * Changes the password to a password-protected thread.
 *
 *@param    Number      threadID        ID of thread of which we change the
 *                                      password.
 *@param    String      newPassword     New password.
 *@param    Object      callback        Callback function.  No parameters.
 *@throws   Exception                   If threadID is not an integer.
 *@throws   Exception                   If newPassword is not a string or is a
 *                                      nonempty string less than 6 characters.
 */

function changePassword(threadID,newPassword,callback){
    // Throw exceptions
        if (!Number.isInteger(threadID)){
            throw "threadID must be an integer.";
        }
        if (typeof newPassword!='string' || (newPassword.length!=0 && newPassword.length<6)){
            throw "newPassword must be empty string or string >=6 characters.";
        }
    // Need to get salt.
    var queryDum = `
        SELECT 
            password_salt    
        FROM
            threads
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err,rows){
        if (err) {console.log(err);}
        var salt = rows[0]['password_salt'];
        if (newPassword!=''){
            var bcrypt = require('bcrypt-nodejs');
            var passwordHash = bcrypt.hashSync(newPassword,salt);
            var passwordProtected = 1;
        } else {
            var passwordHash = '';
            var passwordProtected = 0;
        }
        queryDum = `
            UPDATE
                threads
            SET
                password_hash = ?,
                password_protected = ${passwordProtected}
        `;
        values = [passwordHash];
        con.query(queryDum,values,function(err){
            if (err) {console.log(err);}
            callback();
        });
    });
}

module.exports = {
    createThread            : createThread           ,
    isUserInThread          : isUserInThread         ,
    addUserToThread         : addUserToThread        ,
    deleteUserFromThread    : deleteUserFromThread   ,
    editThreadProperty      : editThreadProperty     ,
    updateMostRecentView    : updateMostRecentView   ,
    updateNumberOfViews     : updateNumberOfViews    ,
    createPost              : createPost             ,
    editPost                : editPost               ,
    hardDeleteThread        : hardDeleteThread       ,
    changePassword          : changePassword          
};
