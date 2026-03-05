document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    const uploadBtn = document.getElementById("uploadBtn");
    const cvInput = document.getElementById("cvInput");
    const fileNameDisplay = document.getElementById("fileNameDisplay");

    // 1. Sidebar Toggle Logic
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
    });

    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    });

    // 2. Active State & Tooltips
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);

        item.addEventListener("click", () => {
            document.querySelector(".menu-item.active")?.classList.remove("active");
            item.classList.add("active");
        });
    });

    // 3. File Upload Logic
    if (uploadBtn && cvInput) {
        uploadBtn.addEventListener("click", () => cvInput.click());
        cvInput.addEventListener("change", () => {
            if (cvInput.files.length > 0) {
                fileNameDisplay.textContent = cvInput.files[0].name;
            } else {
                fileNameDisplay.textContent = "File_Name.pdf";
            }
        });
    }
});