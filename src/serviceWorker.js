const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Context menu actions
 */
export const SUMMARIZE_ARTICLE = 'summarize-article';
export const SUMMARIZE_SHORT = 'summarize-short';
export const SUMMARIZE_MEDIUM = 'summarize-medium';
export const SUMMARIZE_LONG = 'summarize-long';

/**
 * Add the extension's context menu items
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: SUMMARIZE_ARTICLE,
    title: 'Summarize Article',
    contexts: ['page']
  })
  chrome.contextMenus.create({
    id: SUMMARIZE_SHORT,
    title: 'Short',
    parentId: SUMMARIZE_ARTICLE,
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: SUMMARIZE_MEDIUM,
    title: 'Medium',
    parentId: SUMMARIZE_ARTICLE,
    contexts: ['page']
  });
  chrome.contextMenus.create({
    id: SUMMARIZE_LONG,
    title: 'Long',
    parentId: SUMMARIZE_ARTICLE,
    contexts: ['page']
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

  if (!(data.menuItemId == SUMMARIZE_SHORT || data.menuItemId == SUMMARIZE_MEDIUM || data.menuItemId == SUMMARIZE_LONG)) {
    return;
  }


  let msgData = await getArticleFromCurrentTab(tab);
  // Send message to the listener initialized in the sidepanel JS
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