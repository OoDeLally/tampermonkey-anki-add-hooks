// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Google Translate
// @version      0.1
// @description  Generate a hook for AnkiConnect on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//
// ==/UserScript==

(function () {
  'use strict';

  

  function __$styleInject ( css ) {
      if(!css) return ;

      if(typeof(window) == 'undefined') return ;
      let style = document.createElement('style');

      style.innerHTML = css;
      document.head.appendChild(style);
      return css;
  }

  __$styleInject(".-anki-quick-adder-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-added .-anki-quick-adder-hook-star-small {\n  color: green;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-quick-adder-hook-text {\n\n}\n");

  // @name         Anki Add Hooks for Google Translate
  // @version      0.1
  // @description  Generate a hook for AnkiConnect on Google Translate
  // @author       Pascal Heitz
  // @include      /translate\.google\.com\//


  const getSourceLangage = () => {
    return document.querySelector('.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];
  };

  const getTargetLangage = () => {
    return document.querySelector('.tl-sugg .jfk-button-checked').innerText;
  };

  const hookName = 'translate.google.com';


  const extractFrontText = () => {
    // source language could be written as "ENGLISH - DETECTED" and we only want "ENGLISH"
    const sourceLanguage = getSourceLangage();
    const sourceSentence = document.querySelector('textarea#source').value;
    return `${sourceLanguage}\n${sourceSentence}`;
  };

  const extractBackText = () => {
    const targetLanguage = getTargetLangage();
    const translatedSentence = document.querySelector('.translation').innerText;
    return `${targetLanguage}\n${translatedSentence}`;
  };

  const extractDirection = () => {
    return `${getSourceLangage()} -> ${getTargetLangage()}`;
  };



  const run = ()=> {
    setInterval(() => {
      const parentNode = document.querySelector('.result-footer');
      if (!parentNode) {
        return // Container not found
      }
      const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
      if (existingHook) {
        return // Hook already exists
      }
      const children = Array.from(parentNode.childNodes);
      const firstFloatLeftNode = children.find(node => node.style.float == 'left');
      const hook = createHook();
      hook.style.float = 'right';
      hook.style.top = '15px';
      hook.style.right = '10px';
      parentNode.insertBefore(hook, firstFloatLeftNode);
    }, 500);
  };

  const ankiRequestOnFail = async (response, message, directionCode) => {
    console.error('Anki request response:', response);
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(directionCode), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(directionCode), null);
    }
    alert(`AnkiConnect returned an error:\n${message}`);
  };

  const getDeckNameMapKey = directionCode => `deckName_${directionCode.toLowerCase()}`;
  const getModelNameMapKey = directionCode => `modelName_${directionCode.toLowerCase()}`;

  const ankiRequestOnSuccess = (hookNode) => {
    hookNode.classList.add('-anki-quick-adder-hook-added');
    hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';
    hookNode.onclick = () => {};
  };

  const hookOnClick = async (hookNode, frontText, backText, directionCode) => {
    const deckNameMapKey = getDeckNameMapKey(directionCode);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = prompt(`Enter the name of the deck you want to add '${directionCode}' cards from this website`, 'Default');
      if (!deckName) {
        return // Cancel
      }
      GM.setValue(deckNameMapKey, deckName);
    }
    const modelNameMapKey = getModelNameMapKey(directionCode);
    let modelName = await GM.getValue(modelNameMapKey);
    if (!modelName) {
      modelName = prompt(`Enter the name of the card model you want to create for '${directionCode}'`, 'Basic (and reversed card)');
      if (!modelName) {
        return // Cancel
      }
      await GM.setValue(modelNameMapKey, modelName);
    }
    // console.log('hookOnClick')
    const dataStr = JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: deckName,
          modelName: modelName,
          fields: {
            Front: frontText,
            Back: backText,
          },
          tags: [hookName],
        }
      }
    });
    return GM.xmlHttpRequest({
      method: 'POST',
      url: 'http://localhost:8765',
      data: dataStr,
      onabort: response => {
        ankiRequestOnFail(response, 'Request was aborted', directionCode);
      },
      onerror: response => {
        ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', directionCode);
      },
      onload: response => {
        const result = JSON.parse(response.responseText);
        if (result.error) {
          ankiRequestOnFail(response, result.error);
          return
        }
        ankiRequestOnSuccess(hookNode);
      }
    })
  };


  const createHook$1 = (userdata) => {
    if (!extractFrontText || typeof extractFrontText != 'function') {
      throw Error('Missing function extractFrontText()');
    }
    if (!extractBackText || typeof extractBackText != 'function') {
      throw Error('Missing function extractBackText()');
    }
    const starNodeBig = document.createElement('div');
    starNodeBig.innerText = '★';
    starNodeBig.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-big';
    const starNodeSmall = document.createElement('div');
    starNodeSmall.innerText = '★';
    starNodeSmall.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-small';
    const textNode = document.createElement('span');
    textNode.className = '-anki-quick-adder-hook-text';
    textNode.innerText = 'Add';
    const hookNode = document.createElement('div');
    hookNode.setAttribute('name', hookName);
    hookNode.className = '-anki-quick-adder-hook';
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.onclick = (event) => {
      const frontText = extractFrontText(userdata);
      if (typeof frontText != 'string') {
        console.error('Found', frontText);
        throw Error('Provided siteSpecificFunctions.extractFrontText() fonction did not return a string');
      }
      const backText = extractBackText(userdata);
      if (typeof frontText != 'string') {
        console.error('Found', backText);
        throw Error('Provided siteSpecificFunctions.extractBackText() fonction did not return a string');
      }
      const directionCode = extractDirection(userdata);
      if (typeof frontText != 'string') {
        console.error('Found', directionCode);
        throw Error('Provided siteSpecificFunctions.extractDirection() fonction did not return a string');
      }
      hookOnClick(hookNode, frontText, backText, directionCode);
      event.preventDefault();
      event.stopPropagation();
    };
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    return hookNode;
  };


  (function() {
    run(createHook$1);
  })();

}());
