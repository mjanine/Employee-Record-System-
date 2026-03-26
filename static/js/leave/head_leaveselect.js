document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // Close button (adds collapsed class)
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
    });

    // Logo click (removes collapsed class)
    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    });

    // Tooltip text injection and Active state
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            const text = span.innerText;
            item.setAttribute("data-text", text);
        }

        item.addEventListener("click", () => {
            document.querySelector(".menu-item.active")?.classList.remove("active");
            item.classList.add("active");
        });
    });
});