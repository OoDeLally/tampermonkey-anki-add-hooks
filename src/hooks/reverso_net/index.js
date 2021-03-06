// @name         Anki Add Hooks for Reverso
// @version      2.5
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/(\w+\/)?\w+-\w+\/.+/

import runOnCollinsDictionary from './run_on_collins_dictionary';
import runOnMainDictionary from './run_on_main_dictionary';
import runOnCollaborativeDictionary from './run_on_collaborative_dictionary';
import runOnDictionaryContextualDictionary from './run_on_dictionary_contextual_dictionary';
import runOnContextReverso from './run_on_context_reverso';
import { querySelectorAll } from '../../helpers/scraping';


export const hookName = 'reverso.net';


// There are weird "&nbsp;" spans with a white border-bottom, that make it
// ugly when we put a background. So we set them to transparent instead.
const hideNbspSpans = () => {
  querySelectorAll(document, '.nbsp1', { throwOnUnfound: false }).forEach((span) => {
    span.style.setProperty('border-color', 'transparent', 'important');
  });
};


export const run = (createHook) => {
  hideNbspSpans();
  runOnContextReverso(createHook);
  runOnCollinsDictionary(createHook);
  runOnMainDictionary(createHook);
  runOnCollaborativeDictionary(createHook);
  runOnDictionaryContextualDictionary(createHook);
};
