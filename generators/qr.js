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

let lastQrContent = "";
let lastQrSvg = "";
let lastQrPngData = "";
let uploadedLogoDataUrl = "";

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getQrTypeLabel(type) {
    const labels = {
        url: "URL",
        text: "TEXT",
        email: "EMAIL",
        phone: "PHONE",
        sms: "SMS",
        wifi: "WIFI",
        vcard: "VCARD"
    };

    return labels[type] || type.toUpperCase();
}

function fallbackCopyText(text) {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    helper.style.pointerEvents = "none";
    document.body.appendChild(helper);
    helper.focus();
    helper.select();

    let copied = false;
    try {
        copied = document.execCommand("copy");
    } catch (error) {
        copied = false;
    }

    document.body.removeChild(helper);
    return copied;
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        if (fallbackCopyText(text)) {
            resolve();
            return;
        }

        reject(new Error("Clipboard copy failed"));
    });
}

document.getElementById("logoUpload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) {
        uploadedLogoDataUrl = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        uploadedLogoDataUrl = ev.target.result;
    };
    reader.readAsDataURL(file);
});

function updateQrFields() {
    const type = document.getElementById("qrType").value;
    const dynamicFields = document.getElementById("dynamicFields");

    if (type === "url") {
        dynamicFields.innerHTML = `
            <label for="qrUrl">Enter URL</label>
            <input type="text" id="qrUrl" placeholder="https://example.com" aria-label="Enter URL">
        `;
    } else if (type === "text") {
        dynamicFields.innerHTML = `
            <label for="qrText">Enter text</label>
            <textarea id="qrText" rows="5" placeholder="Type your text here..." aria-label="Enter text"></textarea>
        `;
    } else if (type === "email") {
        dynamicFields.innerHTML = `
            <label for="qrEmail">Email address</label>
            <input type="email" id="qrEmail" placeholder="name@example.com" aria-label="Enter email address">

            <label for="qrSubject">Email subject (optional)</label>
            <input type="text" id="qrSubject" placeholder="Subject" aria-label="Enter email subject">

            <label for="qrBody">Email message (optional)</label>
            <textarea id="qrBody" rows="4" placeholder="Message body" aria-label="Enter email message"></textarea>
        `;
    } else if (type === "phone") {
        dynamicFields.innerHTML = `
            <label for="qrPhone">Phone number</label>
            <input type="text" id="qrPhone" placeholder="+91 9876543210" aria-label="Enter phone number">
        `;
    } else if (type === "sms") {
        dynamicFields.innerHTML = `
            <label for="qrSmsNumber">Phone number</label>
            <input type="text" id="qrSmsNumber" placeholder="+91 9876543210" aria-label="Enter SMS phone number">

            <label for="qrSmsMessage">SMS message</label>
            <textarea id="qrSmsMessage" rows="4" placeholder="Type your SMS message..." aria-label="Enter SMS message"></textarea>
        `;
    } else if (type === "wifi") {
        dynamicFields.innerHTML = `
            <label for="qrWifiName">WiFi name (SSID)</label>
            <input type="text" id="qrWifiName" placeholder="MyWiFi" aria-label="Enter WiFi name">

            <label for="qrWifiPassword">WiFi password</label>
            <input type="text" id="qrWifiPassword" placeholder="Password" aria-label="Enter WiFi password">

            <label for="qrWifiEncryption">Encryption type</label>
            <select id="qrWifiEncryption" aria-label="Select WiFi encryption type">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
            </select>

            <label>
                <input type="checkbox" id="qrWifiHidden">
                Hidden network
            </label>
        `;
    } else if (type === "vcard") {
        dynamicFields.innerHTML = `
            <label for="vcardFirstName">First name</label>
            <input type="text" id="vcardFirstName" placeholder="John" aria-label="Enter first name">

            <label for="vcardLastName">Last name</label>
            <input type="text" id="vcardLastName" placeholder="Doe" aria-label="Enter last name">

            <label for="vcardOrg">Organization (optional)</label>
            <input type="text" id="vcardOrg" placeholder="Company Name" aria-label="Enter organization">

            <label for="vcardTitle">Job title (optional)</label>
            <input type="text" id="vcardTitle" placeholder="Designer" aria-label="Enter job title">

            <label for="vcardPhone">Phone (optional)</label>
            <input type="text" id="vcardPhone" placeholder="+91 9876543210" aria-label="Enter vCard phone number">

            <label for="vcardEmail">Email (optional)</label>
            <input type="email" id="vcardEmail" placeholder="name@example.com" aria-label="Enter vCard email">

            <label for="vcardWebsite">Website (optional)</label>
            <input type="text" id="vcardWebsite" placeholder="https://example.com" aria-label="Enter vCard website">

            <label for="vcardAddress">Address (optional)</label>
            <textarea id="vcardAddress" rows="3" placeholder="Street, City, State, ZIP" aria-label="Enter vCard address"></textarea>
        `;
    }
}

