// Saves options to chrome.storage
const saveOptions = () => {
    const key = document.getElementById('openai-api-key').value;
    chrome.storage.local.set({ openAiApiKey: key},
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Saved!';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.local.get({ openAiApiKey: ''},
      (items) => {
        document.getElementById('openai-api-key').value = items.openAiApiKey;
      }
    );
  };

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
