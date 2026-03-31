document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    const searchInput = document.getElementById("tableSearch");
    const tableBody = document.getElementById("applicationTableBody");

    const viewModal = document.getElementById("viewModal");
    const posModal = document.getElementById("positionChangeModal");
    const posForm = document.getElementById("positionChangeForm");

    const tabNew = document.getElementById("tab-new");
    const tabPosition = document.getElementById("tab-position");

    // --- Sidebar Tooltips ---
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    // --- Sidebar Toggle ---
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --- Search ---
    if (searchInput && tableBody) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            tableBody.querySelectorAll("tr").forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
            });
        });
    }

    // --- Tab Switching ---
    if (tabNew && tabPosition) {
        tabNew.onclick = () => {
            tabNew.classList.add("active");
            tabPosition.classList.remove("active");
        };

        tabPosition.onclick = () => {
            tabPosition.classList.add("active");
            tabNew.classList.remove("active");
            openModal(posModal);
        };
    }

    // --- Modal Helpers ---
    function openModal(modal) {
        if (modal) modal.style.display = "flex";
    }

    function closeAllModals() {
        [viewModal, posModal].forEach(m => { if (m) m.style.display = "none"; });
    }

    // --- View Modal Triggers ---
    document.querySelectorAll(".view-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            // Get row data
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");

            document.getElementById("modalSubmitDate").innerText     = cells[4]?.innerText || "---";
            document.getElementById("modalDepartment").innerText     = cells[2]?.innerText || "---";
            document.getElementById("modalPosition").innerText       = cells[3]?.innerText || "---";
            document.getElementById("modalProgress").innerText       = cells[5]?.innerText || "---";
            document.getElementById("modalRemarks").innerText        = "Awaiting review.";
            document.getElementById("modalFileName").innerText       = "Document.pdf";

            // Status pill
            const statusPill = cells[6]?.querySelector(".status-pill");
            document.getElementById("modalStatusContainer").innerHTML = statusPill
                ? statusPill.outerHTML
                : "<span>---</span>";

            document.getElementById("modalReviewerText").innerHTML = "<small>Reviewed by: ---</small>";

            // Show/hide action buttons based on status
            const statusText = statusPill?.innerText || "";
            const isFinal = statusText === "Approved" || statusText === "Rejected";
            document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";

            openModal(viewModal);
        });
    });

    // --- Close View Modal ---
    document.getElementById("closeViewModal")?.addEventListener("click", closeAllModals);

    // --- Modal Approve / Reject ---
    document.querySelector(".btn-approve")?.addEventListener("click", () => {
        document.getElementById("modalStatusContainer").innerHTML =
            '<span class="status-pill approved">Approved</span>';
        document.getElementById("modalActions").style.display = "none";
        document.getElementById("modalRemarks").innerText =
            `Approved by HR on ${new Date().toLocaleDateString()}`;
    });

    document.querySelector(".btn-reject")?.addEventListener("click", () => {
        document.getElementById("modalStatusContainer").innerHTML =
            '<span class="status-pill rejected">Rejected</span>';
        document.getElementById("modalActions").style.display = "none";
        document.getElementById("modalRemarks").innerText =
            `Rejected by HR on ${new Date().toLocaleDateString()}`;
    });

    // --- Position Change Form Submit ---
    if (posForm) {
        posForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Position change request logged successfully.");
            closeAllModals();
        });
    }

    // --- Cancel Button in Pos Modal ---
    document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

    // --- Close on backdrop click or Escape ---
    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
});