function escapeVCard(value) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function escapeWifiValue(value) {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/:/g, "\\:");
}

function buildQrContent() {
    const type = document.getElementById("qrType").value;

    if (type === "url") {
        let url = document.getElementById("qrUrl").value.trim();
        if (!url) return "";
        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }
        return url;
    }

    if (type === "text") {
        return document.getElementById("qrText").value.trim();
    }

    if (type === "email") {
        const email = document.getElementById("qrEmail").value.trim();
        const subject = encodeURIComponent(document.getElementById("qrSubject").value.trim());
        const body = encodeURIComponent(document.getElementById("qrBody").value.trim());

        if (!email) return "";
        let mailto = `mailto:${email}`;
        const params = [];
        if (subject) params.push(`subject=${subject}`);
        if (body) params.push(`body=${body}`);
        if (params.length) mailto += `?${params.join("&")}`;
        return mailto;
    }

    if (type === "phone") {
        const phone = document.getElementById("qrPhone").value.trim();
        return phone ? `tel:${phone}` : "";
    }

    if (type === "sms") {
        const number = document.getElementById("qrSmsNumber").value.trim();
        const message = document.getElementById("qrSmsMessage").value.trim();
        if (!number) return "";
        return `SMSTO:${number}:${message}`;
    }

    if (type === "wifi") {
        const ssid = document.getElementById("qrWifiName").value.trim();
        const password = document.getElementById("qrWifiPassword").value.trim();
        const encryption = document.getElementById("qrWifiEncryption").value;
        const hidden = document.getElementById("qrWifiHidden").checked;

        if (!ssid) return "";
        const safeSsid = escapeWifiValue(ssid);
        const safePassword = escapeWifiValue(password);
        return `WIFI:T:${encryption};S:${safeSsid};P:${safePassword};H:${hidden ? "true" : "false"};;`;
    }

    if (type === "vcard") {
        const first = document.getElementById("vcardFirstName").value.trim();
        const last = document.getElementById("vcardLastName").value.trim();
        const org = document.getElementById("vcardOrg").value.trim();
        const title = document.getElementById("vcardTitle").value.trim();
        const phone = document.getElementById("vcardPhone").value.trim();
        const email = document.getElementById("vcardEmail").value.trim();
        const website = document.getElementById("vcardWebsite").value.trim();
        const address = document.getElementById("vcardAddress").value.trim();

        if (!first && !last && !phone && !email) return "";

        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
            `FN:${escapeVCard((first + " " + last).trim())}`
        ];

        if (org) lines.push(`ORG:${escapeVCard(org)}`);
        if (title) lines.push(`TITLE:${escapeVCard(title)}`);
        if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
        if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
        if (website) lines.push(`URL:${escapeVCard(website)}`);
        if (address) lines.push(`ADR:;;${escapeVCard(address)};;;;`);
        lines.push("END:VCARD");

        return lines.join("\n");
    }

    return "";
}

