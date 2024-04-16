const MODEL = "OPEN_AI_MODEL"
const API_KEY = "OPEN_AI_API_KEY"

export async function getOpenAIModel() {
    const { MODEL: openAiModel } = await chrome.storage.local.get({MODEL: 'default'});
    return openAiModel;
  }
  
export async function getAPIKey() {
const { API_KEY: openAiApiKey } = await chrome.storage.local.get({API_KEY: ''});
return openAiApiKey;
}


export async function saveOptions(openAiApiKey, openAiModel) {
    await chrome.storage.local.set({ 
        API_KEY: openAiApiKey,
        MODEL: openAiModel,
      });
}

