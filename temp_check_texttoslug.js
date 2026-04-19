const inputText = document.getElementById("inputText");
const removeNumbers = document.getElementById("removeNumbers");
const strictMode = document.getElementById("strictMode");
const transliterate = document.getElementById("transliterate");
const separator = document.getElementById("separator");
const customSeparator = document.getElementById("customSeparator");
const urlBase = document.getElementById("urlBase");
const resultBox = document.getElementById("result");
const liveSlugPreview = document.getElementById("liveSlugPreview");
const liveUrlPreview = document.getElementById("liveUrlPreview");

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toggleCustomSeparator() {
    customSeparator.disabled = separator.value !== "custom";
}

function getSeparatorValue() {
    if (separator.value === "custom") {
        return customSeparator.value || "-";
    }
    return separator.value;
}

function slugify(text, stripNumbers, strict, doTransliterate, sep) {
    let value = text;

    if (doTransliterate) {
        value = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    value = value.toLowerCase();

    if (stripNumbers) {
        value = value.replace(/\d+/g, "");
    }

    if (strict) {
        value = value.replace(/[^a-z\s_-]/g, " ");
    } else {
        value = value.replace(/[^a-z0-9\s_-]/g, " ");
    }

    value = value.replace(/[_\s-]+/g, sep);
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    value = value.replace(new RegExp(escapedSep + "+", "g"), sep);
    value = value.replace(new RegExp("^" + escapedSep + "+|" + escapedSep + "+$", "g"), "");

    return value;
}

function buildFullUrl(base, slug) {
    let cleanBase = base.trim();
    if (!cleanBase) cleanBase = "https://supertools1.site/";
    if (!cleanBase.endsWith("/")) cleanBase += "/";
    return cleanBase + slug;
}

function updateLivePreview() {
    const slug = slugify(
        inputText.value,
        removeNumbers.checked,
        strictMode.checked,
        transliterate.checked,
        getSeparatorValue()
    );

    liveSlugPreview.value = slug || "";
    liveUrlPreview.value = slug ? buildFullUrl(urlBase.value, slug) : "";
}

function scrollToResult() {
    const topUiSelectors = [
        "header",
        "nav",
        ".navbar",
        ".topbar",
        ".site-nav",
        ".main-nav",
        ".nav-container",
        ".age-jumpbar-wrap"
    ];

    const stickyHeight = topUiSelectors.reduce((total, selector) => {
        const element = document.querySelector(selector);
        if (!element) return total;

        const styles = window.getComputedStyle(element);
        const isTopUi = (styles.position === "sticky" || styles.position === "fixed") && element.getBoundingClientRect().bottom > 0;
        if (!isTopUi) return total;

        if (selector === ".age-jumpbar-wrap" && window.innerWidth <= 960) {
            return total;
        }

        return total + element.getBoundingClientRect().height;
    }, 0);

    const offset = stickyHeight + 28;
    const targetTop = window.scrollY + resultBox.getBoundingClientRect().top - offset;

    window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth"
    });
}

function convertToSlug() {
    const text = inputText.value;

    if (!text.trim()) {
        resultBox.innerHTML = `
            <div class="average-result">
                <strong>Please enter some text.</strong>
            </div>
        `;
        scrollToResult();
        return;
    }

    if (text.length > 1000000) {
        resultBox.innerHTML = `
            <div class="average-result">
                <strong>Please use input under 1,000,000 characters for this browser-based tool.</strong>
            </div>
        `;
        scrollToResult();
        return;
    }

    const sep = getSeparatorValue();
    const slug = slugify(text, removeNumbers.checked, strictMode.checked, transliterate.checked, sep);

    if (!slug) {
        resultBox.innerHTML = `
            <div class="average-result">
                <strong>The slug result is empty. Try text with more letters or adjust the cleanup options.</strong>
            </div>
        `;
        scrollToResult();
        return;
    }

    const fullUrl = buildFullUrl(urlBase.value, slug);

    resultBox.innerHTML = `
        <div class="average-result">
            <div class="age-summary">
                <div class="age-result-intro">
                    <p>
                        Your slug has been generated successfully. Review the result below, then copy it or copy the full URL
                        for use in blogs, tool pages, landing pages, products, or category links.
                    </p>
                </div>

                <div class="age-summary-banner">
                    <h3>Slug Ready</h3>
                    <p>
                        <strong>${slug}</strong><br>
                        <span>Separator: ${escapeHtml(sep)} | Remove numbers: ${removeNumbers.checked ? "Yes" : "No"} | Strict mode: ${strictMode.checked ? "Yes" : "No"}</span>
                    </p>
                </div>

                <div class="stats">
                    <div class="stat-box">Slug Length<br><span>${slug.length}</span></div>
                    <div class="stat-box">Words<br><span>${slug.split(sep).filter(Boolean).length}</span></div>
                    <div class="stat-box">Separators<br><span>${(slug.match(new RegExp(escapeForRegex(sep), "g")) || []).length}</span></div>
                    <div class="stat-box">Lowercase<br><span>Yes</span></div>
                </div>

                <div class="age-milestone-card">
                    <h3>Slug Output</h3>
                    <p>Review your clean URL-ready slug and full URL preview below.</p>
                    <textarea id="outputText" class="code-output result-textarea" rows="3" readonly>${escapeHtml(slug)}</textarea>
                    <textarea id="fullUrlOutput" class="code-output result-textarea" rows="3" readonly style="margin-top:10px;">${escapeHtml(fullUrl)}</textarea>
                </div>
            </div>
        </div>
    `;

    scrollToResult();
}

function escapeForRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function copyResult() {
    const output = document.getElementById("outputText");
    if (!output) {
        alert("No slug to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        alert("Slug copied to clipboard!");
    } catch (error) {
        output.select();
        document.execCommand("copy");
        alert("Slug copied to clipboard!");
    }
}

async function copyFullUrl() {
    const full = document.getElementById("fullUrlOutput") || liveUrlPreview;

    if (!full || !full.value) {
        alert("No full URL to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(full.value);
        alert("Full URL copied to clipboard!");
    } catch (error) {
        full.select();
        document.execCommand("copy");
        alert("Full URL copied to clipboard!");
    }
}

function clearFields() {
    inputText.value = "";
    removeNumbers.checked = false;
    strictMode.checked = false;
    transliterate.checked = true;
    separator.value = "-";
    customSeparator.value = "";
    customSeparator.disabled = true;
    urlBase.value = "https://supertools1.site/";
    resultBox.innerHTML = "";
    updateLivePreview();
    inputText.focus();
}

function loadSample() {
    inputText.value = "Free Online Text To Slug Tool - 2026 Edition!";
    removeNumbers.checked = false;
    strictMode.checked = false;
    transliterate.checked = true;
    separator.value = "-";
    customSeparator.value = "";
    customSeparator.disabled = true;
    urlBase.value = "https://supertools1.site/tools/";
    updateLivePreview();
    convertToSlug();
}

function downloadResult() {
    const output = document.getElementById("outputText");

    if (!output) {
        alert("No slug to download.");
        return;
    }

    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "slug-output.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

document.addEventListener("DOMContentLoaded", () => {
    toggleCustomSeparator();
    updateLivePreview();

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

        accButtons.forEach(otherBtn => {
            otherBtn.classList.remove("active");
            if (otherBtn.nextElementSibling) {
                otherBtn.nextElementSibling.classList.remove("open");
            }
        });

        if (!isOpen) {
            btn.classList.add("active");
            content.classList.add("open");
        }
    });
});

const tools = [
    { name: "Text Converter", url: "textconverter.html", icon: "&#128260;", desc: "Convert text into multiple case formats instantly." },
    { name: "Word Counter", url: "wordcounter.html", icon: "&#128207;", desc: "Count words, characters, and text length quickly." },
    { name: "Character Remover", url: "characterremover.html", icon: "&#129529;", desc: "Remove unwanted characters from text quickly." },
    { name: "Remove Line Breaks", url: "removelinebreaks.html", icon: "&#128683;", desc: "Flatten text by removing line breaks instantly." },
    { name: "Text to Slug", url: "texttoslug.html", icon: "&#128279;", desc: "Turn text into clean URL-friendly slugs." },
    { name: "Case Alternator", url: "casealternator.html", icon: "&#128288;", desc: "Convert text into alternating upper and lower case patterns." },
    { name: "Text Sorter", url: "textsorter.html", icon: "&#128292;", desc: "Sort lines or items alphabetically in seconds." },
    { name: "Remove Duplicate Lines", url: "removeduplicatelines.html", icon: "&#129529;", desc: "Clean repeated lines from long text blocks quickly." }
];

const currentPage = window.location.pathname.split("/").pop();

const preferredRelated = {
    "texttoslug.html": ["textconverter.html", "wordcounter.html", "characterremover.html", "removelinebreaks.html"]
};

const preferredUrls = preferredRelated[currentPage] || [];

const related = [
    ...preferredUrls.map(url => tools.find(tool => tool.url === url)).filter(Boolean),
    ...tools.filter(tool => tool.url !== currentPage && !preferredUrls.includes(tool.url))
].slice(0, 4);

const container = document.getElementById("relatedToolsContainer");

if (container) {
    container.innerHTML = related.map(tool => `
        <a href="${tool.url}" class="tool-card age-related-card">
            <div class="age-related-icon">${tool.icon}</div>
            <div class="age-related-body">
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            </div>
            <div class="age-related-cta">Open &#8594;</div>
        </a>
    `).join("");
}
