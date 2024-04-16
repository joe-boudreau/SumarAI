import { getAPIKey, getOpenAIModel } from "./storage";

export async function getPromptCompletion(prompt) {
    try {
      const openAiApiKey = await getAPIKey();
      if (!openAiApiKey) {
        throw new Error("Missing OpenAI API Key")
      }
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${openAiApiKey}`);
      const openAiModel = await getOpenAIModel();
      const body = {
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
            {role: "system", content: "You are an expert summarizer that can synthesize articles and provide the main points in a easily understandable format."},
            {role: "user", content: prompt},
        ]
      };
      const jsonBody = JSON.stringify(body)
  
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: headers,
        body: jsonBody
      });
  
      // Check if the response status is OK (status code 200)
      if (!response.ok) {
        throw new Error('Failed to get response from ChatGPT');
      }
  
      // Parse the response JSON
      const responseJson = await response.json();
  
      return responseJson.choices[0].message.content;
  
    } catch (error) {
      console.error(error);
      throw error;
    }
}

export async function listAvailableModels() {
    try {
      const openAiApiKey = await getAPIKey();
      if (!openAiApiKey) {
        throw new Error("Missing OpenAI API Key")
      }
      const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`,
      });
  
  
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: headers,
      });
  
      // Check if the response status is OK (status code 200)
      if (!response.ok) {
        throw new Error('Failed to get response from ChatGPT');
      }
  
      // Parse the response JSON
      const responseJson = await response.json();
      return responseJson.data.map((model) => model.id)
  
    } catch (error) {
      console.error(error);
      throw error;
    }
}