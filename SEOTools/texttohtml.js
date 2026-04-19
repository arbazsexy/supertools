// Initialize all accordions as closed
document.addEventListener("DOMContentLoaded", () => {
    const contents = document.querySelectorAll(".accordion-content");
    contents.forEach(content => {
        content.classList.remove("open");
    });
});

const accButtons = document.querySelectorAll(".accordion-btn");
accButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const isOpen = content.classList.contains("open");

        // Close all accordions
        accButtons.forEach(otherBtn => {
            otherBtn.classList.remove("active");
            if (otherBtn.nextElementSibling) {
                otherBtn.nextElementSibling.classList.remove("open");
            }
        });

        // Open clicked accordion
        if (!isOpen) {
            btn.classList.add("active");
            content.classList.add("open");
        }
    });
});

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function scrollToElement(element) {
    if (!element) return;
    const navOffset = 110;
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: Math.max(0, elementTop), behavior: "smooth" });
}

function showMessage(message, type = "info") {
    const result = document.getElementById("result");
    result.innerHTML = `<div class="avg-result-card"><div class="avg-result-summary"><div><strong>${type === "error" ? "Check the input" : "Text to HTML converter"}</strong><p class="avg-inline-note">${message}</p></div></div></div>`;
    scrollToElement(result);
}

function limitLengthCheck(text) {
    return text.length > 1000000;
}

function convertToHTML() {
    const text = document.getElementById("textInput").value;
    const mode = document.getElementById("conversionMode").value;
    const trimLines = document.getElementById("trimLines").checked;
    const result = document.getElementById("result");

    if (!text.trim()) {
        showMessage("Enter some text first.", "error");
        return;
    }

    if (limitLengthCheck(text)) {
        showMessage("Use text input under 1,000,000 characters for this browser-based converter.", "error");
        return;
    }

    const rawLines = text.replace(/\r\n/g, "\n").split("\n");
    const lines = trimLines
        ? rawLines.map((line) => line.trim()).filter((line) => line !== "")
        : rawLines.map((line) => line.replace(/\r/g, ""));

    let htmlOutput = "";

    if (mode === "linebreaks") {
        htmlOutput = escapeHtml(text).replace(/\r\n/g, "\n").replace(/\n/g, "<br>\n");
    } else if (mode === "paragraphs") {
        htmlOutput = text
            .replace(/\r\n/g, "\n")
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
            .join("\n");
    } else if (mode === "list") {
        const items = lines.map((line) => `  <li>${escapeHtml(line)}</li>`);
        htmlOutput = `<ul>\n${items.join("\n")}\n</ul>`;
    } else if (mode === "fullpage") {
        const bodyParagraphs = text
            .replace(/\r\n/g, "\n")
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `    <p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
            .join("\n");

        htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Document</title>
</head>
<body>
${bodyParagraphs}
</body>
</html>`;
    }

    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lineCount = rawLines.length;
    const paragraphCount = mode === "paragraphs" || mode === "fullpage"
        ? text.replace(/\r\n/g, "\n").split(/\n\s*\n/).filter((p) => p.trim()).length
        : 0;
    const outputModeLabel = mode === "paragraphs" ? "Paragraphs" : mode === "linebreaks" ? "Line Breaks" : mode === "list" ? "Unordered List" : "Full HTML Page";

    result.innerHTML = `<div class="avg-result-card"><div class="avg-result-summary"><div><strong>HTML output generated</strong><p class="avg-inline-note">Your plain text has been formatted into ${outputModeLabel.toLowerCase()} output and is ready to copy into a CMS, editor, or template.</p></div></div><div class="avg-result-stat-grid"><div class="avg-result-stat"><strong>${charCount}</strong><span>Characters</span></div><div class="avg-result-stat"><strong>${wordCount}</strong><span>Words</span></div><div class="avg-result-stat"><strong>${lineCount}</strong><span>Lines</span></div><div class="avg-result-stat"><strong>${paragraphCount}</strong><span>Paragraphs</span></div></div><div class="avg-result-actions"><button type="button" id="copyHtmlBtn" class="image-tool-button secondary">Copy HTML</button></div><label for="htmlOutput">Generated HTML output</label><textarea id="htmlOutput" class="code-output" rows="18" readonly data-raw-html="${htmlOutput.replace(/"/g, '&quot;')}">${escapeHtml(htmlOutput)}</textarea></div>`;

    document.getElementById("copyHtmlBtn").addEventListener("click", copyHtmlOutput);
    scrollToElement(result);
}

