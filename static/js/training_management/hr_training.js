document.addEventListener("DOMContentLoaded", () => {

    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const menuItems = document.querySelectorAll(".menu-item");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("trainingTableBody");
    const noResultsRow = document.getElementById("noResultsRow");
    const rows = tableBody.querySelectorAll("tr:not(#noResultsRow)");

    const modal = document.getElementById("addTrainingModal");
    const addTrainingBtn = document.getElementById("addTrainingBtn");
    const modalClose = document.getElementById("modalClose");
    const cancelBtn = document.getElementById("cancelBtn");
    const addTrainingForm = document.getElementById("addTrainingForm");

    // --- Sidebar Toggle ---
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
        mainContent.style.marginLeft = "110px";
    });

    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
            mainContent.style.marginLeft = "340px";
        }
    });

    // --- Tooltip Text for Collapsed Sidebar ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    // --- Search / Filter ---
    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        let visibleCount = 0;

        rows.forEach(row => {
            const match = row.innerText.toLowerCase().includes(filter);
            row.style.display = match ? "" : "none";
            if (match) visibleCount++;
        });

        noResultsRow.style.display = visibleCount === 0 ? "" : "none";
    });

    // --- Modal Open / Close ---
    const openModal = () => modal.style.display = "flex";
    const closeModal = () => modal.style.display = "none";

    addTrainingBtn.addEventListener("click", openModal);
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // Close on backdrop click
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // --- Form Submission ---
    addTrainingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Training saved successfully.");
        closeModal();
    });

});