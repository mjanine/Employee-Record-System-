document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");
    const posForm = document.getElementById("positionChangeForm");

    // Dynamic Display Elements
    const statusBanner = document.querySelector(".timeline-status-banner");
    const timelineList = document.querySelector(".timeline-list");
    const positionSelect = document.querySelector('#positionChangeForm select');
    
    // Status Timeline Elements (New)
    const statusTimelineBox = document.getElementById("statusTimelineBox");
    const submissionTimestamp = document.getElementById("submissionTimestamp");

    /* --- Sidebar Logic --- */
    if (closeBtn) {
        closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
    }
    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) sidebar.classList.remove("collapsed");
        });
    }

    /* --- Modal Navigation & Display --- */
    const openViewModal = () => {
        if (viewModal) {
            showSlide(1); 
            viewModal.style.display = "flex";
        }
    };

    const openPosModal = () => {
        if (posModal) posModal.style.display = "flex";
    };

    const closeAllModals = () => {
        if (viewModal) viewModal.style.display = "none";
        if (posModal) posModal.style.display = "none";
    };

    // Event Listeners for Opening/Closing
    document.querySelectorAll(".view-link").forEach(link => link.addEventListener("click", (e) => {
        e.preventDefault();
        openViewModal();
    }));

    document.getElementById("posChangeTabBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        openPosModal();
    });

    document.getElementById("modalClose")?.addEventListener("click", closeAllModals);
    document.getElementById("posClose")?.addEventListener("click", closeAllModals);
    document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

    /* --- Slide Control (Pagination) --- */
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

    /* --- Position Change & Status Timeline Logic --- */
    if (posForm) {
        posForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // 1. Generate Timestamp (Format: April 03, 2026 - 10:12 A.M.)
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                               .replace("AM", "A.M.").replace("PM", "P.M.");
            
            const fullTimestamp = `${dateStr} - ${timeStr}`;

            // 2. Update Status Timeline in View Modal
            if (statusTimelineBox && submissionTimestamp) {
                submissionTimestamp.innerText = fullTimestamp;
                statusTimelineBox.style.display = "block"; 
            }

            // 3. Update Approval Timeline Based on Selection
            const selectedPos = positionSelect.value;
            if (statusBanner) {
                statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> Pending - For ${selectedPos} Approval`;
            }

            if (timelineList) {
                timelineList.innerHTML = `
                    <div class="timeline-item">
                        <span>HR Evaluator</span> 
                        <span class="status-ok"><i class="fas fa-check-square"></i> Approved - Feb 18</span>
                    </div>
                    <div class="timeline-item">
                        <span>${selectedPos}</span> 
                        <span class="status-pending"><i class="fas fa-hourglass-half"></i> Pending</span>
                    </div>
                    <div class="timeline-item"><span>HR Head</span> <span>-</span></div>
                    <div class="timeline-item"><span>SD</span> <span>-</span></div>
                `;
            }

            alert("Success: The position change request has been logged.");
            closeAllModals();
        });
    }

    // Global Close Listeners
    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
});