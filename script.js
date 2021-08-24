document.addEventListener("DOMContentLoaded", () => {
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((heading) => {
        document.querySelectorAll(heading).forEach((x) => {
            const link = x.id;
            if (link) {
                x.outerHTML = `<div style="display: flex; gap: 1rem;"><a class="${x.tagName.toLowerCase()}" href="#${link}">#</a>${
                    x.outerHTML
                }</div>`;
            }
        });
    });

    document.querySelectorAll("code").forEach((x) => {
        const lang = [...x.classList.values()].find((x) =>
            x.startsWith("language-")
        );
        if (lang) {
            x.setAttribute("data-code-language", lang.replace("language-", ""));
        }
    });
});
