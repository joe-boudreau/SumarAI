
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

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
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener(async (data, tab) => {
  await chrome.sidePanel.open({tabId: tab.id});
  // Wait a little bit for the message listener to be initialized in the side panel JS (if it was just opened)
  await sleep(500);
  if (data.menuItemId === 'summarize-text') {
    chrome.runtime.sendMessage({
      name: 'summarize-text',
      data: { value: data.selectionText }
    });
  } else if (data.menuItemId === 'translate-text') {
    chrome.runtime.sendMessage({
      name: 'translate-text',
      data: { value: data.selectionText }
    });
  }
});
