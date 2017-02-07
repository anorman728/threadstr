/**
 * Unit tests for threadManager.js.
 */

var testData = {
    'threadName'    : "Thread name test 01"    ,
    'threadUserID'  : 100                      ,
    'joinType'      : 'PUB'                    ,
    'postText'      : 'This is a post'
};

var secondUserID = "150";

var changeData = {
    'threadName'        : "Thread name test 02"     ,
    'threadUserID'      : 200                       ,
    'userDisplayName'   : "New user"                ,
    'joinType'          : 'INV'                     ,
    'password'          : 'test password'           ,
    'postText'          : 'This is an edited post'
};


var threadID;
var postID;

var getPW = require(__dirname+'/getPasswords');

getPW.getDatabasePassword(function(password){
    // Set password for database.
        dbPassword = password;
    // Create connection
        var connection = require(__dirname+'/connection');
        con = connection.con;
        console.log('');

    var threadFunctions = require(__dirname+'/threadManager');

    main(threadFunctions);
});

function main(threadFunctions){
    clearData(threadFunctions);
}

function displayThreadsTable(threadFunctions,callback){
    var queryDum = `
        SELECT *
        FROM
            threads
        WHERE
            thread_name = ? OR
            thread_name = ?
    `;
    var values = [testData['threadName'],changeData['threadName']];
    con.query(queryDum,values,function(err,rows){
        if (err) {console.log(err);}
        console.log(rows);
        callback();
    });
}

function displayThreadUsersTable(threadFunctions,callback){
    var queryDum = `
        SELECT *
        FROM
            thread_users
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err,rows){
        if (err) {console.log(err);}
        console.log(rows);
        callback();
    });
}

function displayThreadContentTable(threadFunctions,callback){
    var queryDum = `
        SELECT *
        FROM
            thread_content
        WHERE
            thread_id = ?
    `;
    var values = [threadID];
    con.query(queryDum,values,function(err,rows){
        if (err) {console.log(err);}
        console.log(rows);
        callback();
    });
}

function clearData(threadFunctions){
    var queryDum = `
        SELECT
            thread_id
        FROM
            threads
        WHERE
            thread_name = ? OR
            thread_name = ?
    `;
    var values = [testData['threadName'],changeData['threadName']];
    console.log(values);//dmz1
    con.query(queryDum,values,function(err,rows){
        if (rows.length!=0){
            var queryDum = `
                DELETE FROM
                    threads
                WHERE
                    thread_id = ?
            `;
            var values = [rows[0]['thread_id']];
            con.query(queryDum,values,function(err){
                if (err) {console.log(err);}
                queryDum = `
                    DELETE FROM
                        thread_users
                    WHERE
                        thread_id = ?
                `;
                con.query(queryDum,values,function(err){
                    if (err) {console.log(err);}
                    testCreateThread(threadFunctions);
                });
            });
        } else {
            testCreateThread(threadFunctions);
        }
    });
}

function testCreateThread(threadFunctions){
    var attributesJSON = {
        'thread_name'   : testData['threadName'],
        'owner_user_id' : testData['threadUserID'],
        'join_type'     : testData['joinType']
    };
    threadFunctions.createThread(attributesJSON,'',function(dumThreadID){
        threadID = dumThreadID;
        console.log("\nThis should be the thread_id:"+threadID);
        console.log("\n\"Thread name test 01\" should be created:");
        displayThreadsTable(threadFunctions,function(){
            displayThreadUsersTable(threadFunctions,function(){
                threadFunctions.hardDeleteThread(threadID,function(){
                    testCreateThreadWithPassword(threadFunctions);
                });
            });
        });
    });
}

function testCreateThreadWithPassword(threadFunctions){
    var attributesJSON = {
        'thread_name'   : testData['threadName'],
        'owner_user_id' : testData['threadUserID'],
        'join_type'     : testData['joinType']
    };
    threadFunctions.createThread(attributesJSON,'password',function(retThreadID){
        threadID = retThreadID;
        console.log("\nShould display a thread with a nonempty password field:");
        displayThreadsTable(threadFunctions,function(){
            testAddUserToThread(threadFunctions);
        });
    });
}

function testAddUserToThread(threadFunctions){
    threadFunctions.addUserToThread(threadID,changeData['threadUserID'],changeData['userDisplayName'],function(){
        console.log("\nAdd user 200 to thread, with display name \"New User\".");
        displayThreadUsersTable(threadFunctions,function(){
            testDeleteUserFromThread(threadFunctions);
        });
    });
}

function testDeleteUserFromThread(threadFunctions){
    threadFunctions.deleteUserFromThread(threadID,changeData['threadUserID'],function(){
        console.log("\nDelete user from thread.");
        displayThreadUsersTable(threadFunctions,function(){
            testEditOwner(threadFunctions);
        });
    });
}

function testEditOwner(threadFunctions){
    threadFunctions.editThreadProperty(threadID,'owner_user_id',changeData['threadUserID'],function(){
        console.log("\nowner_user_id should be changed.");
        displayThreadsTable(threadFunctions,function(){
            testEditThreadName(threadFunctions);
        });
    });
}

function testEditThreadName(threadFunctions){
    threadFunctions.editThreadProperty(threadID,'thread_name',changeData['threadName'],function(){
        console.log("\nthread_name should be changed.");
        displayThreadsTable(threadFunctions,function(){
            testEditPasswordProtected(threadFunctions);
        });
    });
}

function testEditPasswordProtected(threadFunctions){
    threadFunctions.editThreadProperty(threadID,'password_protected',0,function(){
        console.log("\npassword_protected should be changed.");
        displayThreadsTable(threadFunctions,function(){
            // Skipping requires_email_verification and description, because it's the same function.
            testChangePassword(threadFunctions);
        });
    });
}

function testChangePassword(threadFunctions){
    threadFunctions.changePassword(threadID,changeData['password'],function(){
        console.log("\npassword_hash should be changed, but not the salt.");
        displayThreadsTable(threadFunctions,function(){
            testUpdateMostRecentView(threadFunctions);
        });
    });
}

function testUpdateMostRecentView(threadFunctions){
    threadFunctions.updateMostRecentView(threadID,function(){
        console.log("\nmost_recent_view should be updated to current unix time.");
        displayThreadsTable(threadFunctions,function(){
            testUpdateNumberOfViews(threadFunctions);
        });
    });
}

function testUpdateNumberOfViews(threadFunctions){
    threadFunctions.updateNumberOfViews(threadID,function(){
        console.log("\nnumber_of_views should be increased by one.");
        displayThreadsTable(threadFunctions,function(){
            testCreatePost(threadFunctions);
        });
    });
}

function testCreatePost(threadFunctions){
    threadFunctions.createPost(threadID,changeData['threadUserID'],testData['postText'],function(dumPostID){
        postID = dumPostID;
        console.log("\nA post should be created.");
        displayThreadContentTable(threadFunctions,function(){
            testEditPost(threadFunctions);
        });
    });
}

function testEditPost(threadFunctions){
    threadFunctions.editPost(postID,changeData['postText'],function(){
        console.log("\nPost content should be changed.");
        displayThreadContentTable(threadFunctions,function(){
            endCon();
        });
    });
}

function endCon(){
    con.end();
}