function renderQrSvg(qr, size, darkColor, lightColor, logoSizePercent, logoDataUrl) {
    const moduleCount = qr.getModuleCount();
    const margin = 4;
    const cell = size / (moduleCount + margin * 2);
    const total = cell * (moduleCount + margin * 2);

    const logoBoxSize = total * (logoSizePercent / 100);
    const logoPadding = logoBoxSize * 0.18;
    const patchSize = logoBoxSize + logoPadding * 2;
    const patchX = (total - patchSize) / 2;
    const patchY = (total - patchSize) / 2;
    const logoX = (total - logoBoxSize) / 2;
    const logoY = (total - logoBoxSize) / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(total)}" height="${Math.round(total)}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">`;
    svg += `<rect width="100%" height="100%" fill="${lightColor}"/>`;

    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
                const x = (col + margin) * cell;
                const y = (row + margin) * cell;
                svg += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${darkColor}"/>`;
            }
        }
    }

    if (logoDataUrl && logoSizePercent > 0) {
        svg += `<rect x="${patchX}" y="${patchY}" width="${patchSize}" height="${patchSize}" rx="${cell}" ry="${cell}" fill="${lightColor}"/>`;
        svg += `<image href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="${logoBoxSize}" height="${logoBoxSize}" preserveAspectRatio="xMidYMid meet"/>`;
    }

    svg += `</svg>`;
    return svg;
}

function renderQrCanvasFromSvg(svgString, callback) {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        callback(canvas);
    };

    img.onerror = function() {
        URL.revokeObjectURL(url);
        callback(null);
    };

    img.src = url;
}

