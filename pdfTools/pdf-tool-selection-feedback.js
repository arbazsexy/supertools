(() => {
    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return "";
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function ensureFeedbackNote(input, dropArea) {
        const host = dropArea || input;
        let note = host.parentElement ? host.parentElement.querySelector(".image-selection-note") : null;

        if (!note) {
            note = document.createElement("div");
            note.className = "image-selection-note";

            if (dropArea && dropArea.parentElement) {
                dropArea.insertAdjacentElement("afterend", note);
            } else {
                input.insertAdjacentElement("afterend", note);
            }
        }

        return note;
    }

    function rememberDropCopy(dropArea) {
        if (!dropArea) {
            return;
        }

        const title = dropArea.querySelector("strong");
        const meta = dropArea.querySelector("p");

        if (title && !title.dataset.defaultText) {
            title.dataset.defaultText = title.textContent.trim();
        }

        if (meta && !meta.dataset.defaultText) {
            meta.dataset.defaultText = meta.textContent.trim();
        }
    }

    function restoreDropCopy(dropArea) {
        if (!dropArea) {
            return;
        }

        const title = dropArea.querySelector("strong");
        const meta = dropArea.querySelector("p");

        if (title && title.dataset.defaultText) {
            title.textContent = title.dataset.defaultText;
        }

        if (meta && meta.dataset.defaultText) {
            meta.textContent = meta.dataset.defaultText;
        }

        dropArea.classList.remove("has-selection");
    }

    function updateDropCopy(dropArea, files) {
        if (!dropArea) {
            return;
        }

        rememberDropCopy(dropArea);

        const title = dropArea.querySelector("strong");
        const meta = dropArea.querySelector("p");
        const count = files.length;
        const firstFile = files[0];

        if (title) {
            title.textContent = count === 1 ? "PDF selected successfully" : `${count} PDFs selected successfully`;
        }

        if (meta) {
            meta.textContent = count === 1
                ? `${firstFile.name} is ready to process.`
                : `${firstFile.name} and ${count - 1} more are ready to process.`;
        }

        dropArea.classList.add("has-selection");
    }

    function updateInputState(input) {
        const files = Array.from(input.files || []);
        const card = input.closest(".image-tool-card") || input.closest(".container") || input.parentElement;
        const dropArea = card ? card.querySelector(".image-drop-zone") : null;
        const note = ensureFeedbackNote(input, dropArea);

        if (!files.length) {
            restoreDropCopy(dropArea);
            note.classList.remove("is-visible");
            note.innerHTML = "";
            return;
        }

        updateDropCopy(dropArea, files);

        const countLabel = files.length === 1 ? "1 PDF selected" : `${files.length} PDFs selected`;
        const nameLabel = files.length === 1 ? files[0].name : `${files[0].name} and ${files.length - 1} more`;
        const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const sizeLabel = totalBytes ? ` (${formatBytes(totalBytes)})` : "";

        note.innerHTML = `<strong>${countLabel}</strong><span>${nameLabel}${sizeLabel}</span>`;
        note.classList.add("is-visible");
    }

    function updateAllInputs() {
        document.querySelectorAll('input[type="file"]').forEach(updateInputState);
    }

    function attach() {
        const inputs = document.querySelectorAll('input[type="file"]');
        if (!inputs.length) {
            return;
        }

        inputs.forEach((input) => {
            const card = input.closest(".image-tool-card") || input.closest(".container") || input.parentElement;
            const dropArea = card ? card.querySelector(".image-drop-zone") : null;
            rememberDropCopy(dropArea);
            ensureFeedbackNote(input, dropArea);
            input.addEventListener("change", () => updateInputState(input));
        });

        document.querySelectorAll("#clearBtn, .clear-btn, [onclick*='clearFiles'], [onclick*='clearAll'], [onclick*='clearFields']").forEach((button) => {
            button.addEventListener("click", () => setTimeout(updateAllInputs, 0));
        });

        document.querySelectorAll("#sampleBtn, [onclick*='loadSample'], [onclick*='showTips']").forEach((button) => {
            button.addEventListener("click", () => setTimeout(updateAllInputs, 0));
        });

        updateAllInputs();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attach, { once: true });
    } else {
        attach();
    }
})();
