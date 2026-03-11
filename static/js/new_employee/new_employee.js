document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("applicationTableBody");
    const noResultsRow = document.getElementById("noResultsRow");
    const rows = tableBody.querySelectorAll("tr:not(#noResultsRow)");

    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");
    const posForm = document.getElementById("positionChangeForm");

    const newEmpTabBtn = document.getElementById("newEmpTabBtn");
    const posChangeTabBtn = document.getElementById("posChangeTabBtn");

    const statusBanner = document.querySelector(".timeline-status-banner");
    const statusTimelineBox = document.getElementById("statusTimelineBox");
    const submissionTimestamp = document.getElementById("submissionTimestamp");

    // --- Search Functionality ---
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(filter)) {
                    row.style.display = "";
                    visibleCount++;
                } else {
                    row.style.display = "none";
                }
            });

            if (noResultsRow) {
                noResultsRow.style.display = visibleCount === 0 ? "" : "none";
            }
        });
    }

    // --- Sidebar Logic ---
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            if (mainContent) mainContent.style.marginLeft = "110px";
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                if (mainContent) mainContent.style.marginLeft = "320px";
            }
        });
    }

    // --- Modal Management ---
    const openModal = (modal) => {
        if (modal) modal.style.display = "flex";
    };

    const closeAllModals = () => {
        [viewModal, posModal].forEach(m => { if (m) m.style.display = "none"; });
    };

    // View Modal Trigger
    document.querySelectorAll(".view-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showSlide(1);
            openModal(viewModal);
        });
    });

    // Close Buttons
    document.querySelectorAll(".modal-close, #cancelRequest").forEach(btn => {
        btn.addEventListener("click", closeAllModals);
    });

    // --- Tab Switching ---
    const setActiveTab = (clicked, other) => {
        clicked.classList.add("active");
        clicked.classList.remove("secondary");
        other.classList.add("secondary");
        other.classList.remove("active");
    };

    if (newEmpTabBtn && posChangeTabBtn) {
        newEmpTabBtn.addEventListener("click", () => setActiveTab(newEmpTabBtn, posChangeTabBtn));
        posChangeTabBtn.addEventListener("click", () => {
            setActiveTab(posChangeTabBtn, newEmpTabBtn);
            openModal(posModal);
        });
    }

    // --- Slide Control (View Modal) ---
    function showSlide(n) {
        const s1 = document.getElementById("slide1");
        const s2 = document.getElementById("slide2");
        if (n === 1) {
            s1?.classList.add("active");
            s2?.classList.remove("active");
        } else {
            s1?.classList.remove("active");
            s2?.classList.add("active");
        }
    }

    document.getElementById("nextSlide")?.addEventListener("click", () => showSlide(2));
    document.getElementById("prevSlide")?.addEventListener("click", () => showSlide(1));

    // --- Form Submission (Position Change) ---
    if (posForm) {
        posForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            if (submissionTimestamp && statusTimelineBox) {
                submissionTimestamp.innerText = `${dateStr} - ${timeStr}`;
                statusTimelineBox.style.display = "block";
            }

            const selectedPos = posForm.querySelector('select').value;
            if (statusBanner && selectedPos) {
                statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> Pending - For ${selectedPos} Approval`;
            }

            alert("Success: Position change request logged.");
            closeAllModals();
        });
    }

    // Global Close (Click Outside or Esc Key)
    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
});