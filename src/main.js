'use strict';
// make sure any console statements
window.console = window.console || {
  log: function() {},
};


/**
 * Load libraries and utils
 */
const $ = require('jquery');
const codeMirror = require('codemirror');
const utils = require('./utils/baseUtils.js');
const yutils = require('yasgui-utils');
const prefixUtils = require('./utils/prefixUtils.js');
const tokenUtils = require('./utils/tokenUtils.js');
const syntaxUtils = require('./utils/syntaxUtils.js');
const tooltipUtils = require('./utils/tooltipUtils.js');
const formatUtils = require('./utils/formatUtils.js');
const buttonsUtils = require('./utils/buttonsUtils.js');
const prefixFold = require('./utils/prefixFold.js');
const autocompletersBase = require('./autocompleters/autocompleterBase.js');
const Clipboard = require('clipboard');

require('../lib/deparam.js');
require('codemirror/addon/fold/foldcode.js');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/xml-fold.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/edit/matchbrackets.js');
require('codemirror/addon/runmode/runmode.js');
require('codemirror/addon/display/fullscreen.js');
require('../lib/grammar/tokenizer.js');

/**
 * Main YASME constructor.
 * Pass a DOM element as argument to append the editor to,
 * and (optionally) pass along config settings
 * (see the YASME.defaults object below,
 * as well as the regular codeMirror documentation,
 * for more information on configurability)
 *
 * @constructor
 * @param {DOM-Element} parent element to append editor to.
 * @param {object} config
 * @class YASME
 * @return {doc} YASME document
 */
const root = (module.exports = function(parent, config) {
  const rootEl = $('<div>', {
    class: 'yasme',
  }).appendTo($(parent));
  config = extendConfig(config);
  const yasme = extendCmInstance(codeMirror(rootEl[0], config));
  postProcessCmElement(yasme);
  return yasme;
});


/**
 * Extend config object, which we will pass on to the CM constructor later on.
 * Need this, to make sure our own 'onBlur' etc events do not get overwritten by
 * people who add their own onblur events to the config Additionally, need this
 * to include the CM defaults ourselves. codeMirror has a method for including
 * defaults, but we can't rely on that one: it assumes flat config object, where
 * we have nested objects (e.g. the persistency option)
 *
 * @private
 * @param {object} config
 * @return {object} YASME config
 */
const extendConfig = function(config) {
  const extendedConfig = $.extend(true, {}, root.defaults, config);
  // I know, codemirror deals with  default options as well.
  // However, it does not do this recursively (i.e. the persistency option)

  return extendedConfig;
};
/**
 * Add extra functions to the CM document (i.e. the codemirror instantiated
 * object)
 *
 * @private
 * @param {object} yasme
 * @return {doc} YASME document
 */
