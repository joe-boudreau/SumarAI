/**
 * We concatenate this file with mozilla/Readability.js using webpack and 
 * inject the whole thing into the page via executeScript
 */
var documentClone = document.cloneNode(true);
new Readability(documentClone).parse();