/**
 * The default options of YASME (check the CodeMirror documentation for even
 * more options, such as disabling line numbers, or changing keyboard shortcut
 * keys). Either change the default options by setting YASME.defaults, or by
 * passing your own options as second argument to the YASME constructor
 */
var $ = require("jquery"), YASME = require("../main.js"), CodeMirror = require('codemirror');

YASME.defaults = $.extend(true, {}, YASME.defaults, {
  mode: "shex",

  /**
	 *  Default shape 
	 */
  value:  "PREFIX :       <http://example.org/>\n"+
          "PREFIX schema: <http://schema.org/>\n"+
          "PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>\n\n"+
    
          ":User IRI {\n"+ 
          "  schema:name          xsd:string  ;\n"+
          "  schema:birthDate     xsd:date?  ;\n"+
          "  schema:gender        [ schema:Male schema:Female ] OR xsd:string ;\n"+
          "  schema:knows         IRI @:User* \n"+
          "}",

  highlightSelectionMatches: {
    showToken: /\w/
  },
  theme:"wiki",
  tabMode: "indent",
  fontSize: 14, 
  lineNumbers: true,
  lineWrapping: true,
  foldGutter: {
    rangeFinder: new YASME.fold.combine(YASME.fold.brace, YASME.fold.prefix)
  },
  collapsePrefixesOnLoad: false,
  gutters: ["gutterErrorBar", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  matchBrackets: true,
  fixedGutter: true,
  syntaxErrorCheck: true,
  showTooltip: true,
  showUploadButton: true,
  showDownloadButton: true,
  showCopyButton: true,
  showDeleteButton: true,
  showThemeButton: true,
  showFullScreenButton: true,
  onQuotaExceeded: function(e) {
    //fail silently
    console.warn("Could not store in localstorage. Skipping..", e);
  },
  /**
	 * Extra shortcut keys. Check the CodeMirror manual on how to add your own
	 *
	 * @property extraKeys
	 * @type object
	 */
  extraKeys: {
    "Ctrl-Space": YASME.autoComplete,
    "Cmd-Space": YASME.autoComplete,
    "Ctrl-D": YASME.deleteLine,
    "Cmd-K": YASME.deleteLine,
    "Ctrl-/": YASME.commentLines,
    "Cmd-/": YASME.commentLines,
    "Ctrl-Down": YASME.copyLineDown,
    "Ctrl-Up": YASME.copyLineUp,
    "Cmd-Down": YASME.copyLineDown,
    "Cmd-Up": YASME.copyLineUp,
    "Shift-Ctrl-F": YASME.doAutoFormat,
    "Shift-Cmd-F": YASME.doAutoFormat,
    "Ctrl-S": YASME.storeContent,
    "Cmd-S": YASME.storeConten,
    "Ctrl-Enter": YASME.executeQuery,
    "Cmd-Enter": YASME.executeQuery,
    F11: function(yasme) {
      yasme.setOption("fullScreen", !yasme.getOption("fullScreen"));
      if(yasme.getOption("fullScreen")){
        CodeMirror.signal(yasme,'expandScreen');
      }else{
        CodeMirror.signal(yasme,'collapseScreen');
      }
    },
    Esc: function(yasme) {
      if (yasme.getOption("fullScreen")){
        yasme.setOption("fullScreen", false);
        CodeMirror.signal(yasme,'collapseScreen');
      } 
    }
  },
  cursorHeight: 0.9,

  
  /**
	 * Change persistency settings for the YASME value. Setting the values
	 * to null, will disable persistancy: nothing is stored between browser
	 * sessions Setting the values to a string (or a function which returns a
	 * string), will store the ShEx doc in localstorage using the specified string.
	 * By default, the ID is dynamically generated using the closest dom ID, to avoid collissions when using multiple YASME items on one
	 * page
	 *
	 * @type function|string
	 */
  persistent: function(yasme) {
    return "yashe_" + $(yasme.getWrapperElement()).closest("[id]").attr("id") + "_queryVal";
  },

});
