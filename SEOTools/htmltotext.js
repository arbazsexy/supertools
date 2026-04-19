// Initialize all accordions as closed
document.addEventListener("DOMContentLoaded", () => {
    const contents = document.querySelectorAll(".accordion-content");
    contents.forEach(content => {
        content.classList.remove("open");
    });
});

const accordionButtons = document.querySelectorAll(".accordion-btn");
accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains("open");

    accordionButtons.forEach((otherButton) => {
      otherButton.classList.remove("active");
      if (otherButton.nextElementSibling) {
        otherButton.nextElementSibling.classList.remove("open");
      }
    });

    if (!isOpen) {
      button.classList.add("active");
      content.classList.add("open");
    }
  });
});

function decodeEntities(str) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

function normalizeText(text, collapseSpaces, removeBlankLines) {
  let output = text.replace(/\r\n/g, "\n");

  if (collapseSpaces) {
    output = output
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n");
  }

  if (removeBlankLines) {
    output = output.replace(/\n{3,}/g, "\n\n");
  }

  return output.trim();
}

function getLineCount(text) {
  return text ? text.split("\n").length : 0;
}

function scrollToElement(element) {
  if (!element) return;
  const navOffset = 110;
  const elementTop = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
  window.scrollTo({ top: Math.max(0, elementTop), behavior: "smooth" });
}

function showMessage(message, type = "info") {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="avg-result-card">
      <div class="avg-result-summary">
        <div>
          <strong>${type === "error" ? "Check the input" : "HTML to text converter"}</strong>
          <p class="avg-inline-note">${message}</p>
        </div>
      </div>
    </div>
  `;
  scrollToElement(result);
}

function convertToText() {
  const htmlInput = document.getElementById("htmlInput").value;
  const preserveLines = document.getElementById("preserveLines").checked;
  const collapseSpaces = document.getElementById("collapseSpaces").checked;
  const removeBlankLines = document.getElementById("removeBlankLines").checked;
  const result = document.getElementById("result");

  if (!htmlInput.trim()) {
    showMessage("Paste some HTML code first.", "error");
    return;
  }

  if (htmlInput.length > 1000000) {
    showMessage("Please use HTML input under 1,000,000 characters for this browser-based converter.", "error");
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlInput, "text/html");

  if (doc.querySelector("parsererror")) {
    showMessage("The HTML could not be parsed cleanly. Please check the input and try again.", "error");
    return;
  }

  doc.querySelectorAll("script, style, noscript, iframe, object, svg, canvas, template, head, title, meta").forEach((el) => el.remove());

  if (preserveLines) {
    doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    const blockSelectors = "p, div, section, article, header, footer, aside, main, nav, li, ul, ol, table, tr, h1, h2, h3, h4, h5, h6, blockquote, pre";
    doc.querySelectorAll(blockSelectors).forEach((el) => {
      el.insertAdjacentText("beforebegin", "\n");
      el.insertAdjacentText("afterend", "\n");
    });
  }

  let text = doc.body ? (doc.body.textContent || "") : "";
  text = decodeEntities(text);
  text = normalizeText(text, collapseSpaces, removeBlankLines);

  const charCount = text.length;
  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = getLineCount(text);

  result.innerHTML = `
    <div class="avg-result-card">
      <div class="avg-result-summary">
        <div>
          <strong>Plain text extracted</strong>
          <p class="avg-inline-note">Copy the text or download it as a TXT file for review, edits, or handoff.</p>
        </div>
      </div>
      <div class="avg-result-stat-grid">
        <div class="avg-result-stat"><strong>${charCount.toLocaleString()}</strong><span>Characters</span></div>
        <div class="avg-result-stat"><strong>${wordCount.toLocaleString()}</strong><span>Words</span></div>
        <div class="avg-result-stat"><strong>${lineCount.toLocaleString()}</strong><span>Lines</span></div>
      </div>
      <div class="avg-result-actions">
        <button type="button" id="copyTextBtn" class="image-tool-button secondary">Copy Text</button>
        <button type="button" id="downloadTextBtn" class="image-tool-button secondary">Download TXT</button>
      </div>
      <label for="textOutput">Plain text output</label>
      <textarea id="textOutput" class="code-output result-textarea" rows="12" readonly></textarea>
    </div>
  `;

  document.getElementById("textOutput").value = text;
  document.getElementById("copyTextBtn").addEventListener("click", copyTextOutput);
  document.getElementById("downloadTextBtn").addEventListener("click", downloadText);
  scrollToElement(result);
}

function downloadText() {
  const output = document.getElementById("textOutput");
  if (!output || !output.value.trim()) {
    showMessage("No text to download.", "error");
    return;
  }

  const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "converted-text.txt";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function clearFields() {
  document.getElementById("htmlInput").value = "";
  document.getElementById("result").innerHTML = "";
}

function loadSample() {
  const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sample Article - SuperTools</title>
    <meta name="description" content="A sample article demonstrating HTML to text conversion">
    <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #333; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to SuperTools</h1>
        <nav>
            <a href="/">Home</a> |
            <a href="/tools">Tools</a> |
            <a href="/about">About</a>
        </nav>
    </header>

    <main>
        <article>
            <h2>HTML to Text Conversion Made Easy</h2>
            <p>This is a <strong>sample article</strong> that demonstrates how the HTML to Text converter works. It contains various HTML elements that will be converted to plain text.</p>

            <p>You can <em>preserve line breaks</em> for better readability, or <span class="highlight">collapse extra spaces</span> for cleaner output.</p>

            <h3>Key Features:</h3>
            <ul>
                <li>Remove HTML tags automatically</li>
                <li>Decode special characters (&amp;, &lt;, &gt;)</li>
                <li>Preserve readable formatting</li>
                <li>Download as plain text file</li>
            </ul>

            <h3>Perfect for:</h3>
            <ol>
                <li>Content audits and reviews</li>
                <li>SEO analysis of page copy</li>
                <li>Migration projects</li>
                <li>Email content cleanup</li>
            </ol>

            <blockquote>
                "This tool helps extract readable text from complex HTML markup, making content analysis much easier."
            </blockquote>

            <p>For more information, visit <a href="https://supertools1.site">SuperTools</a> today!</p>
        </article>
    </main>

    <footer>
        <p>&copy; 2026 SuperTools. All rights reserved.</p>
    </footer>

    <script>
        console.log("This script content will be removed during conversion");
    </script>
</body>
</html>`;

  document.getElementById("htmlInput").value = sampleHtml;
  convertToText();
}

