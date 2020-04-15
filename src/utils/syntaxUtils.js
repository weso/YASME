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

      let lineTokens = yasme.getLineTokens(l);
      for(let t in lineTokens){
        let token = lineTokens[t];
        //This is only necessary to verify the if the last '}' is missing  (See #104)
        if(token.string=='{'){
          openTokensCounter++;
        }
        if(token.string=='}'){
          closedTokensCounter++;
        }
      }
    
      updateShapesAndPrefixes(yasme,l);
    }

    //Is last '}' missing?  (See #104)
    if(openTokensCounter != closedTokensCounter){
      setError(yasme.lastLine(),"This line is invalid. Expected: '}'",yasme)
      yasme.queryValid = false;
      return false;
    }

    
    
    if(!checkPrefixes(yasme))return false;
    if(!checkShapes(yasme))return false;
  
    yasme.prevQueryValid = yasme.queryValid;
    return true;
  };

  var resetValues = function(yasme){
    yasme.defPrefixes = [];
    yasme.usedPrefixes = [];
    yasme.defShapes = [];
    yasme.shapeRefs = [];
  }


  var updateShapesAndPrefixes = function(yasme,l) {
    let lineTokens = yasme.getLineTokens(l);
    //Get all the defined prefixes and all the used prefixes
    //Get all the defined shapes and all the used shapes
    for(let t in lineTokens){
      let token = lineTokens[t];
  

      if(token.type=='string-2' || 
        token.type=='constraint'){
        yasme.usedPrefixes.push({
            alias:token.string.split(":")[0]+':',
            line:l });
      }

      if(token.type=='valueSet'){
        if(token.string.includes(":") && !token.string.startsWith("<")){
            yasme.usedPrefixes.push({
                alias:token.string.split(":")[0]+':',
                line:l });
        }  
      }


      if(token.type=='prefixDelcAlias'){
        yasme.defPrefixes.push(token.string);
      }

      if(token.type=='shape'){
        yasme.defShapes.push(token.string);
        if(!token.string.startsWith("<") && !token.string.startsWith("_:")){
          yasme.usedPrefixes.push({
            alias:token.string.split(":")[0]+':',
            line:l });
        }  

      }

      if(token.type=='shapeRef'){
        yasme.shapeRefs.push({
            ref:token.string.slice(1,token.string.length),
            line:l });
      }

      //Necesary when the ShapeRef is "@:"
      if(token.string=='@'){
        yasme.shapeRefs.push({
            ref:'@:',
            line:l });
      }
    
    }

  }

  

/**
  * Check if the ShapeRefs are defined
 */
  var checkShapes = function(yasme){
    let defShapes = yasme.defShapes;
    let shapeRefs = yasme.shapeRefs;
    for(let r in shapeRefs){
      let err=true;
      for(let s in defShapes){
        if(defShapes[s]==shapeRefs[r].ref)err=false;
      }
      if(err){
        setError(shapeRefs[r].line,"Shape '" + shapeRefs[r].ref + "' is not defined",yasme);
        yasme.queryValid = false;
        return false;
      } 
    }
    return true;
  }

/**
  * Check if the Prefixes are defined
 */
  var checkPrefixes = function(yasme){
    let defPrefixes = yasme.defPrefixes;
    let usedPrefixes = yasme.usedPrefixes;
    for(let p in usedPrefixes){
      let err=true;
      for(let d in defPrefixes){
        if(defPrefixes[d]==usedPrefixes[p].alias)err=false;
      }
      if(err){
        setError(usedPrefixes[p].line,"Prefix '" + usedPrefixes[p].alias + "' is not defined",yasme);
        yasme.queryValid = false;
        return false;
      } 
    }
    return true;
  }

  var setError= function(line,errMsg,yasme) {
     var warningEl = yutils.svg.getElement(imgs.warning);
      require("./tooltipUtils.js").grammarTootlip(yasme, warningEl, function() {
        return errMsg;
      });   
      warningEl.style.marginTop = "2px";
      warningEl.style.marginLeft = "2px";
      warningEl.className = "parseErrorIcon";
      yasme.setGutterMarker(line, "gutterErrorBar", warningEl);
  }

  module.exports = {
    checkSyntax:checkSyntax
  };
