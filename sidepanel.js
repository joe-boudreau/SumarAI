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
    }
  }

  async function getAPIKey() {
    const result = await chrome.storage.local.get('openAiApiKey');
    if (!result.openAiApiKey) {
      // TODO show error and offer link to options config
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

chrome.runtime.onMessage.addListener(async ({ name, data }) => {
  closeAllPanels();
  if (name === 'summarize-text') {
    generateAndPrintSummary(data.value);
  }
  else if (name === 'translate-text') {
    openAccordian(document.getElementById("translate-acc"));
    textToTranslate = data.value;
  }
});

async function generateAndPrintSummary(text) {
  openAccordian(document.getElementById("summarize-acc"))
  const panel = document.getElementById("summarize-panel");
  const loader = panel.getElementsByClassName("loader")[0];
  loader.style.display = "block";
  try {
    const lengthDesc = getSummarizeLengthDesc(text);
    const summarizePrompt = `Please summarize the following text in ${lengthDesc}. Don't worry about the context, just try to rephrase the text more concisely. Text: """ ${text} """`
    const response = await getPromptCompletion(summarizePrompt);
    document.getElementById("summarize-output").textContent = response;
    // Reset the panel height in case the response overflows
    panel.style.maxHeight = panel.scrollHeight + "px";
  } catch (error) {
    document.getElementById("summarize-output").textContent = "Error";
  } finally {
    loader.style.display = "none";
  }
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
  const panel = document.getElementById("translate-panel");
  const loader = panel.getElementsByClassName("loader")[0];
  loader.style.display = "block";
  try {
    const outputLang = document.getElementById("language-select").value;
    const translatePrompt = `Please translate the following text from English to ${outputLang}. Text: ${textToTranslate}`
    const response = await getPromptCompletion(translatePrompt);
    document.getElementById("translate-output").textContent = response;
    // Reset the panel height in case the response overflows
    panel.style.maxHeight = panel.scrollHeight + "px";
  } catch (err) {
    document.getElementById("translate-output").textContent = "Error";
  } finally {
    loader.style.display = "none";
  }
});


var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {openAccordian(this);});
}

function openAccordian(accordianButton) {
  accordianButton.classList.toggle("active");
  var panel = accordianButton.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

function closeAllPanels() {
  Array.from(document.getElementsByClassName("accordion")).forEach((acc) => {
    acc.classList.remove("active");
    acc.nextElementSibling.style.maxHeight = null;
  });
}

