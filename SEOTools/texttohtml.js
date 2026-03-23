// Accordion
const accButtons = document.querySelectorAll(".accordion-btn");
accButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const isOpen = content.style.maxHeight;

        accButtons.forEach(otherBtn => {
            otherBtn.classList.remove("active");
            if (otherBtn.nextElementSibling) {
                otherBtn.nextElementSibling.style.maxHeight = null;
            }
        });

        if (!isOpen) {
            btn.classList.add("active");
            content.style.maxHeight = content.scrollHeight + "px";
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

function convertToHTML() {
    const text = document.getElementById("textInput").value;
    const mode = document.getElementById("conversionMode").value;
    const trimLines = document.getElementById("trimLines").checked;
    const result = document.getElementById("result");

    if (!text.trim()) {
        result.innerHTML = `<div class="average-result result-pop"><strong>Please enter some text first.</strong></div>`;
        return;
    }

    const rawLines = text.replace(/\r\n/g, "\n").split("\n");
    const lines = trimLines
        ? rawLines.map(line => line.trim()).filter(line => line !== "")
        : rawLines.map(line => line.replace(/\r/g, ""));

    let htmlOutput = "";

    if (mode === "linebreaks") {
        htmlOutput = escapeHtml(text).replace(/\r\n/g, "\n").replace(/\n/g, "<br>\n");
    } else if (mode === "paragraphs") {
        const paragraphs = text
            .replace(/\r\n/g, "\n")
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`);
        htmlOutput = paragraphs.join("\n");
    } else if (mode === "list") {
        const items = lines.map(line => `  <li>${escapeHtml(line)}</li>`);
        htmlOutput = `<ul>\n${items.join("\n")}\n</ul>`;
    } else if (mode === "fullpage") {
        const bodyParagraphs = text
            .replace(/\r\n/g, "\n")
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => `    <p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
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

    result.innerHTML = `
        <div class="average-result result-pop">
            <div class="stats">
                <div class="stat-box">Characters<br>${charCount}</div>
                <div class="stat-box">Words<br>${wordCount}</div>
                <div class="stat-box">Lines<br>${lineCount}</div>
                <div class="stat-box">Mode<br>${mode}</div>
            </div>

            <hr>

            <div><strong>Generated HTML Output</strong></div>
            <textarea id="htmlOutput" class="code-output result-textarea" rows="18" readonly></textarea>

            <div class="button-group">
                <button type="button" class="action-btn copy-btn" onclick="copyHtmlOutput()">
                    <i class="fas fa-copy"></i> Copy HTML
                </button>
            </div>
        </div>
    `;

    document.getElementById("htmlOutput").value = htmlOutput;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearFields() {
    document.getElementById("textInput").value = "";
    document.getElementById("conversionMode").value = "paragraphs";
    document.getElementById("trimLines").checked = true;
    document.getElementById("result").innerHTML = "";
}

function loadSample() {
    document.getElementById("textInput").value = `Welcome to SuperTools

This is a simple example paragraph.
It can be converted into HTML quickly.

Another paragraph starts here.`;
    document.getElementById("conversionMode").value = "paragraphs";
    document.getElementById("trimLines").checked = true;
    convertToHTML();
}

function copyHtmlOutput() {
    const output = document.getElementById("htmlOutput");
    if (!output || !output.value.trim()) {
        alert("No HTML output to copy.");
        return;
    }

    navigator.clipboard.writeText(output.value)
        .then(() => alert("HTML copied to clipboard!"))
        .catch(() => alert("Failed to copy HTML."));
}

function copyResult() {
    copyHtmlOutput();
}

const tools = [
    { name: "Meta Tag Generator", url: "metataggenerator.html", icon: "&#127991;&#65039;", category: "seo" },
    { name: "Open Graph Generator", url: "opengraphgenerator.html", icon: "&#128279;", category: "seo" },
    { name: "Robots.txt Generator", url: "robotstxtgenerator.html", icon: "&#129302;", category: "seo" },
    { name: "Sitemap Generator", url: "sitemapgenerator.html", icon: "&#128506;&#65039;", category: "seo" },
    { name: "URL Slug Generator", url: "urlsluggenerator.html", icon: "&#9997;&#65039;", category: "seo" },
    { name: "Schema Generator", url: "schemagenerator.html", icon: "&#128196;", category: "seo" },
    { name: "Keyword Density Checker", url: "keyworddensitychecker.html", icon: "&#128202;", category: "seo" },
    { name: "Hreflang Generator", url: "hreflanggenerator.html", icon: "&#127757;", category: "seo" },
    { name: "HTML TO Text", url: "htmltotext.html", icon: "&#129534;", category: "seo" },
    { name: "TEXT TO HTML", url: "texttohtml.html", icon: "&#128187;", category: "seo" },
    { name: "Word Frequency", url: "wordfrequency.html", icon: "&#128292;", category: "seo" }
];

const currentPage = window.location.pathname.split("/").pop();

const related = tools
    .filter(tool => tool.url !== currentPage)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

const relatedToolsContainer = document.getElementById("relatedToolsContainer");

if (relatedToolsContainer) {
    relatedToolsContainer.innerHTML = related.map(tool => `
        <a href="${tool.url}" class="tool-card">
            <div class="tool-icon">${tool.icon}</div>
            <h3>${tool.name}</h3>
        </a>
    `).join("");
}

