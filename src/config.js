import { listAvailableModels } from "./openAIClient";
import { getOpenAIModel, getAPIKey, getLanguage, saveOptions } from "./storage"

// Saves options to chrome.storage
const saveOptionsUI = async () => {
    const openAiApiKey = document.getElementById('openai-api-key').value;
    const openAiModel = document.getElementById('openai-model-select').value;
    let msg;
    try {
      saveOptions(openAiApiKey, openAiModel);
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
  const openAiApiKey = await getAPIKey()
  const openAiModel = await getOpenAIModel()
  const language = await getLanguage()

  document.getElementById('openai-api-key').value = openAiApiKey;
  document.getElementById('language').value = language;

  if (openAiApiKey) {
    await populateModelSelector(openAiModel);
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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptionsUI);