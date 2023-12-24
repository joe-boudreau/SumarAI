const sleep = ms => new Promise(r => setTimeout(r, ms));

function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'summarize-text',
    title: 'Summarize',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'translate-text',
    title: 'Translate',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'summarize-article',
    title: 'Summarize Article',
    contexts: ['all']
  })
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (data, tab) => {
  chrome.sidePanel.open({tabId: tab.id});
  // Wait a little bit for the message listener to be initialized in the side panel JS (if it was just opened)
  await sleep(500);
  // Send message to the listener initialized in the sidepanel JS
  switch (data.menuItemId) {
    case 'summarize-text':
      chrome.runtime.sendMessage({
        name: 'summarize-text',
        data: data.selectionText
      });
      break;
    case 'translate-text':
      chrome.runtime.sendMessage({
        name: 'translate-text',
        data: data.selectionText
      });
      break;
    case 'summarize-article':
      if (tab.url.includes('chrome://')) {
        return; //TODO: handle nicely
      }
      const article = await getArticleFromCurrentTab(tab);
      chrome.runtime.sendMessage({
        name: 'summarize-article',
        data: article
      });
      break;
  }
});

async function getArticleFromCurrentTab(tab) {
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['./getArticleWithReadability.js'],
  });
  const article = injectionResults[0].result;
  return article
}