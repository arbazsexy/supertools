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

        const title = dropArea.querySelector(".drop-title");
        const meta = dropArea.querySelector(".drop-meta");

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

        const title = dropArea.querySelector(".drop-title");
        const meta = dropArea.querySelector(".drop-meta");

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

        const title = dropArea.querySelector(".drop-title");
        const meta = dropArea.querySelector(".drop-meta");
        const count = files.length;
        const firstFile = files[0];

        if (title) {
            title.textContent = count === 1 ? "Image selected successfully" : `${count} images selected successfully`;
        }

        if (meta) {
            meta.textContent = count === 1
                ? `${firstFile.name} is ready to use.`
                : `${firstFile.name} and ${count - 1} more are ready to use.`;
        }

        dropArea.classList.add("has-selection");
    }

    function updateSingleInput(input) {
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

        const countText = files.length === 1 ? "1 image selected" : `${files.length} images selected`;
        const namesText = files.length === 1
            ? files[0].name
            : `${files[0].name} and ${files.length - 1} more`;
        const sizeText = files.length === 1 && files[0].size
            ? ` (${formatBytes(files[0].size)})`
            : "";

        note.innerHTML = `<strong>${countText}</strong><span>${namesText}${sizeText}</span>`;
        note.classList.add("is-visible");
    }

    function updateAllInputs() {
        document.querySelectorAll('input[type="file"]').forEach(updateSingleInput);
    }

    function attachListeners() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        if (!fileInputs.length) {
            return;
        }

        fileInputs.forEach((input) => {
            const card = input.closest(".image-tool-card") || input.closest(".container") || input.parentElement;
            const dropArea = card ? card.querySelector(".image-drop-zone") : null;
            rememberDropCopy(dropArea);
            ensureFeedbackNote(input, dropArea);
            input.addEventListener("change", () => updateSingleInput(input));
        });

        document.querySelectorAll("#clearBtn, .clear-btn, [onclick*='clearAll'], [onclick*='clearFields']").forEach((button) => {
            button.addEventListener("click", () => {
                setTimeout(updateAllInputs, 0);
            });
        });

        document.querySelectorAll("#sampleBtn, [onclick*='loadSample'], [onclick*='loadSampleMessage']").forEach((button) => {
            button.addEventListener("click", () => {
                setTimeout(updateAllInputs, 0);
            });
        });

        updateAllInputs();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachListeners, { once: true });
    } else {
        attachListeners();
    }
})();
