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
            .map(line => line.replace(/[ \t]+/g, " ").trim())
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

function convertToText() {
    const htmlInput = document.getElementById("htmlInput").value;
    const preserveLines = document.getElementById("preserveLines").checked;
    const collapseSpaces = document.getElementById("collapseSpaces").checked;
    const removeBlankLines = document.getElementById("removeBlankLines").checked;
    const result = document.getElementById("result");

    if (!htmlInput.trim()) {
        result.innerHTML = `<div class="average-result result-pop"><strong>Please paste some HTML code first.</strong></div>`;
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");

    doc.querySelectorAll("script, style, noscript, iframe, object, svg, canvas, template, head, title, meta").forEach(el => el.remove());

    if (preserveLines) {
        doc.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
        const blockSelectors = "p, div, section, article, header, footer, aside, main, nav, li, ul, ol, table, tr, h1, h2, h3, h4, h5, h6, blockquote, pre";
        doc.querySelectorAll(blockSelectors).forEach(el => {
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
        <div class="average-result result-pop">
            <div class="stats">
                <div class="stat-box">Characters<br>${charCount.toLocaleString()}</div>
                <div class="stat-box">Words<br>${wordCount.toLocaleString()}</div>
                <div class="stat-box">Lines<br>${lineCount.toLocaleString()}</div>
            </div>

            <hr>

            <div><strong>Plain Text Output</strong></div>
            <textarea id="textOutput" class="code-output result-textarea" rows="12" readonly></textarea>

            <div class="button-group">
                <button type="button" class="action-btn copy-btn" onclick="copyTextOutput()">
                    <i class="fas fa-copy"></i> Copy Text
                </button>

                <button type="button" class="action-btn secondary-btn" onclick="downloadText()">
                    <i class="fas fa-download"></i> Download TXT
                </button>
            </div>
        </div>
    `;

    document.getElementById("textOutput").value = text;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadText() {
    const output = document.getElementById("textOutput");
    if (!output || !output.value.trim()) {
        alert("No text to download.");
        return;
    }

    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearFields() {
    document.getElementById("htmlInput").value = "";
    document.getElementById("result").innerHTML = "";
}

function loadSample() {
    const sampleHtml = [
        '<!DOCTYPE html>',
        '<html>',
        '<body>',
        '    <h1>Sample Page</h1>',
        '    <p>This is a <strong>sample</strong> paragraph with a <a href="#">link</a>.</p>',
        '    <ul>',
        '        <li>Item 1</li>',
        '        <li>Item 2</li>',
        '    </ul>',
        '</body>',
        '</html>'
    ].join('\n');

    document.getElementById("htmlInput").value = sampleHtml;
    convertToText();
}

function copyTextOutput() {
    const output = document.getElementById("textOutput");
    if (!output || !output.value.trim()) {
        alert("No text to copy.");
        return;
    }

    navigator.clipboard.writeText(output.value)
        .then(() => alert("Text copied to clipboard!"))
        .catch(() => alert("Failed to copy text."));
}

function copyResult() {
    copyTextOutput();
}

const tools = [
    { name: "Meta Tag Generator", url: "metataggenerator.html", icon: "ðŸ·ï¸", category: "seo" },
    { name: "Open Graph Generator", url: "opengraphgenerator.html", icon: "ðŸ”—", category: "seo" },
    { name: "Robots.txt Generator", url: "robotstxtgenerator.html", icon: "ðŸ¤–", category: "seo" },
    { name: "Sitemap Generator", url: "sitemapgenerator.html", icon: "ðŸ—ºï¸", category: "seo" },
    { name: "URL Slug Generator", url: "urlsluggenerator.html", icon: "âœï¸", category: "seo" },
    { name: "Schema Generator", url: "schemagenerator.html", icon: "ðŸ“„", category: "seo" },
    { name: "Keyword Density Checker", url: "keyworddensitychecker.html", icon: "ðŸ“Š", category: "seo" },
    { name: "Hreflang Generator", url: "hreflanggenerator.html", icon: "ðŸŒ", category: "seo" },
    { name: "HTML TO Text", url: "htmltotext.html", icon: "ðŸ§¾", category: "seo" },
    { name: "TEXT TO HTML", url: "texttohtml.html", icon: "ðŸ’»", category: "seo" },
    { name: "Word Frequency", url: "wordfrequency.html", icon: "ðŸ”¤", category: "seo" }
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
