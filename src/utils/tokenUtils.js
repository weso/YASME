"use strict";
/**
 * @param yasme {doc}
 * @return token {object}
 * @method YASME.getCompleteToken
 */
var getCompleteToken = function(yasme) {

  let cur = yasme.getCursor();
  let token = yasme.getTokenAt(cur);
  
  return token;

};
var getPreviousNonWsToken = function(yasme, line, token) {
  var previousToken = yasme.getTokenAt({
    line: line,
    ch: token.start
  });
  if (previousToken != null && previousToken.type == "ws") {
    previousToken = getPreviousNonWsToken(yasme, line, previousToken);
  }
  return previousToken;
};
var getNextNonWsToken = function(yasme, lineNumber, charNumber) {
  if (charNumber == undefined) charNumber = 1;
  var token = yasme.getTokenAt({
    line: lineNumber,
    ch: charNumber
  });
  if (token == null || token == undefined || token.end < charNumber) {
    return null;
  }
  if (token.type == "ws") {
    return getNextNonWsToken(yasme, lineNumber, token.end + 1);
  }
  return token;
};

module.exports = {
  getPreviousNonWsToken: getPreviousNonWsToken,
  getCompleteToken: getCompleteToken,
  getNextNonWsToken: getNextNonWsToken
};
