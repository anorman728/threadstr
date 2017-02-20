DROP DATABASE IF EXISTS threadstr;
CREATE DATABASE threadstr;
    
USE threadstr;

CREATE TABLE
    threads (
        thread_id                   
            INT             
            UNSIGNED 
            NOT NULL 
            AUTO_INCREMENT    
            COMMENT "UID of thread."
        ,
        owner_user_id               
            INT             
            UNSIGNED 
            NOT NULL                   
            COMMENT "ID of user that has administrative privileges."
        ,
        thread_name                 
            VARCHAR(255)    
            NOT NULL                            
            COMMENT "Publically displayed name for thread."
        ,
        password_protected          
            TINYINT         
            NOT NULL                            
            DEFAULT 0
            COMMENT "Boolean.  1 if thread requires password to view."
        ,
        password_hash               
            VARCHAR(255)                                        
            DEFAULT ''
            COMMENT "Hash of the thread's password."
        ,
        password_salt
            VARCHAR(255)
            COMMENT "Salt for password"
        ,
        join_type                   
            VARCHAR(3)
            COMMENT "Public (PUB), by email (EMA), or by invitation (INV)."
        ,
        requires_email_verification 
            TINYINT                                             
            DEFAULT 0
            COMMENT "Boolean.  1 if need email-verified account to join."
        ,
        description                 
            TEXT
            COMMENT "Description of thread."
        ,
        most_recent_view
            BIGINT
            UNSIGNED
            COMMENT "Unix timestamp when most recently viewed."
        ,
        number_of_views
            INT
            UNSIGNED
            DEFAULT 0
            COMMENT "Number of times thread has been viewed."
        ,
        time_created
            BIGINT
            UNSIGNED
            COMMENT "Unix time of when thread was created."
        ,
        mathjax_enabled
            TINYINT
            DEFAULT 0
            COMMENT "Boolean.  1 if MathJax is enabled, 0 if not."
        ,
        deleted
            TINYINT(1)
            COMMENT "Determines whether or not a thread is deleted."
        ,
        PRIMARY KEY(thread_id)
    ) COMMENT "All threads.";

CREATE TABLE
    users(
        user_id                 
            INT             
            UNSIGNED 
            NOT NULL 
            AUTO_INCREMENT    
            COMMENT "UID of user."
        ,
        default_display_name    
            VARCHAR(30)    
            NOT NULL                            
            COMMENT "Name that will display by default for all threads."
        ,
        email_address           
            VARCHAR(255)    
            NOT NULL                            
            COMMENT "Email address of user."
        ,
        password_salt
            CHAR(76)
            NOT NULL
            COMMENT "Salt for password hash."
        ,
        password_hash           
            VARCHAR(255)    
            NOT NULL                            
            COMMENT "Hash of user's password."
        ,
        verify_code
            CHAR(76)
            NOT NULL
            COMMENT "Get value to verify account."
        ,
        timezone                
            VARCHAR(255)
            COMMENT "Timezone in which to display posts."
        ,
        time_joined
            BIGINT
            UNSIGNED
            COMMENT "Unix time that user joined."
        ,
        email_verified
            TINYINT(1)
            NOT NULL
            DEFAULT 0
            COMMENT "True if email address has been
            verified."
        ,
        reset_password_confirm
            CHAR(76)
            COMMENT "Regenerated whenever user requests password reset by email."
        ,
        reset_password_limit
            BIGINT
            UNSIGNED
            COMMENT "Unix time of when reset password expires."
        ,
        PRIMARY KEY(user_id),
        UNIQUE INDEX default_display_name (default_display_name),
        UNIQUE INDEX email_address (email_address)
    ) COMMENT "All users across all threads.";

CREATE TABLE
    thread_users (
        thread_users_id                 
            INT             
            UNSIGNED 
            NOT NULL 
            AUTO_INCREMENT  
            COMMENT "Key for this table."
        ,
        thread_id                       
            INT             
            UNSIGNED 
            NOT NULL                 
            COMMENT "ID of thread."
        ,
        user_id                         
            INT             
            UNSIGNED 
            NOT NULL                 
            COMMENT "ID of users in thread."
        ,
        display_name                        
            VARCHAR(255)                                      
            COMMENT "Particular thread's display name for this user."
        ,
        -- Commented out for now-- future version.
        -- next_time_allowed_to_post       
        --     BIGINT                                               
        --     COMMENT "Debates-- Enforced minimum time allowed before next post."
        -- ,
        -- time_when_response_has_expired  
        --     BIGINT                                               
        --     COMMENT "Debates-- Enforced maximum time before posting disallowed."
        -- ,
        -- freeze                          
        --     TINYINT         
        --     NOT NULL                          
        --     COMMENT "Debates-- Boolean.  Can't post while waiting for response."
        -- ,
        PRIMARY KEY(thread_users_id),
        UNIQUE KEY idx_thread_user (thread_id,user_id)
    ) COMMENT "Users involved in a particular thread.";

CREATE TABLE
    thread_content(
        thread_content_id   
            INT     
            UNSIGNED 
            NOT NULL 
            AUTO_INCREMENT    
            COMMENT "UID for this table."
        ,
        thread_id           
            INT     
            UNSIGNED 
            NOT NULL                   
            COMMENT "ID of thread."
        ,
        user_id             
            INT     
            UNSIGNED 
            NOT NULL                   
            COMMENT "ID of user that made post."
        ,
        time_posted         
            BIGINT     
            UNSIGNED 
            NOT NULL                   
            COMMENT "Unix timestamp of the time that was posted."
        ,
        content             
            TEXT
            NOT NULL                            
            COMMENT "Content of post (in markdown)."
        ,
        edit_time
            BIGINT
            UNSIGNED
            NOT NULL
            COMMENT "Unix timestamp of the last time that post was edited."
        ,
        PRIMARY KEY(thread_content_id)
    ) COMMENT "All posts associated with a particular thread.";

-- Commented out for now-- Going to add this later.
-- CREATE TABLE
--     thread_header_info(
--         datum_id    
--             INT         
--             UNSIGNED 
--             NOT NULL 
--             AUTO_INCREMENT
--             COMMENT "UID of this table."
--         ,
--         datum_label 
--             VARCHAR(20) 
--             NOT NULL                        
--             COMMENT "Publically displayed label of datum."
--         ,
--         datum_value 
--             VARCHAR(20)                                 
--             COMMENT "Value of datum."
--         ,
--         thread_id   
--             INT         
--             UNSIGNED 
--             NOT NULL               
--             COMMENT "Thread that the datum is associated with."
--         ,
--         PRIMARY KEY(datum_id)
--     ) COMMENT "Thread information to show at the top of the page.";
-- 
-- CREATE TABLE
--     thread_header_info_users(
--         table_key      
--             INT 
--             UNSIGNED 
--             NOT NULL 
--             AUTO_INCREMENT 
--             COMMENT "UID of this table."
--         ,
--         thread_id      
--             INT 
--             UNSIGNED 
--             NOT NULL                
--             COMMENT "ID of thread associated with this row."
--         ,
--         thread_user_id 
--             INT 
--             UNSIGNED 
--             NOT NULL                
--             COMMENT "Users that are allowed to change the data in the header."
--         ,
--         PRIMARY KEY(table_key)
--     ) COMMENT "Which users are able to modify thread header.";
