/** 
 * Convert string to html equivalent.  Similar to htmlentities in php.
 * Yanked from: 
 *  https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
 * 
 *
 *@access   Public
 *@param    String      inputStr
 *@return   String
 */
 
function htmlEntities(inputStr) {
//  var encodedStr = replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
//     return '&#'+i.charCodeAt(0)+';';
//  });
//  $('#output').html(encodedStr.replace(/&/gim, '&amp;'));

//  var returnStr = inputStr;
//  var matchDum = returnStr.match(/[\u00A0-\u9999<>\&]/gim)
//  var replacement;
//  while (matchDum){
//      replacement = matchDum.charCodeAt(0);
//      returnStr.replace(matchDum,`&#${replacement};`);
//      matchDum = returnStr.match(/[\u00A0-\u9999<>\&]/gim)
//  }
//  return returnStr;
    var entities = require('html-entities').XmlEntities;
    return entities.encode(inputStr);
}

module.exports = {
    htmlEntities    : htmlEntities
}

console.log(htmlEntities("<i>test</i>"));
