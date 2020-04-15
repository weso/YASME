"use strict";
var $ = require("jquery"),
  yutils = require("yasgui-utils"),
  imgs = require("./imgs.js");


var checkSyntax = function(yasme) {
    yasme.queryValid = true;
    yasme.clearGutter("gutterErrorBar");

    resetValues(yasme);
    
    var state = null;
    let openTokensCounter = 0;
    let closedTokensCounter = 0;
    for (var l = 0; l < yasme.lineCount(); ++l) {

      var precise = false;
      if (!yasme.prevQueryValid) {
        // we don't want cached information in this case, otherwise the
        // previous error sign might still show up,
        // even though the syntax error might be gone already
        precise = true;
      }
  
      var token = yasme.getTokenAt(
        {
          line: l,
          ch: yasme.getLine(l).length
        },
        precise
      );
  
      
  
      var state = token.state;
  
      if (state.OK == false) {
        if (!yasme.options.syntaxErrorCheck) {
          //the library we use already marks everything as being an error. Overwrite this class attribute.
          $(yasme.getWrapperElement()).find(".sp-error").css("color", "black");
          //we don't want to gutter error, so return
          return;
        }
  
  
        var warningEl = yutils.svg.getElement(imgs.warning);
        if (state.errorMsg) {
          require("./tooltipUtils.js").grammarTootlip(yasme, warningEl, function() {
            return $("<div/>").text(token.state.errorMsg).html();
          });
        } else if (state.possibleCurrent && state.possibleCurrent.length > 0) {
          //				warningEl.style.zIndex = "99999999";
          require("./tooltipUtils.js").grammarTootlip(yasme, warningEl, function() {
            var expectedEncoded = [];
            state.possibleCurrent.forEach(function(expected) {
              expectedEncoded.push(
                "<strong style='text-decoration:underline'>" + $("<div/>").text(expected).html() + "</strong>"
              );
            });
            return "This line is invalid. Expected: " + expectedEncoded.join(", ");
          });
        }
        warningEl.style.marginTop = "2px";
        warningEl.style.marginLeft = "2px";
        warningEl.className = "parseErrorIcon";
        yasme.setGutterMarker(l, "gutterErrorBar", warningEl);
  
        yasme.queryValid = false;
        return false;
      }
    }

  
  
    yasme.prevQueryValid = yasme.queryValid;
    return true;
  };

  var resetValues = function(yasme){
    yasme.defPrefixes = [];
    yasme.usedPrefixes = [];
    yasme.defShapes = [];
    yasme.shapeRefs = [];
  }


  module.exports = {
    checkSyntax:checkSyntax
  };
