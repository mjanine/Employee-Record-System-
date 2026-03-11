document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const menuItems = document.querySelectorAll(".menu-item");

    // --- Sidebar Toggle ---
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
        if (mainContent) mainContent.style.marginLeft = "100px";
    });

    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
            if (mainContent) mainContent.style.marginLeft = "340px";
        }
    });

    // --- Tooltip text for collapsed sidebar ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    // --- Search / Filter Training Cards ---
    const searchInput = document.getElementById("trainingSearch");
    const cards = document.querySelectorAll(".training-card");

    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "" : "none";
            });
        });
    }

    // --- Register Button ---
    document.querySelectorAll(".btn-register:not(.btn-register--disabled)").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".training-card");
            const name = card.querySelector(".training-card-title").textContent;
            alert(`Registered for: ${name}`);
        });
    });

});