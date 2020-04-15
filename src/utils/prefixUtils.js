"use strict";
/**
 * Append prefix declaration to list of prefixes in query window.
 *
 * @param yasme
 * @param prefix
 */
var addPrefixes = function(yasme, prefixes) {
  var existingPrefixes = yasme.getDefinedPrefixes();
  //for backwards compatability, we stil support prefixes value as string (e.g. 'rdf: <http://fbfgfgf>'
  if (typeof prefixes == "string") {
    addPrefixAsString(yasme, prefixes);
  } else {
    for (var pref in prefixes) {
      if (!(pref in existingPrefixes))
        addPrefixAsString(yasme, pref + ": <" + prefixes[pref] + ">");
    }
  }
  yasme.collapsePrefixes(false);
};

var addPrefixAsString = function(yasme, prefixString) {
  yasme.replaceRange("PREFIX " + prefixString + "\n", {
    line: 0,
    ch: 0
  });

  yasme.collapsePrefixes(false);
};
var removePrefixes = function(yasme, prefixes) {
  var escapeRegex = function(string) {
    //taken from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };
  for (var pref in prefixes) {
    yasme.setValue(
      yasme
        .getValue()
        .replace(
          new RegExp(
            "PREFIX\\s*" +
              pref +
              ":\\s*" +
              escapeRegex("<" + prefixes[pref] + ">") +
              "\\s*",
            "ig"
          ),
          ""
        )
    );
  }
  yasme.collapsePrefixes(false);
};

/**
 * Get defined prefixes  as array, in format {"prefix:" "uri"}
 *
 * @param cm
 * @returns {Array}
 */
var getDefinedPrefixes = function(yasme) {
  //Use precise here. We want to be sure we use the most up to date state. If we're
  //not, we might get outdated prefixes from the current query (creating loops such
  //as https://github.com/OpenTriply/YASGUI/issues/84)
 return yasme.getTokenAt(
    { line: yasme.lastLine(), ch: yasme.getLine(yasme.lastLine()).length },
    true
  ).state.prefixes; 

  //return yasme.definedPrefixes;
};

var setDefinedPrefixes = function(yasme,newPrefixes){
  yasme.getTokenAt(
    { line: yasme.lastLine(), ch: yasme.getLine(yasme.lastLine()).length },
    true
  ).state.prefixes = newPrefixes;
}

/**
 * Get the used indentation for a certain line
 *
 * @param yasme
 * @param line
 * @param charNumber
 * @returns
 */
var getIndentFromLine = function(yasme, line, charNumber) {
  if (charNumber == undefined) charNumber = 1;
  var token = yasme.getTokenAt({
    line: line,
    ch: charNumber
  });
  if (token == null || token == undefined || token.type != "ws") {
    return "";
  } else {
    return token.string + getIndentFromLine(yasme, line, token.end + 1);
  }
};



module.exports = {
  addPrefixes: addPrefixes,
  getDefinedPrefixes: getDefinedPrefixes,
  setDefinedPrefixes:setDefinedPrefixes,
  removePrefixes: removePrefixes
};
