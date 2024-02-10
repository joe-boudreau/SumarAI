import { SUMMARIZE_ARTICLE, SUMMARIZE_SELECTION, TRANSLATE_SELECTION } from "./serviceWorker";
import { getPromptCompletion } from "./openAIClient";

//Populate the languages list
// const langSelector = document.getElementById("language-select");
// fetch('./languages.json').then((file) => file.json()).then((languages) => {
//   languages.forEach((l) => {
//     const option = document.createElement("option");
//     option.value = l;
//     option.text = l;
//     langSelector.appendChild(option);
//   });
// });

// document.getElementById("translate-lang-button").addEventListener("click", async () => {
//   const outputLang = document.getElementById("language-select").value;
//   const translatePrompt = `Please translate the following text from English to ${outputLang}. Text: ${textToTranslate}`;
//   outputChatGPTPromptResponse(translatePrompt);
// });      

chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === SUMMARIZE_ARTICLE) {
    summarizeArticle(data)
  }
  if (name === SUMMARIZE_SELECTION) {
    generateAndPrintSummary(data);
  }
  else if (name === TRANSLATE_SELECTION) {
    textToTranslate = data;
    showTranslateOptions();
  }
});

function showTranslateOptions() {
  document.getElementById("lang-selector").style.display = 'block';
}

function summarizeArticle(article) {
  let {title, textContent, byline, siteName, lang} = article
  console.log(article);
  const lengthDesc = getSummarizeLengthDesc(textContent);
  const summarizePrompt = `Please summarize the following article in ${lengthDesc}. Output the summary in HTML format. Article: """ ${textContent} """`
  outputChatGPTPromptResponseHtml(title, byline, summarizePrompt);
}

function generateAndPrintSummary(text) {
    const lengthDesc = getSummarizeLengthDesc(text);
    const summarizePrompt = `Please summarize the following text in ${lengthDesc}. Don't worry about the context, just try to rephrase the text more concisely. Text: """ ${text} """`
    outputChatGPTPromptResponse(summarizePrompt);
}

function getSummarizeLengthDesc(text) {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 500) {
      return "1 paragraph";
    }
    else if (wordCount < 1000) {
      return "1 or 2 paragraphs";
    }
    else {
      return "2 or 3 paragraphs"
    }
}

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
const articleSummaryTemplate = `
  <h2>{Title}</h2>
  <h4 class="byline">{Byline}</h4>
  <p class="site-url">Site: <a href="{URL}">{Hostname}</a></p>
  <br/>
  <div class="summary">{Summary}</div>
`

function generateArticleSummaryHtml(title, byline, url, summary) {
  const { hostname } = new URL(url);
  return articleSummaryTemplate
    .replace("{Title}", title)
    .replace("{Byline}", byline)
    .replace("{Hostname}", hostname)
    .replace("{URL}", url)
    .replace("{Summary}", summary)
}

export async function outputChatGPTPromptResponseHtml(title, byline, prompt) {
  const outputArea = document.getElementById("output-area");
  const loader = outputArea.getElementsByClassName("loader")[0];
  const outputDiv = outputArea.getElementsByClassName("output")[0];
  loader.style.display = "block";

  try {
    const response = await getPromptCompletion(prompt);
    const summaryHtml = generateArticleSummaryHtml(title, byline, await getCurrentTabUrl(), response)
    outputDiv.innerHTML = summaryHtml;
  } catch (err) {
    outputDiv.textContent = `Error: ${err.message}`;
  } finally {
    loader.style.display = "none";
    // Hide the language selector
    const langSelector = document.getElementById("lang-selector");
    langSelector.style.display = "none";
  }
}

async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}


