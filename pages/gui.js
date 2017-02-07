/**
   Misc. GUI functions.
   TODO: Create better documentation on how to use it.
*/

/**
 * Creates an HTML button.
 *
 *@access   Public
 *@param    String|Number   id          The ID of the html element.
 *@param    String|Number   content     What the button will say.
 *@param    String          url         Optional.  The url that the button will
 *                                      point to.  Defaults to
 *                                      "javascript:void(0)".  Not recommended
 *                                      to use, to keep view and model separate.
 *@throws   Exception                   If id is neither a string nor a number.
 *@throws   Exception                   If content is neither a string nor a
 *                                      number.
 */

function buttonHtml(id,content,url){
    // Throw exceptions.
        if (typeof id !='string' && typeof id!='number'){
            throw "buttonHtml: id must be string or number.";
        }
        if (typeof content!='string' && typeof content!='number'){
            throw "buttonHTML: content must be string or number.";
        }
    if (typeof url=='undefined') {url='javascript:void(0)';}
    return `<a href="${url}" class="buttonLink"><div id=${id} class="button"><div class="buttonText">${content}</div></div></a>`;
}

/**
 * Functions for creating forms.
 * Public functions are in the form xInput and also the createForm function.
 * The xInput functions create objects that need to be put into an array to put
 * into createForm.  See createForm for more details.
 * The createXInputDiv are intermediate functions used by createForm.
 * To create new input types, will need to do these three things:
 *      Create an xInput function (and export it).
 *      Create a createXInputDiv function.
 *      Modify the createForm function to accept the createXInputDiv function.
 */

    /**
     * Create JSON object for "Input" functions.
     * The "objClass" is just a label for a class of objects.
     *
     *@access   Private
     *@return   Object
     */

    function createInputObj(){
        return {
            objClass    : 'Input'   ,
            type        : null      ,
            label       : null      ,
            id          : null      ,
            options     : null      ,
            defaultVal  : ''        ,
            password    : false     ,
            placeHolder : ''
        };
    }

    /**
     * Creates a JSON object of a text input to insert into createForm function.
     *
     *@access   Public
     *@param    String      labelInput          Label of text input.
     *@param    String      idInput             CSS id.
     *@param    String      placeHolderInput    Optional.  Placeholder value.
     *@param    String      defaultValInput     Optional.  Default value of textbox.
     *@return   Object
     *@throws   Exception                       If labelInput or idInput is not a
     *                                          string.
     *@throws   Exception                       If either defaultVal or placeHolder
     *                                          is both defined and not a string.
     */

    function textInput(labelInput,idInput,password,placeHolderInput,defaultValInput){
        // Exceptions
            if (typeof labelInput!='string' || typeof idInput!='string'){
                throw "textInput: labelInput and idInput must both be strings.  Received "+(typeof labelInput) + " and " + (typeof idInput) + ".";
            }
            if ((typeof defaultValInput!='string' && typeof defaultValInput!='undefined') || (typeof placeHolderInput!='string' && typeof placeHolderInput!='undefined')){
                throw "textInput: placeHolderInput and defaultValInput must be strings or undefined.  Received " + (typeof placeHolderInput) + " and " + (typeof defaultValInput) + ".";
            }
            if (typeof password!='boolean' && typeof password!='undefined'){
                throw "textInput: Optional parameter password must be boolean.";
            }

        // Create JSON object.
            var returnObj = createInputObj();

        // Set placeHolderInput, defaultValInput, and password if defined.
            if (typeof placeHolder!='undefined'){
                returnObj['placeHolder'] = placeHolder;
            }
            if (typeof defaultValInput=='undefined'){
                returnObj['defaultValInput'] = defaultValInput;
            }
            if (password===true) returnObj['password'] = true;

        returnObj['type']      = "text"        ;
        returnObj['label']     = labelInput    ;
        returnObj['id']        = idInput       ;

        return returnObj;
    }

    /**
     * Creates a JSON object of a droplist input to insert into createForm function.
     *
     *@access   Public
     *@param    string  labelInput              Label of droplist.
     *@param    string  idInput                 CSS id.
     *@param    object  options                 Options for the droplist.
     *@param    string  defaultValInput         Optional.  Default value.
     *@return   object
     *@throws   Exception                       If label or id is not a string.
     *@throws   Exception                       If options is not an array.
     *@throws   Exception                       If any items in options are not
     *                                          strings.
     *@throws   Exception                       If defaultValInput is both defined
     *                                          and not a string.
     */

    function droplistInput(labelInput,idInput,options,defaultValInput){
        // Exceptions
            if (typeof labelInput!='string' || typeof idInput!='string'){
                throw "droplistInput: labelInput and idInput must both be strings.  Received " + (typeof labelInput) + " and " + (typeof idInput) + ".";
            }
            if (typeof options!='object' || options.constructor.name!='Array'){
                if (typeof options!='object'){
                    throw "droplistInput: options must be array.  Received " + (typeof options) + ".";
                } else {
                    throw "droplistInput: options must be array.  Received " + options.constructor.name + ".";
                }
            }
            var i,len;
            for (i=0,len=options.length;i<len;i++){
                if (typeof options[i]!='string'){
                    throw "Items in options must be strings. Found "+(typeof options[i])+" in item "+i+".";
                }
            }

            if (typeof defaultValInput!='string' && typeof defaultValInput!='undefined'){
                throw "droplistInput: defaultValInput must be either string or undefined.  Received " + (typeof defaultValInput) + ".";
            }

        // Create input object.
            var inputObj = createInputObj;
            
        // Set defaultValInput if defined.
            if (typeof defaultValInput!='undefined'){
                inputObj['defaultVal'] = defaultValInput;
            }

        inputObj['type']        = "droplist"     ;
        inputObj['label']       = labelInput     ;
        inputObj['id']          = idInput        ;
        inputObj['defaultVal']  = defaultValInput;
        inputObj['options']     = options;

        return inputObj;
    }

    /**
     * Creates a JSON object of a timezone droplist input to insert into createForm
     * function.
     *
     *@access   Public
     *@param    String      labelInput  Label for droplist.
     *@param    String      idInput     CSS id of droplist.
     *@param    String      defaultVal  Optional.  Default value for droplist.
     *@throws   Exception               If id is not a string.
     *@throws   Exception               If defaultVal is defined and not a
     *                                  string.
     *@return   object
     */

    function timezoneInput(labelInput,idInput,defaultVal){
        if (typeof idInput!='string') throw "timezoneInput: idInput must be string. Received "+(typeof idInput)+".";
        var returnObj = createInputObj();
        if (typeof defaultVal!='undefined' && typeof defaultVal!='string'){
            throw "timezoneInput: defaultVal must be string or undefined.";
        }
        if (typeof defaultVal=='undefined') defaultVal = '15';
        returnObj['id']         = idInput           ;
        returnObj['label']      = labelInput        ;
        returnObj['type']       = "timezoneDroplist";
        returnObj['defaultVal'] = defaultVal;
        return returnObj;
    }

    /**
     * Creates a JSON object of a button to insert into createForm function.
     *
     *@access   Public
     *@param    String      labelInput      Label for button.
     *@param    String      idInput         CSS id of button.
     *@throws   Exception                   If labelInput or idInput are not
     *                                      strings.
     *@return   Object
     */

    function buttonInput(labelInput,idInput){
        if (typeof labelInput!='string' || typeof idInput!='string'){
            throw "buttonInput: labelInput and idInput must be string.  Received "+(typeof labelInput)+" and "+(typeof idInput)+".";
        }
        var returnObj          = createInputObj()  ;
        returnObj['id']        = idInput           ;
        returnObj['label']     = labelInput        ;
        returnObj['type']      = "button"          ;
        return returnObj;
    }


    /**
     * Creates a JSON object of a textvalue to put into the form.
     * Naming is different since it's not an actual input object.
     *
     *@access   Public
     *@param    String      textValue   Actual text to display.
     *@param    String      idValue     CSS id.
     *@throws   Exception               If textValue or idValue are not strings.
     *@return   Object
     */

    function textItem(textValue,idValue){
        // Exceptions
            if (typeof textValue!='string' || typeof idValue!='string'){
                throw "textItem: textValue and idValue must be strings.";
            }
        var returnObj = createInputObj();
        returnObj['type']   = 'textItem';
        returnObj['label']  = textValue ;
        returnObj['id']     = idValue   ;

        return returnObj;
    }

    /**
     * Creates a JSON object of an invisible element.
     *
     *@access   Public
     *@param    String      idInput     CSS id.
     *@param    String      valueInput  Value.
     *@return   Object
     *@throws   Exception               If idInput is not a string.
     *@throws   Exception               If valueInput is not a string.
     */

    function invisibleInput(idInput,valueInput){
        // Exceptions
            var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (typeof idInput!='string'){
                throw `${func}: idInput must be string.`;
            }
            if (typeof valueInput!='string'){
                throw `${func}: valueInput must be string.`;
            }
        var returnObj           = createInputObj();
        returnObj['type']       = 'invisible';
        returnObj['id']         = idInput;
        returnObj['defaultVal'] = valueInput;
        return returnObj;
    }

    /**
     * Create HTML for a form from array of JSON objects (created by the "Input"
     * functions).
     * Technically, does not create an actual "form" object, because this is using
     * AJAX to submit, so it's not necessary.
     *
     *@access   Public
     *@param    object      inputItemArray      Array of input JSON objects.
     *@param    string      idInput             Id of form div.
     *@return   string
     *@throws   Exception                       If idInput is not a string.
     *@throws   Exception                       If inputItemArray is not an array.
     *@throws   Exception                       If any of the items in the array are
     *                                          not an input object.
     *@throws   Exception                       If any input object isn't complete.
     */

    function createForm(idInput,inputItemArray,corner){
        // Exceptions (one is later)
            if (typeof idInput!='string'){
                throw "createForm: idInput must be string.  Found " + (typeof idInput) + ".";
            }
            if (typeof inputItemArray!='object' || !(inputItemArray instanceof Array)){
                if (typeof inputItemArray!='object'){
                    throw "createForm: inputItemArray must be an array. Received " + (typeof inputItemArray) + ".";
                } else {
                    throw "createForm: inputItemArray must be an array.  Received " + (inputItemArray.constructor.name) + ".";
                }
            }
            if (typeof corner!='boolean' && typeof corner!='undefined'){
                throw "createForm: corner must be boolean or undefined.";
            }
        if (typeof corner=='undefined') corner=false;
        var i,len;
        var type;
        var htmlOutput = `<div class="form" id="${idInput}">`;
        for (i=0,len=inputItemArray.length;i<len;i++){
            // Exception
                if (typeof inputItemArray[i] !='object' || typeof inputItemArray[i]['objClass']!='string' || inputItemArray[i]['objClass']!='Input'){
                    throw `createForm: Item ${i} is not an Input object.`;
                }
            type = inputItemArray[i]['type'];
            var createSpace = true;
            switch(type){
                case "text":
                    htmlOutput += createTextInputDiv(inputItemArray[i]);
                    break;
                case 'droplist':
                    htmlOutput += createDroplistInputDiv(inputItemArray[i]);
                    break;
                case 'timezoneDroplist':
                    htmlOutput += createTimezoneDroplistInputDiv(inputItemArray[i]);
                    break;
                case 'button':
                    htmlOutput += createButtonInputDiv(inputItemArray[i]);
                    break;
                case 'textItem':
                    htmlOutput += createTextItemDiv(inputItemArray[i]);
                    createSpace = false;
                    break;
                case 'invisible':
                    htmlOutput += createInvisibleInputDiv(inputItemArray[i]);
                    createSpace = false;
                    break;
                default:
                    throw `Unknown input type: ${type}.`;
            }
            // Create divs underneath (for messages).
                if (createSpace){
                    var idDum = inputItemArray[i]['id'];
                    htmlOutput += `
                        <div class="formSpace">
                            <div class="formSidePadding"><p>&nbsp;</p></div>
                            <div class="formLabel"><p>&nbsp;</p></div>
                            <div class="formValue" id="${idDum}Message">&nbsp;</div>
                            <div class="formSidePadding"><p>&nbsp;</p></div>
                        </div>
                    `;
                }
            
        }

        htmlOutput+="</div>";
        var formContainer = (corner) ? "formContainerCorner" : "formContainer";
        htmlOutput = `<div class="${formContainer}">${htmlOutput}</div>`;
        return htmlOutput;
    }

    /**
     * Create html for text input divs.
     *
     *@access   Private
     *@param    object      textInputObj    Input object, text type.
     *@return   string
     *@throws   Exception                   If textInputObj is not an Input object.
     *@throws   Exception                   If textInputObj is not of text type.
     */

    function createTextInputDiv(textInputObj){
        // Exceptions
            if (typeof textInputObj!='object' || textInputObj['objClass']!='Input'){
                throw "createTextInputDiv: textInputObj must be an Input object.";
            }
            if (textInputObj['type']!="text"){
                throw "createTextInputDiv: textInputObj must be of type \"text\".";
            }
        
        var label          = textInputObj['label']                             ;
        var id             = textInputObj['id']                                ;
        var defaultVal     = textInputObj['defaultVal']                        ;
        var placeHolder    = textInputObj['placeHolder']                       ;
        var passwordType   = textInputObj['password'] ? "password" : "text" ;

        var returnVal = `
            <div id="${id}" class="formItem textFormItem">
                <div class="formSidePadding"></div>
                <div class="formLabel">
                    <p id="${id}Label">${label}</p>
                </div>
                <div class="formValue textFormValue">
                    <input id="${id}Value" type="${passwordType}" value="${defaultVal}" placeholder="${placeHolder}">
                </div>
                <div class="formSidePadding"></div>
            </div>
        `;
        return returnVal;
    }

    /**
     * Create html for droplist input divs.
     *
     *@access   Public
     *@param    object      droplistInputObj    Input object, droplist type.
     *@throws   Exception                       If droplistInputObj is not an Input
     *                                          object.
     *@throws   Exception                       If droplistInputObj is not of
     *                                          droplist type.
     *@return   string
     */

    function createDroplistInputDiv(droplistInputObj){
        // Exceptions
            if (typeof droplistInputObj!='object' || droplistInputObj['objClass']!='Input'){
                throw "createDroplistInputDiv: droplistInputObj must be an Input object.";
            }
            if (droplistInputObj['type']!="droplist"){
                throw "createDroplistInputDiv: droplistInputObj must be of type \"droplist\".";
            }

        var label          = droplistInputObj['label']         ;
        var id             = droplistInputObj['id']            ;
        var defaultVal     = droplistInputObj['defaultVal']    ;
        var options        = droplistInputObj['options']       ;

        var returnVal = `
            <div id="${id}" class="formItem droplistFormItem">
                <div class="formSidePadding"></div>
                <div class="formLabel"><p id="${id}Label">${label}</p></div>
                <div class="formValue droplistFormValue"><select id="${id}Value">
        `;
        var i,len;
        var value;
        for (i=0,len=options.length;i<len;i++){
            value = options[i];
            if (value==defaultVal){
                returnVal += `
                    <option selected="selected">${value}</option>
                `;
            } else {
                returnVal += `
                    <option>${value}</option>
                `;
            }
        }
        returnVal += `
                </select></div>
                <div class="formSidePadding"></div>
            </div>
        `;
        return returnVal;
    }

    /**
     * Create html for timezone droplist input divs.
     * Yanked from this site: http://www.freeformatter.com/time-zone-list-html-select.html
     *
     *@access   Private
     *@param    object      timezoneDroplistInputObj    Input object, timezoneDroplist.
     *@throws   Exception                               If timezoneDroplistInputObj
     *                                                  is not an Input object.
     *@throws   Exception                               If timezoneDroplistInputObj
     *                                                  is not of a timezoneDroplist
     *                                                  type.
     *@return   string
     */

    function createTimezoneDroplistInputDiv(timezoneDroplistInputObj){
        // Exceptions
            if (typeof timezoneDroplistInputObj!='object' || timezoneDroplistInputObj['objClass']!="Input"){
                throw "createTimezoneDroplistInputDiv: timezoneDroplistInputObj must be an Input object.";
            }
            if (timezoneDroplistInputObj['type']!='timezoneDroplist'){
                throw "createTimezoneDroplistInputDiv: timezoneDroplistInputObj must be of type \"timezoneDroplist\".";
            }
        var label = timezoneDroplistInputObj['label'];
        var defaultVal = timezoneDroplistInputObj['defaultVal'];
        var id = timezoneDroplistInputObj['id'];
        // Create timezone droplist.
            var timezones = require(__dirname+'/../jsTools/timezone.json');
            var options = "";
            var timezoneName;
            for (var timezone in timezones){
                timezoneName = timezones[timezone]['name'];
                selected = (timezone==defaultVal) ? 'selected' : '';
                options+=`<option value="${timezone}" ${selected}>${timezoneName}</option>
                `;
            }
        return `
            <div id = "${id}" class="formItem timezoneDroplistFormItem">
                <div class="formSidePadding"></div>
                <div class="formLabel"><p id="${id}Label">${label}</p></div>
                <div class="formValue droplistFormValue timezoneDroplistFormValue">
                    <select id="${id}Value">
                        ${options}
                    </select>
                </div>
                <div class="formSidePadding"></div>
            </div>`;
    }

    /**
     * Create button for form.
     *
     *@access   Private
     *@param    Object      buttonInputObj  Input object, button type.
     *@return   String
     *@throws   Exception                   If buttonInputObj is not an Input
     *                                      object.
     *@throws   Exception                   If buttonInputObj is not of button type.
     */

    function createButtonInputDiv(buttonInputObj){
        // Exceptions
            if (typeof buttonInputObj!='object' || buttonInputObj['objClass']!='Input'){
                throw "createButtonInputDiv: createButtonInputDiv must be an Input object.";
            }
            if (buttonInputObj['type']!='button'){
                throw "createButtonInputDiv: createButtonInputDiv must be of type \"button\".";
            }

        var id         = buttonInputObj['id']   ;
        var label      = buttonInputObj['label'];
        var button     = buttonHtml(`${id}Label`,label)   ;
        var returnStr = `
            <div id="${id}" class="formItem buttonFormItem">
                <div class="formSidePadding"></div>
                <div class="formLabel"></div>
                <div class="formValue buttonFormValue">${button}</div>
                <div class="formSidePadding"></div>
            </div>
        `;
        return returnStr;
    }

    /**
     * Create text item for form.
     *
     *@access   Private
     *@param    Object      textItemObj         Input object, textItem type.
     *@return   String
     *@throws   Exception                       If textItemObject is not an
     *                                          Input object.
     *@throws   Exception                       If textItemObject is not a
     *                                          textItem type.
     */

    function createTextItemDiv(textItemObj){
        // Exceptions
            if (typeof textItemObj!='object' || textItemObj['objClass']!='Input'){
                throw "createTextItemDiv: textItemObj must be an input object.";
            }
            if (textItemObj['type']!='textItem'){
                throw "createTextItemDiv: textItemObj must be of type \"textItem\".";
            }
        var id      = textItemObj['id'];
        var label   = textItemObj['label'];
        var returnStr = `
            <div id="${id}" class="formItem textFormItem">
                <div class="formSidePadding"></div>
                <div class="formFull">${label}</div>
                <div class="formSidePadding"></div>
            </div>
        `;
        return returnStr;
    }

    /**
     * Create invisible input for form.
     *
     *@access   Private
     *@param    Object      invisibleInputObj   Input object, invisible type.
     *@return   String
     *@throws   Exception                       If invisibleInputObj is not an
     *                                          Input object.
     *@throws   Exception                       If invisibleInputObj is not an
     *                                          invisible type.
     */

    function createInvisibleInputDiv(invisibleInputObj){
        // Exceptions
            var func = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (typeof invisibleInputObj!='object' || invisibleInputObj['objClass']!='Input'){
                throw `${func}: invisibleInputObj must be an input object.`;
            }
            if (invisibleInputObj['type']!='invisible'){
                throw `${func}: invisibleInputObj must be of type "invisible".`;
            }
        var id = invisibleInputObj['id'];
        var value = invisibleInputObj['defaultVal'];
        var returnStr = `
            <div id="${id}" style="display:none;">
                <input id="${id}Value" value="${value}">
            </div>
        `;
        return returnStr;
    }

module.exports= {
    buttonHtml      : buttonHtml    ,
    textInput       : textInput     ,
    droplistInput   : droplistInput ,
    timezoneInput   : timezoneInput ,
    buttonInput     : buttonInput   ,
    textItem        : textItem      ,
    createForm      : createForm    ,
    invisibleInput  : invisibleInput
};
