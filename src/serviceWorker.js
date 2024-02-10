const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Context menu actions
 */
export const SUMMARIZE_SELECTION = 'summarize-selection';
export const TRANSLATE_SELECTION = 'translate-selection';
export const SUMMARIZE_ARTICLE = 'summarize-article';
export const TRANSLATE_ARTICLE = 'translate-article';

/**
 * Add the extension's context menu items
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: SUMMARIZE_SELECTION,
    title: 'Summarize',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: TRANSLATE_SELECTION,
    title: 'Translate',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: SUMMARIZE_ARTICLE,
    title: 'Summarize Article',
    contexts: ['all']
  })
  chrome.contextMenus.create({
    id: TRANSLATE_ARTICLE,
    title: 'Translate Article',
    contexts: ['all']
  });
});

/**
 * Add event handling for when the exension's context menu actions are clicked
 */
chrome.contextMenus.onClicked.addListener(async (data, tab) => {
  
  if (tab.url.includes('chrome://')) {
    return; //TODO: handle nicely
  }

  chrome.sidePanel.open({tabId: tab.id});
  // Wait a little bit for the message listener to be initialized in the side panel JS (if it was just opened)
  await sleep(500);

  // Send message to the listener initialized in the sidepanel JS
  let msgData;
  switch (data.menuItemId) {
    case SUMMARIZE_SELECTION:
    case TRANSLATE_SELECTION:
      msgData = data.selectionText
      break;
    case SUMMARIZE_ARTICLE:
    case TRANSLATE_ARTICLE:
      msgData = await getArticleFromCurrentTab(tab);
      break;
    default:
      throw new Error(`Unknown menu item ID: ${data.menuItemId}`)
  }
  chrome.runtime.sendMessage({
    name: data.menuItemId,
    data: msgData
  });
});


async function getArticleFromCurrentTab(tab) {
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['./getArticleWithReadability.js'],
  });
  const article = injectionResults[0].result;
  return article
}