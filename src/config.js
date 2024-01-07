import { listAvailableModels } from "./openAIClient";

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

// Saves options to chrome.storage
const saveOptions = async () => {
    const openAiApiKey = document.getElementById('openai-api-key').value;
    const openAiModel = document.getElementById('openai-model-select').value;
    let msg;
    try {
      await chrome.storage.local.set({ 
        openAiApiKey,
        openAiModel,
      });
      msg = 'Saved!';
    } catch(e) {
      msg = `Failed to save: ${e.message ?? 'error'}`
    }
   
    const status = document.getElementById('status');
    // Update status to let user know options were saved.
    status.textContent = msg;
    setTimeout(() => {status.textContent = ''}, 750);
};

// Restores UI using the preferences stored in chrome.storage
const restoreOptions = async () => {
  const options = await chrome.storage.local.get({
    openAiApiKey: '',
    openAiModel: 'default'
  });

  document.getElementById('openai-api-key').value = options.openAiApiKey;
  if (options.openAiApiKey) {
    await populateModelSelector(options.openAiModel);
  } 
};

async function populateModelSelector(currentModel) {
  const modelSelector = document.getElementById("openai-model-select");
  const modelNames = await listAvailableModels();
  modelNames.forEach((m) => {
    const option = document.createElement("option");
    option.value = m;
    option.text = m;
    if (m === currentModel) {
      modelSelector.value = m;
      option.selected = true;
    }
    modelSelector.appendChild(option);
  });
}

export async function getOpenAIModel() {
  const {openAiModel} = await chrome.storage.local.get({openAiModel: 'default'});
  return openAiModel;
}

export async function getAPIKey() {
  const {openAiApiKey} = await chrome.storage.local.get({openAiApiKey: ''});
  return openAiApiKey;
}