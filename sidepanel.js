const OPENAI_API_KEY="OPEN_API_KEY_HERE";

async function getPromptCompletion(prompt) {
    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${OPENAI_API_KEY}`);
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

chrome.runtime.onMessage.addListener(async ({ name, data }) => {
  if (name === 'summarize-text') {
    openPanel(document.getElementById("summarize-acc"))
    const summarizePrompt = `Please summarize the following text in 2 or 3 sentences. Don't worry about the context, just try to rephrase the text more concisely. 2 or 3 sentences at most. Text: """ ${data.value} """`
    const response = await getPromptCompletion(summarizePrompt);
    document.getElementById("responseArea").textContent = response;
  }
});

var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {openPanel(this);});
}

function openPanel(accordianButton) {
  accordianButton.classList.toggle("active");
  var panel = accordianButton.nextElementSibling;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

