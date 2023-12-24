async function getPromptCompletion(prompt) {
    try {
      const openAiApiKey = await getAPIKey();
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${openAiApiKey}`);
      const body = {
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
            {role: "system", content: "You are a helpful assistant."},
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

      console.log(responseJson);
      return responseJson.choices[0].message.content;

    } catch (error) {
      console.error(error);
      console.log(error.message)
      throw error;
    }
  }

  async function getAPIKey() {
    const result = await chrome.storage.local.get('openAiApiKey');
    if (!result.openAiApiKey) {
      throw new Error("Missing OpenAI API Key")
    }
    return result.openAiApiKey;
  }

//Populate the languages list
const langSelector = document.getElementById("language-select");
fetch('./languages.json').then((file) => file.json()).then((languages) => {
  languages.forEach((l) => {
    const option = document.createElement("option");
    option.value = l;
    option.text = l;
    langSelector.appendChild(option);
  });
});

var textToTranslate = "";

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === 'summarize-article') {
    summarizeArticle(data)
  }
  if (name === 'summarize-text') {
    generateAndPrintSummary(data);
  }
  else if (name === 'translate-text') {
    textToTranslate = data;
    showTranslateOptions();
  }
});

function showTranslateOptions() {
  document.getElementById("lang-selector").style.display = 'block';
}

function summarizeArticle(article) {
  let {title, textContent, byline, siteName, lang} = article
  console.log(textContent);
  const lengthDesc = getSummarizeLengthDesc(textContent);
  const summarizePrompt = `Please summarize the following article in ${lengthDesc}. Article: """ ${textContent} """`
  outputChatGPTPromptResponse(summarizePrompt);
}

function generateAndPrintSummary(text) {
    const lengthDesc = getSummarizeLengthDesc(text);
    const summarizePrompt = `Please summarize the following text in ${lengthDesc}. Don't worry about the context, just try to rephrase the text more concisely. Text: """ ${text} """`
    outputChatGPTPromptResponse(summarizePrompt);
}

function getSummarizeLengthDesc(text) {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 500) {
      return "2 to 3 sentences";
    }
    else if (wordCount < 1000) {
      return "4 to 7 sentences";
    }
    else if (wordCount < 2000) {
      return "8 to 11 sentences"
    }
    else {
      return "12 to 14 sentences"
    }
}

document.getElementById("translate-lang-button").addEventListener("click", async () => {
    const outputLang = document.getElementById("language-select").value;
    const translatePrompt = `Please translate the following text from English to ${outputLang}. Text: ${textToTranslate}`;
    outputChatGPTPromptResponse(translatePrompt);
});      

export async function outputChatGPTPromptResponse(prompt) {
  const outputDiv = document.getElementById("output");
  const loader = outputDiv.getElementsByClassName("loader")[0];
  if (loader) {
    loader.style.display = "block";
  }

  try {
    const response = await getPromptCompletion(prompt);
    outputDiv.textContent = response;
  } catch (err) {
    outputDiv.textContent = `Error: ${err.message}`;
  } finally {
    loader.style.display = "none";
    // Hide the language selector
    const langSelector = document.getElementById("lang-selector");
    langSelector.style.display = "none";
  }
}