const extendCmInstance = function(yasme) {
  // instantiate autocompleters
  yasme.autocompleters = autocompletersBase(root, yasme);
  if (yasme.options.autocompleters) {
    yasme.options.autocompleters.forEach(function(name) {
      if (root.Autocompleters[name]) {
        yasme.autocompleters.init(name, root.Autocompleters[name]);
      }
    });
  }


  /**
   * Returns the entire token by the cursor
   * @return {object} token
  */
  yasme.getCompleteToken = function() {
    return tokenUtils.getCompleteToken(yasme);
  };

  /**
   * Returns the previous token that is not a WS token
   * @param {onject} line
   * @param {onject} token
   * @return {object} token
  */
  yasme.getPreviousNonWsToken = function(line, token) {
    return tokenUtils.getPreviousNonWsToken(yasme, line, token);
  };

  /**
   * Returns the next token that is not a WS token
   * @param {onject} lineNumber
   * @param {onject} charNumber
   * @return {object} token
  */
  yasme.getNextNonWsToken = function(lineNumber, charNumber) {
    return tokenUtils.getNextNonWsToken(yasme, lineNumber, charNumber);
  };

  /**
   * Colapse all prefixes of the ShEx documment
   * @param {boolean} collapse
  */
  yasme.collapsePrefixes = function(collapse) {
    if (collapse === undefined) collapse = true;
    yasme.foldCode(
      prefixFold.findFirstPrefixLine(yasme),
      root.fold.prefix,
      collapse ? "fold" : "unfold"
    );
  };

 /**
  * Returns true if yasme has syntax errors. False otherwise
  * @param {object} yasme
  * @return {boolean} 
  */
  yasme.hasErrors = function() {
    return !syntaxUtils.checkSyntax(yasme);
  }
  

  /**
   * Fetch defined prefixes
   * @method doc.getDefinedPrefixes
   * @return {object} prefixes
   */
  yasme.getDefinedPrefixes = function() {
    return prefixUtils.getDefinedPrefixes(yasme);
  };

  /**
   * Add prefixes to the ShEx documment
   * @param {string|list} prefixes String if you want to add just one
   * List in other case
   */
  yasme.addPrefixes = function(prefixes) {
    prefixUtils.addPrefixes(yasme, prefixes);
  };

  /**
   * Remove prefixes from the ShEx documment
   * @param {list} prefixes
   */
  yasme.removePrefixes = function(prefixes) {
    prefixUtils.removePrefixes(yasme, prefixes);
  };


  /**
   * Allows to enable or disable Systax error checker
   * @param {boolean} isEnabled
   */
  yasme.setCheckSyntaxErrors = function(isEnabled) {
    yasme.options.syntaxErrorCheck = isEnabled;
    checkSyntax(yasme);
  };

  /**
   * Enables the autocompleter that you pass by param
   * @param {string} name The name of the autocompleter
   */
  yasme.enableCompleter = function(name) {
    addCompleterToSettings(yasme.options, name);
    if (root.Autocompleters[name]) {
      yasme.autocompleters.init(name, root.Autocompleters[name]);
    }
  };

  /**
   * Disables the autocompleter that you pass by param
   * @param {string} name The name of the autocompleter
   */
  yasme.disableCompleter = function(name) {
    removeCompleterFromSettings(yasme.options, name);
  };
  return yasme;
};

/**
 * Creates autocompleters list in the settigns if it does not exit
 * Add the autocompleter that you pass by param to the atucompleters settigns.
 * @param {object} settings YASME settings
 * @param {string} name Autocompleter name
 */
const addCompleterToSettings = function(settings, name) {
  if (!settings.autocompleters) settings.autocompleters = [];
  settings.autocompleters.push(name);
};

/**
 * Remove the autocompleter that you pass by param from the
 * autocompleters settigns.
 * @param {object} settings YASME settings
 * @param {string} name Autocompleter name
 */
const removeCompleterFromSettings = function(settings, name) {
  if (typeof settings.autocompleters == 'object') {
    const index = $.inArray(name, settings.autocompleters);
    if (index >= 0) {
      settings.autocompleters.splice(index, 1);
      // just in case. suppose 1 completer is listed twice
      removeCompleterFromSettings(settings, name);
    }
  }
};

/**
 * Add extra funcionalitys to YASME
 * @param {object} yasme
 */
const postProcessCmElement = function(yasme) {
  buttonsUtils.drawButtons(yasme);
  setFontSize(yasme);
  // Trigger of the button with id='copy'
  // Copies the contents of the editor in the clipboard
  new Clipboard('#copyBtn', {
    text: function(trigger) {
      return yasme.getValue();
    },
  });


  /**
   * Set doc value if option storeShape is activated
   */
  const storageId = utils.getPersistencyId(yasme, yasme.options.persistent);
  if (storageId) {
    const valueFromStorage = yutils.storage.get(storageId);
    if (valueFromStorage) yasme.setValue(valueFromStorage);
  }


  // --- Event handlers ----

  /**
   * Fires whenever the editor is unfocused.
   * In this case, YASME stores it content
   */
  yasme.on('blur', function(yasme) {
    root.storeContent(yasme);
  });

  /**
   * Fires every time the content of the editor is changed.
   * In this case, YASME checks the sintax
   */
  yasme.on('change', function(yasme) {
    checkSyntax(yasme);
  });

  //Needed
  //Without this, there is a bug 
  yasme.on('changes', function(yasme) {
    checkSyntax(yasme);
  });

  /**
   * Fires when the editor is scrolled.
   * In this case, YASME removes Wikidata Tooltip
   */
  yasme.on('scroll', function() {
    tooltipUtils.removeWikiToolTip();
  });


  /**
   * Wikidata Tooltip Listener
   */
  root.on( yasme.getWrapperElement(), 'mouseover',
      tooltipUtils.debounce(function( e ) {
        if(yasme.options.showTooltip){
          tooltipUtils.removeWikiToolTip();
          tooltipUtils.triggerTooltip(yasme, e);
        }
      }, 300)
  );


  // on first load, check as well
  // (our stored or default query might be incorrect)
  checkSyntax(yasme);
  yasme.collapsePrefixes(yasme.options.collapsePrefixesOnLoad);


};