function clearFields() {
    document.getElementById("textInput").value = "";
    document.getElementById("conversionMode").value = "paragraphs";
    document.getElementById("trimLines").checked = true;
    document.getElementById("result").innerHTML = "";
}

function loadSample() {
    document.getElementById("textInput").value = `SuperTools: Fast Browser-Based SEO Utilities

Welcome to SuperTools, your go-to platform for practical SEO and content tools that work directly in your browser.

Our mission is to provide fast, reliable, and free tools for content creators, developers, and SEO professionals who need quick solutions without complex setups or subscriptions.

Key Features:

- Instant text analysis and formatting
- Metadata generation for better SEO
- Schema markup creation
- HTML conversion and cleanup
- Keyword research and optimization

Why Choose SuperTools?

1. Browser-based: No downloads or installations required
2. Free to use: All tools are completely free
3. Fast and efficient: Get results in seconds
4. Privacy-focused: Your data stays in your browser
5. Regularly updated: New tools added frequently

Get started today and streamline your SEO workflow with SuperTools!`;
    document.getElementById("conversionMode").value = "paragraphs";
    document.getElementById("trimLines").checked = true;
    convertToHTML();
}

function copyHtmlOutput() {
    const output = document.getElementById("htmlOutput");
    if (!output || !output.dataset.rawHtml) {
        showMessage("No HTML output to copy yet.", "error");
        return;
    }
    navigator.clipboard.writeText(output.dataset.rawHtml)
        .then(() => showMessage("HTML copied to clipboard."))
        .catch(() => showMessage("Failed to copy HTML output.", "error"));
}

function copyResult() {
    copyHtmlOutput();
}

const tools = [
    { name: "HTML to Text", url: "htmltotext.html", icon: "&#128221;", category: "seo", desc: "Reverse formatted HTML back into cleaner plain text when needed." },
    { name: "Meta Tag Generator", url: "metataggenerator.html", icon: "&#128279;", category: "seo", desc: "Prepare title and description tags after formatting page content." },
    { name: "Open Graph Generator", url: "opengraphgenerator.html", icon: "&#128188;", category: "seo", desc: "Add social preview tags after the main page content is ready." },
    { name: "Schema Generator", url: "schemagenerator.html", icon: "&#128200;", category: "seo", desc: "Layer structured data on top of finished content and page markup." },
    { name: "Keyword Density Checker", url: "keyworddensitychecker.html", icon: "&#128270;", category: "seo", desc: "Analyze keyword frequency and density in your content." },
    { name: "URL Slug Generator", url: "urlsluggenerator.html", icon: "&#128279;", category: "seo", desc: "Create SEO-friendly URL slugs from titles and phrases." },
    { name: "Word Frequency", url: "wordfrequency.html", icon: "&#128202;", category: "seo", desc: "Count word occurrences and see frequency statistics." },
    { name: "Text to HTML", url: "texttohtml.html", icon: "&#128221;", category: "seo", desc: "Convert plain text into HTML paragraphs, lists, or pages." }
];

const currentPage = window.location.pathname.split("/").pop();
const preferredRelated = { "texttohtml.html": ["htmltotext.html", "metataggenerator.html", "opengraphgenerator.html", "schemagenerator.html"] };
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

document.getElementById("convertBtn").addEventListener("click", convertToHTML);
document.getElementById("clearBtn").addEventListener("click", clearFields);
document.getElementById("sampleBtn").addEventListener("click", loadSample);
document.getElementById("copyBtn").addEventListener("click", copyHtmlOutput);


