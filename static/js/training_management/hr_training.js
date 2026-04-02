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
    // Handle case where the table might not exist on the current page
    const rows = tableBody ? tableBody.querySelectorAll("tr:not(#noResultsRow)") : [];

    const modal = document.getElementById("addTrainingModal");
    const addTrainingBtn = document.getElementById("addTrainingBtn");
    const modalClose = document.getElementById("modalClose");
    const cancelBtn = document.getElementById("cancelBtn");
    const addTrainingForm = document.getElementById("addTrainingForm");

    const viewModal = document.getElementById("viewTrainingModal");
    const viewModalCancel = document.getElementById("viewModalCancel");
    const viewModalCloseStatus = document.getElementById("viewModalCloseStatus");


    // --- Sidebar Toggle (IMPROVED) ---
    // Best practice: Let CSS handle the margin transitions via the `.collapsed` class.
    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    if (logoToggle && sidebar) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // --- Tooltip Text for Collapsed Sidebar ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    // --- Search / Filter ---
    if (searchInput && rows.length > 0) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            let visibleCount = 0;

            rows.forEach(row => {
                const match = row.innerText.toLowerCase().includes(filter);
                row.style.display = match ? "" : "none";
                if (match) visibleCount++;
            });

            if (noResultsRow) {
                noResultsRow.style.display = visibleCount === 0 ? "" : "none";
            }
        });
    }

    // --- Add Training Modal Open / Close ---
    const openModal = () => { if (modal) modal.style.display = "flex"; };
    const closeModal = () => { if (modal) modal.style.display = "none"; };

    if (addTrainingBtn) addTrainingBtn.addEventListener("click", openModal);
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);


    // --- View Training Modal ---
    const trainingData = {
        "001": {
            name: "Outcomes-Based Education Workshop",
            meta: "Teaching &nbsp;|&nbsp; Onsite &nbsp;|&nbsp; March 12, 2026",
            status: "open",
            statusLabel: "Open",
            description: "College of Computer Studies",
            trainer: "CCS - 201",
            location: "Main building 2nd floor",
            maxSlots: "30",
            slotsFilled: "25 / 30"
        },
        "002": {
            name: "Research Writing Seminar",
            meta: "Research &nbsp;|&nbsp; Online &nbsp;|&nbsp; March 20, 2026",
            status: "full",
            statusLabel: "Full",
            description: "Research writing and publication skills",
            trainer: "Dr. Santos",
            location: "Zoom / Online",
            maxSlots: "30",
            slotsFilled: "30 / 30"
        },
        "003": {
            name: "Faculty Development Program",
            meta: "Development &nbsp;|&nbsp; Onsite &nbsp;|&nbsp; Feb. 28, 2026",
            status: "completed",
            statusLabel: "Completed",
            description: "Annual faculty development seminar",
            trainer: "External Agency",
            location: "Auditorium",
            maxSlots: "20",
            slotsFilled: "20 / 20"
        },
        "004": {
            name: "Safety & Emergency Response Training",
            meta: "Safety &nbsp;|&nbsp; Onsite &nbsp;|&nbsp; March 5, 2026",
            status: "cancelled",
            statusLabel: "Cancelled",
            description: "Emergency procedures and safety protocols",
            trainer: "Safety Officer",
            location: "Gymnasium",
            maxSlots: "25",
            slotsFilled: "15 / 25"
        }
    };

    const openViewModal = (id) => {
        const data = trainingData[id];
        if (!data || !viewModal) return;

        document.getElementById("viewTrainingName").textContent = data.name;
        document.getElementById("viewTrainingMeta").innerHTML = data.meta;
        document.getElementById("viewDescription").textContent = data.description;
        document.getElementById("viewTrainer").textContent = data.trainer;
        document.getElementById("viewLocation").textContent = data.location;
        document.getElementById("viewMaxSlots").textContent = data.maxSlots;
        document.getElementById("viewSlotsFilled").textContent = data.slotsFilled;

        const statusBadge = document.getElementById("viewTrainingStatus");
        if (statusBadge) {
            statusBadge.className = `status-badge ${data.status} view-status-badge`;
            statusBadge.textContent = data.statusLabel;
        }

        viewModal.style.display = "flex";
    };

    const closeViewModal = () => { if (viewModal) viewModal.style.display = "none"; };

    // Wire up all "View" links in the table
    document.querySelectorAll(".action-links a:first-child").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const row = e.target.closest("tr");
            const id = row.querySelector("td:first-child").textContent.trim();
            openViewModal(id);
        });
    });

    if (viewModalCancel) viewModalCancel.addEventListener("click", closeViewModal);
    if (viewModalCloseStatus) viewModalCloseStatus.addEventListener("click", closeViewModal);

    // Close on backdrop click or Escape
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
        if (e.target === viewModal) closeViewModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal();
            closeViewModal();
        }
    });

    // --- Form Submission ---
    if (addTrainingForm) {
        addTrainingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Training saved successfully.");
            closeModal();
        });
    }
});