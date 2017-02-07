/**
 * Miscellaneous array tools for javascript.
 */

/**
 * Replacement for Arr::includes function, because it's not available in Node.
 * Not exported.
 *
 *@access   Public
 *@param    Object      haystack        Array to check.
 *@param    Variant     needle          Item to look for in array.
 *@throws   Exception                   If haystack is not an array.
 *
 */

function arrayIncludes(haystack,needle){
    // Throw exceptions.
        if (!Array.isArray(haystack)){ throw "haystack must be array"; }
    for (var i=0,len=haystack.length;i<len;i++){
        if (haystack[i]==needle){return true;}
        return false;
    }
}

module.exports = {
    arrayIncludes   : arrayIncludes
}