/**
 * Set font size of the editor
 * @param {object} yasme
 */
const setFontSize = function(yasme){
  $('.CodeMirror').css('font-size',yasme.options.fontSize)
}


/**
 * Stores YASME content
 * @param {object} yasme
 */
root.storeContent = function(yasme) {
  const storageId = utils.getPersistencyId(yasme, yasme.options.persistent);
  if (storageId) {
    yutils.storage.set(storageId, yasme.getValue(),
        'month', yasme.options.onQuotaExceeded);
  }
};

/**
 * Checks YASME content syntax
 * @param {object} yasme
 * @return {string} Check result
 */
const checkSyntax = function(yasme) {
  return syntaxUtils.checkSyntax(yasme);
};


// ---- Static Utils -----

// first take all codeMirror references and store them in the YASME object
$.extend(root, codeMirror);

// add registrar for autocompleters
root.Autocompleters = {};
root.registerAutocompleter = function(name, constructor) {
  root.Autocompleters[name] = constructor;
  addCompleterToSettings(root.defaults, name);
};

root.autoComplete = function(yasme) {
  // this function gets called when pressing the keyboard shortcut.
  // I.e., autoShow = false
  yasme.autocompleters.autoComplete(false);
};

// include the autocompleters we provide out-of-the-box
root.registerAutocompleter('wikibase',
    require('./autocompleters/wikibase.js'));

root.registerAutocompleter('prefixDefinition',
    require('./autocompleters/prefixDefinition.js'));

root.registerAutocompleter('prefixesAndKeywords',
    require('./autocompleters/prefixesAndKeywords.js'));


/**
 * Initialize YASME from an existing text area (see http://codemirror.net/doc/manual.html#fromTextArea for more info)
  *
 * @method YASME.fromTextArea
 * @param {DOM-element} textAreaEl
 * @param {object} config
 * @return {doc} YASME document
 */
root.fromTextArea = function(textAreaEl, config) {
  config = extendConfig(config);
  // add yasme div as parent (needed for styles to be manageable and scoped).
  // In this case, I -also- put it as parent el of the text area.
  // This is wrapped in a div now

  $('<div>', {
    class: 'yasme',
  }).insertBefore($(textAreaEl))
      .append($(textAreaEl));


  const yasme = extendCmInstance(codeMirror.fromTextArea(textAreaEl, config));
  postProcessCmElement(yasme);

  return yasme;
};


// ---- Format utils -----

/**
 * Comment or uncomment current/selected line(s)
 * @param {object} yasme
 */
root.commentLines = function(yasme) {
  formatUtils.commentLines(yasme);
};

/**
 * Copy line up
 * @param {object} yasme
 */
root.copyLineUp = function(yasme) {
  formatUtils.copyLineUp(yasme);
};

/**
 * Copy line down
 * @param {object} yasme
 */
root.copyLineDown = function(yasme) {
  formatUtils.copyLineDown(yasme);
};

/**
 * Auto-format/indent selected lines
 * @param {object} yasme
 */
root.doAutoFormat = function(yasme) {
  formatUtils.doAutoFormat(yasme);
};


require('./config/defaults.js');
root.$ = $;
root.version = {
  'codeMirror': codeMirror.version,
  'YASME': require('../package.json').version,
  'jquery': $.fn.jquery,
  'yasgui-utils': yutils.version,
};
