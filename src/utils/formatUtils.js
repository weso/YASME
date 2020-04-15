var CodeMirror = require("codemirror")
const $ = require('jquery')

"use strict";
var commentLines = function(yasme) {
    var startLine = yasme.getCursor(true).line;
    var endLine = yasme.getCursor(false).line;
    var min = Math.min(startLine, endLine);
    var max = Math.max(startLine, endLine);
  
    // if all lines start with #, remove this char. Otherwise add this char
    var linesAreCommented = true;
    for (var i = min; i <= max; i++) {
      var line = yasme.getLine(i);
      if (line.length == 0 || line.substring(0, 1) != "#") {
        linesAreCommented = false;
        break;
      }
    }
    for (var i = min; i <= max; i++) {
      if (linesAreCommented) {
        // lines are commented, so remove comments
        yasme.replaceRange(
          "",
          {
            line: i,
            ch: 0
          },
          {
            line: i,
            ch: 1
          }
        );
      } else {
        // Not all lines are commented, so add comments
        yasme.replaceRange("#", {
          line: i,
          ch: 0
        });
      }
    }
  };

var copyLineUp = function(yasme) {
    var cursor = yasme.getCursor();
    var lineCount = yasme.lineCount();
    // First create new empty line at end of text
    yasme.replaceRange("\n", {
      line: lineCount - 1,
      ch: yasme.getLine(lineCount - 1).length
    });
    // Copy all lines to their next line
    for (var i = lineCount; i > cursor.line; i--) {
      var line = yasme.getLine(i - 1);
      yasme.replaceRange(
        line,
        {
          line: i,
          ch: 0
        },
        {
          line: i,
          ch: yasme.getLine(i).length
        }
      );
    }
  };

var copyLineDown = function(yasme) {
    copyLineUp(yasme);
    // Make sure cursor goes one down (we are copying downwards)
    var cursor = yasme.getCursor();
    cursor.line++;
    yasme.setCursor(cursor);
  };

  var doAutoFormat = function(yasme) {
    if (!yasme.somethingSelected()) yasme.execCommand("selectAll");
    var to = {
      line: yasme.getCursor(false).line,
      ch: yasme.getSelection().length
    };
    autoFormatRange(yasme, yasme.getCursor(true), to);
  };
  
  var autoFormatRange = function(yasme, from, to) {
    var absStart = yasme.indexFromPos(from);
    var absEnd = yasme.indexFromPos(to);
    // Insert additional line breaks where necessary according to the
    // mode's syntax
    var res = autoFormatLineBreaks(yasme.getValue(), absStart, absEnd);
  
    // Replace and auto-indent the range
    yasme.operation(function() {
      yasme.replaceRange(res, from, to);
      var startLine = yasme.posFromIndex(absStart).line;
      var endLine = yasme.posFromIndex(absStart + res.length).line;
      for (var i = startLine; i <= endLine; i++) {
        yasme.indentLine(i, "smart");
      }
    });
  };
  
  var autoFormatLineBreaks = function(text, start, end) {
    text = text.substring(start, end);
    var breakAfterArray = [
      ["keyword", "ws", "prefixed", "ws", "uri"], // i.e. prefix declaration
      ["keyword", "ws", "uri"] // i.e. base
    ];
    var breakAfterCharacters = ["{", ".", ";"];
    var breakBeforeCharacters = ["}"];
    var getBreakType = function(stringVal, type) {
      for (var i = 0; i < breakAfterArray.length; i++) {
        if (stackTrace.valueOf().toString() == breakAfterArray[i].valueOf().toString()) {
          return 1;
        }
      }
      for (var i = 0; i < breakAfterCharacters.length; i++) {
        if (stringVal == breakAfterCharacters[i]) {
          return 1;
        }
      }
      for (var i = 0; i < breakBeforeCharacters.length; i++) {
        // don't want to issue 'breakbefore' AND 'breakafter', so check
        // current line
        if ($.trim(currentLine) != "" && stringVal == breakBeforeCharacters[i]) {
          return -1;
        }
      }
      return 0;
    };
    var formattedQuery = "";
    var currentLine = "";
    var stackTrace = [];
    CodeMirror.runMode(text, "shex", function(stringVal, type) {
      stackTrace.push(type);
      var breakType = getBreakType(stringVal, type);
      if (breakType != 0) {
        if (breakType == 1) {
          formattedQuery += stringVal + "\n";
          currentLine = "";
        } else {
          // (-1)
          formattedQuery += "\n" + stringVal;
          currentLine = stringVal;
        }
        stackTrace = [];
      } else {
        currentLine += stringVal;
        formattedQuery += stringVal;
      }
      if (stackTrace.length == 1 && stackTrace[0] == "sp-ws") stackTrace = [];
    });
    return $.trim(formattedQuery.replace(/\n\s*\n/g, "\n"));
  };


  module.exports = {
    commentLines:commentLines,
    copyLineUp: copyLineUp,
    copyLineDown: copyLineDown,
    doAutoFormat:doAutoFormat
  };
  