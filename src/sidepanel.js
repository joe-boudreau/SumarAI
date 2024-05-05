import { SUMMARIZE_SHORT, SUMMARIZE_MEDIUM, SUMMARIZE_LONG } from "./serviceWorker";
import { getPromptCompletion } from "./openAIClient";
 
const SUMMARIZE_PROMPT = `Please summarize the following article in approximately {LengthDesc}.
Output an HTML formatted summary. Don't output anything other than valid HTML in your response.
Article: """ {ArticleText} """
`

chrome.runtime.onMessage.addListener(({ name, data }) => {
  summarizeArticle(name, data)
});


function summarizeArticle(name, article) {
  let { title, textContent, byline } = article
  const lengthDesc = getSummarizeLengthDesc(textContent, name);
  const summarizePrompt = SUMMARIZE_PROMPT
    .replace("{LengthDesc}", lengthDesc)
    .replace("{ArticleText}", textContent);

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
    const summary = stripHtmlDelimitersIfPresent(response)
    const summaryHtml = generateArticleSummaryHtml(title, byline, await getCurrentTabUrl(), summary)
    outputDiv.innerHTML = summaryHtml;
  } catch (err) {
    outputDiv.textContent = `Error: ${err.message}`;
  } finally {
    loader.style.display = "none";
  }
}

/**
 * thanks chatGPT
 */
function stripHtmlDelimitersIfPresent(str) {
  str = str.trim()
  
  // Regular expression to match the desired format
  var regex = /^```html([\s\S]*)```$/;

  // Check if the string matches the format
  var match = regex.exec(str);

  // If there's a match, return the content inside the HTML tags
  if (match) {
    return match[1].trim(); // trim() to remove leading and trailing whitespace
  } else {
    // If no match, return the original string
    return str;
  }
}

async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab?.url ?? '';
}


