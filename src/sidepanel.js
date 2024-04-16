import { SUMMARIZE_SHORT, SUMMARIZE_MEDIUM, SUMMARIZE_LONG } from "./serviceWorker";
import { getPromptCompletion } from "./openAIClient";
 

chrome.runtime.onMessage.addListener(({ name, data }) => {
  summarizeArticle(name, data)
});


function summarizeArticle(name, article) {
  let { title, textContent, byline } = article
  const lengthDesc = getSummarizeLengthDesc(textContent, name);
  const summarizePrompt = `Please summarize the following article in approximately ${lengthDesc}. Output an HTML formatted summary. Don't include anything other than valid HTML in the response. Article: """ ${textContent} """`
  outputChatGPTPromptResponseHtml(title, byline, summarizePrompt);
}

function getSummarizeLengthDesc(text, name) {
  const wordCount = text.trim().split(/\s+/).length;
  console.log(`Article word count: ${wordCount}`);
    if (wordCount < 500) {
      if (name == SUMMARIZE_SHORT) {
        return "1 sentence";
      } else if (name == SUMMARIZE_MEDIUM) {
        return "3 sentences or less";
      } else { //SUMMARIZE LONG
        return "1 paragraph";
      }
    }
    else if (wordCount < 1000) {
      if (name == SUMMARIZE_SHORT) {
        return "2 or 3 sentences";
      } else if (name == SUMMARIZE_MEDIUM) {
        return "1 paragraph";
      } else { //SUMMARIZE LONG
        return "2 paragraphs";
      }
    }
    else { // More than 1000 words
      if (name == SUMMARIZE_SHORT) {
        return "1 paragraph";
      } else if (name == SUMMARIZE_MEDIUM) {
        return "2 paragraphs";
      } else { //SUMMARIZE LONG
        return "3 paragraphs";
      }
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
    .replace("{Byline}", byline ?? '')
    .replace("{Hostname}", hostname)
    .replace("{URL}", url ?? '')
    .replace("{Summary}", summary)
}

export async function outputChatGPTPromptResponseHtml(title, byline, prompt) {
  const outputArea = document.getElementById("output-area");
  const loader = outputArea.getElementsByClassName("loader")[0];
  const outputDiv = outputArea.getElementsByClassName("output")[0];

  // Clear any existing output and show loader
  outputDiv.innerHTML = "";
  loader.style.display = "block";

  try {
    const response = await getPromptCompletion(prompt);
    const summaryHtml = generateArticleSummaryHtml(title, byline, await getCurrentTabUrl(), response)
    outputDiv.innerHTML = summaryHtml;
  } catch (err) {
    outputDiv.textContent = `Error: ${err.message}`;
  } finally {
    loader.style.display = "none";
  }
}

async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab?.url ?? '';
}