function generateQR() {
    const result = document.getElementById("result");
    const size = parseInt(document.getElementById("qrSize").value, 10);
    const level = document.getElementById("qrLevel").value;
    const foreground = document.getElementById("foregroundColor").value;
    const background = document.getElementById("backgroundColor").value;
    const logoPercent = parseInt(document.getElementById("logoSize").value, 10);
    const content = buildQrContent();

    if (!content) {
        result.innerHTML = `<div class="average-result result-pop"><div style="color:red;"><strong>Please fill in the required content to generate a QR code.</strong></div></div>`;
        return;
    }

    lastQrContent = content;
    lastQrPngData = "";

    const qr = qrcode(0, level);
    qr.addData(content);
    qr.make();

    const svgString = renderQrSvg(qr, size, foreground, background, logoPercent, uploadedLogoDataUrl);
    lastQrSvg = svgString;

    result.innerHTML = `
        <div class="average-result result-pop">
            <div class="status-message"><strong>Your QR Code:</strong></div>

            <div class="qr-preview-card">
                <div id="qrcode" class="qr-code-box"></div>
            </div>

            <div class="stats">
                <div class="stat-box">Type<br>${getQrTypeLabel(document.getElementById("qrType").value)}</div>
                <div class="stat-box">Size<br>${size}px</div>
                <div class="stat-box">Correction<br>${level}</div>
                <div class="stat-box">Logo<br>${logoPercent > 0 && uploadedLogoDataUrl ? "Yes" : "No"}</div>
            </div>

            <hr>

            <div><strong>Encoded Content:</strong></div>
            <textarea id="qrEncodedText" class="result-textarea" rows="5" readonly>${escapeHtml(content)}</textarea>

            <div class="button-group qr-action-group">
                <button type="button" class="action-btn copy-btn" onclick="downloadQRPNG()">Download PNG</button>
                <button type="button" class="action-btn secondary-btn" onclick="downloadQRSVG()">Download SVG</button>
                <button type="button" class="action-btn sample-btn" onclick="printQR()">Print QR</button>
                <button type="button" class="action-btn copy-btn" onclick="copyQrContent()">Copy Content</button>
            </div>
        </div>
    `;

    document.getElementById("qrcode").innerHTML = svgString;

    renderQrCanvasFromSvg(svgString, function(canvas) {
        if (canvas) {
            lastQrPngData = canvas.toDataURL("image/png");
        }
    });

    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadQRPNG() {
    if (!lastQrPngData) {
        alert("Please wait a moment and try again.");
        return;
    }

    const link = document.createElement("a");
    link.href = lastQrPngData;
    link.download = "SuperTools-QRCode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadQRSVG() {
    if (!lastQrSvg) {
        alert("Generate a QR code first.");
        return;
    }

    const blob = new Blob([lastQrSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SuperTools-QRCode.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function printQR() {
    if (!lastQrSvg) {
        alert("Generate a QR code first.");
        return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to print the QR code.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print QR Code</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 30px;
                }
                .print-wrap {
                    display: inline-block;
                    padding: 20px;
                }
                svg {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="print-wrap">
                ${lastQrSvg}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.onload = function() {
        printWindow.print();
    };
}

function copyQrContent() {
    if (!lastQrContent) {
        alert("Nothing to copy yet!");
        return;
    }

    copyTextToClipboard(lastQrContent)
        .then(() => alert("QR content copied to clipboard!"))
        .catch(() => alert("Failed to copy content."));
}

function clearQRTool() {
    document.getElementById("qrType").value = "url";
    document.getElementById("qrSize").value = "220";
    document.getElementById("qrLevel").value = "H";
    document.getElementById("foregroundColor").value = "#000000";
    document.getElementById("backgroundColor").value = "#ffffff";
    document.getElementById("logoSize").value = "22";
    document.getElementById("logoUpload").value = "";
    uploadedLogoDataUrl = "";
    document.getElementById("result").innerHTML = "";
    lastQrContent = "";
    lastQrSvg = "";
    lastQrPngData = "";
    updateQrFields();
}

function loadSampleQR() {
    document.getElementById("qrType").value = "url";
    updateQrFields();
    document.getElementById("qrUrl").value = "https://supertools1.site";
    document.getElementById("qrSize").value = "220";
    document.getElementById("qrLevel").value = "H";
    document.getElementById("foregroundColor").value = "#000000";
    document.getElementById("backgroundColor").value = "#ffffff";
    document.getElementById("logoSize").value = "0";
    generateQR();
}

const tools = [
    { name: "Username Generator", url: "usernamegenerator.html", icon: "User", category: "generator" },
    { name: "Business Name Generator", url: "businessnamegenerator.html", icon: "Biz", category: "generator" },
    { name: "Domain Name Generator", url: "domainnamegenerator.html", icon: "Web", category: "generator" },
    { name: "Hashtag Generator", url: "hashtaggenerator.html", icon: "#", category: "generator" },
    { name: "Random Quote Generator", url: "randomquotegenerator.html", icon: "Quote", category: "generator" },
    { name: "Bio Generator", url: "biogenerator.html", icon: "Bio", category: "generator" },
    { name: "Color Palette Generator", url: "colorpalettegenerator.html", icon: "Color", category: "generator" },
    { name: "Fake Address Generator", url: "fakeaddressgenerator.html", icon: "Addr", category: "generator" },
    { name: "MD5 Generator", url: "md5-generator.html", icon: "MD5", category: "generator" },
    { name: "QR Code Generator", url: "qr.html", icon: "QR", category: "generator" },
    { name: "Random Emoji Generator", url: "randomemojigenerator.html", icon: "Emoji", category: "generator" },
    { name: "Random Name Generator", url: "randomnamegenerator.html", icon: "Name", category: "generator" },
    { name: "Random Number Generator", url: "randomnumber.html", icon: "123", category: "generator" },
    { name: "UUID Generator", url: "uuidgenerator.html", icon: "ID", category: "generator" }
];

const currentPage = window.location.pathname.split("/").pop();

const related = tools
    .filter(tool => tool.url !== currentPage)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

const container = document.getElementById("relatedToolsContainer");

if (container) {
    container.innerHTML = related.map(tool => `
        <a href="${tool.url}" class="tool-card">
            <div class="tool-icon">${tool.icon}</div>
            <h3>${tool.name}</h3>
        </a>
    `).join("");
}

updateQrFields();
