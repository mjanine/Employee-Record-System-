document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // 1. DATA
    // --------------------------------------------------------
    const newEmployeeData = [
        {
            id: "001",
            name: "Dela Cruz, Juan",
            department: "College of Computer Studies",
            position: "Instructor",
            submitted: "02/12/2026",
            progress: "Stage 2 of 4",
            status: "pending-hr",
            statusLabel: "Pending - HR Evaluator",
            reviewedBy: "---",
            remarks: "Awaiting HR evaluation of submitted documents.",
            fileName: "CV_DelaCruz.pdf"
        },
        {
            id: "002",
            name: "Santos, Maria",
            department: "College of Business Administration",
            position: "Professor",
            submitted: "02/15/2026",
            progress: "Stage 1 of 4",
            status: "pending-hr",
            statusLabel: "Pending - Dept. Head",
            reviewedBy: "---",
            remarks: "Submitted for department head review.",
            fileName: "CV_Santos.pdf"
        },
        {
            id: "003",
            name: "Reyes, Ricardo",
            department: "College of Engineering",
            position: "Registrar",
            submitted: "02/10/2026",
            progress: "Completed",
            status: "approved",
            statusLabel: "Approved",
            reviewedBy: "HR Manager",
            remarks: "All requirements met. Application approved.",
            fileName: "CV_Reyes.pdf"
        },
        {
            id: "004",
            name: "Garcia, Ana",
            department: "College of Nursing",
            position: "Clinical Instructor",
            submitted: "03/01/2026",
            progress: "Stage 3 of 4",
            status: "rejected",
            statusLabel: "Rejected",
            reviewedBy: "HR Manager",
            remarks: "Incomplete licensure documents submitted.",
            fileName: "CV_Garcia.pdf"
        }
    ];

    const positionChangeData = [
        {
            id: "PC-001",
            name: "Bautista, Carlo",
            department: "College of Computer Studies",
            position: "Dean",
            submitted: "03/10/2026",
            progress: "Stage 1 of 2",
            status: "pending-hr",
            statusLabel: "Pending - HR Evaluator",
            reviewedBy: "---",
            remarks: "Pending HR review of position change request.",
            fileName: "Request_Bautista.pdf"
        },
        {
            id: "PC-002",
            name: "Mendoza, Liza",
            department: "College of Business Administration",
            position: "Department Head",
            submitted: "03/05/2026",
            progress: "Completed",
            status: "approved",
            statusLabel: "Approved",
            reviewedBy: "HR Manager",
            remarks: "Position change approved effective April 2026.",
            fileName: "Request_Mendoza.pdf"
        }
    ];

    // --------------------------------------------------------
    // 2. SELECTORS
    // --------------------------------------------------------
    const sidebar       = document.getElementById("sidebar");
    const logoToggle    = document.getElementById("logoToggle");
    const closeBtn      = document.getElementById("closeBtn");
    const searchInput   = document.getElementById("tableSearch");
    const tableBody     = document.getElementById("applicationTableBody");
    const viewModal     = document.getElementById("viewModal");
    const posModal      = document.getElementById("positionChangeModal");
    const posForm       = document.getElementById("positionChangeForm");
    const tabNew        = document.getElementById("tab-new");
    const tabPosition   = document.getElementById("tab-position");

    let activeData = newEmployeeData; // tracks current tab data
    let activeRecord = null;          // tracks currently opened modal record

    // --------------------------------------------------------
    // 3. SIDEBAR
    // --------------------------------------------------------
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn)   closeBtn.onclick   = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --------------------------------------------------------
    // 4. RENDER TABLE
    // --------------------------------------------------------
    function renderTable(data) {
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#888;padding:40px;">No records found.</td></tr>`;
            return;
        }

        data.forEach(record => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.position}</td>
                <td>${record.submitted}</td>
                <td>${record.progress}</td>
                <td><span class="status-pill ${record.status}">${record.statusLabel}</span></td>
                <td class="actions-cell">
                    <a href="#" class="view-link" data-id="${record.id}">View</a>
                    ${record.status !== "approved" && record.status !== "rejected" ? `
                    <div class="dropdown">
                        <button class="update-link">Update <i class="fas fa-caret-down"></i></button>
                        <div class="dropdown-content">
                            <a href="#" class="approve-option" data-id="${record.id}">Approve</a>
                            <a href="#" class="reject-option" data-id="${record.id}">Reject</a>
                        </div>
                    </div>` : ""}
                </td>
            `;
            tableBody.appendChild(tr);
        });

        attachTableEvents();
    }

    // --------------------------------------------------------
    // 5. TABLE EVENT LISTENERS
    // --------------------------------------------------------
    function attachTableEvents() {
        // View links
        tableBody.querySelectorAll(".view-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const id = e.target.getAttribute("data-id");
                const record = activeData.find(r => r.id === id);
                if (record) openViewModal(record);
            });
        });

        // Inline approve
        tableBody.querySelectorAll(".approve-option").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = e.target.getAttribute("data-id");
                updateRecordStatus(id, "approved", "Approved");
            });
        });

        // Inline reject
        tableBody.querySelectorAll(".reject-option").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = e.target.getAttribute("data-id");
                updateRecordStatus(id, "rejected", "Rejected");
            });
        });
    }

    // --------------------------------------------------------
    // 6. UPDATE RECORD STATUS
    // --------------------------------------------------------
    function updateRecordStatus(id, statusClass, statusLabel) {
        const record = activeData.find(r => r.id === id);
        if (!record) return;

        record.status      = statusClass;
        record.statusLabel = statusLabel;
        record.reviewedBy  = "HR Manager";
        record.remarks     = `${statusLabel} by HR Manager on ${new Date().toLocaleDateString()}`;

        renderTable(activeData);

        // If the modal is open for this record, update it live
        if (activeRecord && activeRecord.id === id) {
            populateModal(record);
        }
    }

    // --------------------------------------------------------
    // 7. VIEW MODAL
    // --------------------------------------------------------
    function openViewModal(record) {
        activeRecord = record;
        populateModal(record);
        viewModal.style.display = "flex";
    }

    function populateModal(record) {
        document.getElementById("modalFileName").innerText       = record.fileName;
        document.getElementById("modalSubmitDate").innerText     = record.submitted;
        document.getElementById("modalDepartment").innerText     = record.department;
        document.getElementById("modalPosition").innerText       = record.position;
        document.getElementById("modalProgress").innerText       = record.progress;
        document.getElementById("modalRemarks").innerText        = record.remarks;
        document.getElementById("modalReviewerText").innerHTML   = `<small>Reviewed by: ${record.reviewedBy}</small>`;
        document.getElementById("modalStatusContainer").innerHTML =
            `<span class="status-pill ${record.status}">${record.statusLabel}</span>`;
        document.querySelector(".pdf-placeholder").innerHTML =
            `<i class="fas fa-file-pdf"></i><p>${record.fileName}</p>`;

        const isFinal = record.status === "approved" || record.status === "rejected";
        document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";
    }

    document.getElementById("closeViewModal")?.addEventListener("click", closeAllModals);

    // Modal approve/reject buttons
    document.querySelector(".btn-approve")?.addEventListener("click", () => {
        if (!activeRecord) return;
        updateRecordStatus(activeRecord.id, "approved", "Approved");
    });

    document.querySelector(".btn-reject")?.addEventListener("click", () => {
        if (!activeRecord) return;
        updateRecordStatus(activeRecord.id, "rejected", "Rejected");
    });

    // --------------------------------------------------------
    // 8. TABS
    // --------------------------------------------------------
    tabNew.addEventListener("click", () => {
        tabNew.classList.add("active");
        tabPosition.classList.remove("active");
        activeData = newEmployeeData;
        searchInput.value = "";
        renderTable(activeData);
    });

    tabPosition.addEventListener("click", () => {
        tabPosition.classList.add("active");
        tabNew.classList.remove("active");
        activeData = positionChangeData;
        searchInput.value = "";
        renderTable(activeData);
        posModal.style.display = "flex";
    });

    // --------------------------------------------------------
    // 9. SEARCH
    // --------------------------------------------------------
    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        tableBody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
        });
    });

    // --------------------------------------------------------
    // 10. POSITION CHANGE FORM
    // --------------------------------------------------------
    if (posForm) {
        posForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nameInput = posForm.querySelector("input[type='text']:not([disabled])");
            const selectInput = posForm.querySelector("select");
            const dateInput = posForm.querySelector("input[type='date']");
            const reasonInput = posForm.querySelector("textarea");

            const newRecord = {
                id: `PC-00${positionChangeData.length + 1}`,
                name: nameInput?.value || "New Employee",
                department: "Pending",
                position: selectInput?.value || "Pending",
                submitted: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
                progress: "Stage 1 of 2",
                status: "pending-hr",
                statusLabel: "Pending - HR Evaluator",
                reviewedBy: "---",
                remarks: reasonInput?.value || "Awaiting review.",
                fileName: "No Document Attached"
            };

            positionChangeData.push(newRecord);

            // Switch to position change tab and show new record
            tabPosition.classList.add("active");
            tabNew.classList.remove("active");
            activeData = positionChangeData;
            renderTable(activeData);

            posForm.reset();
            closeAllModals();
        });
    }

    document.getElementById("cancelRequest")?.addEventListener("click", closeAllModals);

    // --------------------------------------------------------
    // 11. CLOSE MODALS
    // --------------------------------------------------------
    function closeAllModals() {
        [viewModal, posModal].forEach(m => { if (m) m.style.display = "none"; });
    }

    window.addEventListener("click", (e) => {
        if (e.target === viewModal || e.target === posModal) closeAllModals();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });

    // --------------------------------------------------------
    // 12. INITIAL RENDER
    // --------------------------------------------------------
    renderTable(newEmployeeData);
});