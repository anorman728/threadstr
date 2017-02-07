// Common html for all pages.

var gui = require(__dirname+'/gui');
var htmlHeader;
var logo;
var pageHeader;
var systemNotifications;
var mainDiv;

function setHtmlHeader(title,useMathJax,scripts){
    // Throw exceptions
        if (typeof title!='string'){
            throw 'title must be a string.';
        }
        if (typeof useMathJax!='boolean'){
            throw 'useMathJax must be a boolean.';
        }
        if ((typeof scripts!='object' || !Array.isArray(scripts)) && scripts!=false){
            throw 'scripts must be an array of JSON objects or false.';
        }

    if (scripts==false){
        var scripts = [];
    }

    if (useMathJax){
        scripts.push({
            isAsync : true,
            src     : "/MathJax.js"
        });
    }

    var dumArr = ["/jquery-3.1.1.min.js","/commonScript.js"];

    var dumScripts = [];
    for (var i=0,len=dumArr.length;i<len;i++){
         dumScripts.push({
            isAsync : false,
            src     : dumArr[i]
        });
    }

    scripts = dumScripts.concat(scripts);

    var scriptString = '';
    scripts.forEach(function(element){
        scriptString += `<script type="text/javascript" `;
        if (element['isAsync']){
            scriptString += 'async ';
        }
        scriptString += `src="`+element['src']+`"></script>`+"\n\t\t\t";
        // Tabs at end aren't necessary-- Just make the final result easier to see.
    });

    var head=`
        <!DOCTYPE html>
        <head>
            <title>${title}</title>
            <link rel="stylesheet" type="text/css" href="common.css">
            ${scriptString}
        </head>
    `;

    htmlHeader = head;
}

function setLogo(altText){
    // Throw exceptions
        if (typeof altText!='string'){
            throw "altText must be string.";
        }
    var dumVar = `
        <div id="logoDiv">
            <div id="logo"><a href="javascript:void(0)"><img src="logo.png" alt="${altText}"></a></div>
            <div id="title"><a href="javascript:void(0)"><img src="threadstrText.png" alt="${altText}"></a></div>
        </div>
    `;
    logo = dumVar;
}

/**
 * Create the login div.
 *
 *@access   Public
 *@return   String
 */

function loginDiv(){
    var emailAddress    = gui.textInput("Email Address:","emailAddressLogin");
    var password        = gui.textInput("Password:","passwordLogin",true);
    var submit          = gui.buttonInput("Log in","loginSubmit");
    var resetPassword   = gui.buttonInput("Reset password","resetPassword");
    var cancel          = gui.buttonInput("Cancel","cancelSubmit");
    var formItems = [
        emailAddress    ,
        password        ,
        submit          ,
        resetPassword   ,
        cancel
    ];
    var corner = true;
    return gui.createForm("loginDiv",formItems,corner);
}

function setPageHeader(altText){
    // Throw exceptions
        if (typeof altText!='string'){
            throw "altText must be string.";
        }

    setLogo(altText);
    var options         = gui.buttonHtml("options","Options");
    var logout          = gui.buttonHtml("logout","Log out");
    var login           = gui.buttonHtml("login","Log in");
    var createAccount   = gui.buttonHtml("createAccount","Create account");
    var rightPane       = loginDiv() + options + logout + login + createAccount;

    pageHeader = `
    <div id="pageHeader">
        <div id="leftPane" class="headerPane">${logo}</div>
        <div id="rightPane" class="headerPane">${rightPane}</div>
    </div>
    `;
}

function setSystemNotifications(){
    // Todo: Pull html file containing system notifications.  If empty, return empty string.  Otherwise, create div containing it.
    systemNotifications = '';
}

function googleAdSense(){
    var returnVal = `
        <div id="ads">
            <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <!-- threadr -->
            <ins class="adsbygoogle"
                 style="display:inline-block;width:728px;height:90px"
                 data-ad-client="ca-pub-5553058705981854"
                 data-ad-slot="5997762614"></ins>
            <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        </div>
    `;
    return returnVal;
}


function setMainDiv(content){
    mainDiv = `<div id="mainDiv">${content}</div>`;
}


function commonHTML(){
    return htmlHeader + pageHeader + systemNotifications + googleAdSense() + mainDiv;
}

module.exports = {
    setHtmlHeader          :setHtmlHeader          ,
    setPageHeader          :setPageHeader          ,
    setSystemNotifications :setSystemNotifications ,
    setMainDiv             :setMainDiv             ,
    commonHTML             : commonHTML
};
