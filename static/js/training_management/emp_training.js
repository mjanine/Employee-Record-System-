document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const closeBtn = document.getElementById("closeBtn");
    const logoToggle = document.getElementById("logoToggle");
    
    const modal = document.getElementById("detailModal");
    const closeModal = document.getElementById("closeModal");
    const viewButtons = document.querySelectorAll(".open-details");

    // --- Sidebar Logic ---
    const toggleSidebar = () => {
        sidebar.classList.toggle("collapsed");
    };

    closeBtn.addEventListener("click", toggleSidebar);
    logoToggle.addEventListener("click", () => {
        if(sidebar.classList.contains("collapsed")) toggleSidebar();
    });

    // --- Modal Logic ---
    viewButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close modal if user clicks on the dark background
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});