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
    openPanel(document.getElementById("summarize-acc"))
    const summarizePrompt = `Please summarize the following text in 2 or 3 sentences. Don't worry about the context, just try to rephrase the text more concisely. 2 or 3 sentences at most. Text: """ ${data.value} """`
    const response = await getPromptCompletion(summarizePrompt);
    document.getElementById("summarize-output").textContent = response;
    const panel = document.getElementById("summarize-panel");
    // Reset the panel height in case the response overflows
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
  else if (name === 'translate-text') {
    openPanel(document.getElementById("translate-acc"));
    textToTranslate = data.value;
  }
});


document.getElementById("translate-lang-button").addEventListener("click", async () => {
  const outputLang = document.getElementById("language-select").value;
  const translatePrompt = `Please translate the following text from English to ${outputLang}. Text: ${textToTranslate}`
  const response = await getPromptCompletion(translatePrompt);
  document.getElementById("translate-output").textContent = response;
  const panel = document.getElementById("translate-panel");
  // Reset the panel height in case the response overflows
  panel.style.maxHeight = panel.scrollHeight + "px";
});


var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {openPanel(this);});
}

function openPanel(accordianButton) {
  console.log('opening panel: ' + accordianButton.id)
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