function copyTextOutput() {
  const output = document.getElementById("textOutput");
  if (!output || !output.value.trim()) {
    showMessage("No text to copy.", "error");
    return;
  }

  navigator.clipboard.writeText(output.value)
    .then(() => showMessage("Text copied to clipboard."))
    .catch(() => showMessage("Failed to copy text.", "error"));
}

function copyResult() {
  copyTextOutput();
}

const tools = [
  { name: "Text to HTML", url: "texttohtml.html", icon: "&#128221;", category: "seo", desc: "Turn cleaned plain text back into lightweight HTML for publishing or CMS entry." },
  { name: "Keyword Density Checker", url: "keyworddensitychecker.html", icon: "&#128270;", category: "seo", desc: "Review repeated terms and on-page keyword balance in extracted copy." },
  { name: "Word Frequency", url: "wordfrequency.html", icon: "&#128202;", category: "seo", desc: "Break down repeated terms to spot themes, filler, and content cleanup needs." },
  { name: "URL Slug Generator", url: "urlsluggenerator.html", icon: "&#128279;", category: "seo", desc: "Create cleaner slugs after reviewing or rewriting extracted page content." },
  { name: "Meta Tag Generator", url: "metataggenerator.html", icon: "&#128279;", category: "seo", desc: "Prepare title and description tags after content cleanup." },
  { name: "Open Graph Generator", url: "opengraphgenerator.html", icon: "&#128188;", category: "seo", desc: "Add social preview tags after the main content is ready." },
  { name: "Schema Generator", url: "schemagenerator.html", icon: "&#128200;", category: "seo", desc: "Layer structured data on top of finished content and page markup." },
  { name: "HTML to Text", url: "htmltotext.html", icon: "&#128221;", category: "seo", desc: "Convert HTML markup into plain text by removing tags and extracting readable content." }
];

const currentPage = window.location.pathname.split("/").pop();
const preferredRelated = { "htmltotext.html": ["texttohtml.html", "keyworddensitychecker.html", "wordfrequency.html", "urlsluggenerator.html"] };
const preferredUrls = preferredRelated[currentPage] || [];
const related = [...preferredUrls.map(url => tools.find(tool => tool.url === url)).filter(Boolean), ...tools.filter(tool => tool.url !== currentPage && !preferredUrls.includes(tool.url))].slice(0, 4);
const relatedContainer = document.getElementById("relatedToolsContainer");
if (relatedContainer) {
    relatedContainer.innerHTML = related.map((tool) => `
<a href="${tool.url}" class="tool-card avg-related-card">
      <div class="avg-related-icon">${tool.icon || '»'}</div>
      <div class="avg-related-body">
        <h3>${tool.name}</h3>
        <p>${tool.blurb || tool.desc}</p>
      </div>
      <div class="avg-related-cta">Open</div>
    </a>`).join("");
}

document.getElementById("convertBtn").addEventListener("click", convertToText);
document.getElementById("clearBtn").addEventListener("click", clearFields);
document.getElementById("sampleBtn").addEventListener("click", loadSample);
document.getElementById("copyBtn").addEventListener("click", copyResult);
