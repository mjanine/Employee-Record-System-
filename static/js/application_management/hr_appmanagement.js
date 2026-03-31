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
    const notificationContainer = document.getElementById("notification-container");

    let activeData = newEmployeeData; // tracks current tab data
    let activeRecord = null;          // tracks currently opened modal record

    // --------------------------------------------------------
    // 3. NOTIFICATION SYSTEM
    // --------------------------------------------------------
    function showNotification(message, type) {
        if (!notificationContainer) return;

        const notification = document.createElement("div");
        
        // Use 'success' for approved and 'error' for rejected (based on CSS)
        const statusClass = type === "approved" ? "success" : "error";
        notification.className = `notification ${statusClass}`;
        
        notification.innerHTML = `
            <span>${message}</span>
            <i class="fas fa-times" style="cursor:pointer; margin-left:10px;" onclick="this.parentElement.remove()"></i>
        `;

        notificationContainer.appendChild(notification);

        // Auto-remove notification after 4 seconds
        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateX(20px)";
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    // --------------------------------------------------------
    // 4. SIDEBAR LOGIC
    // --------------------------------------------------------
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn)   closeBtn.onclick   = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --------------------------------------------------------
    // 5. RENDER TABLE
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

    function attachTableEvents() {
        tableBody.querySelectorAll(".view-link").forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const id = e.target.getAttribute("data-id");
                const record = activeData.find(r => r.id === id);
                if (record) openViewModal(record);
            };
        });

        tableBody.querySelectorAll(".approve-option").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                updateRecordStatus(e.target.getAttribute("data-id"), "approved", "Approved");
            };
        });

        tableBody.querySelectorAll(".reject-option").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                updateRecordStatus(e.target.getAttribute("data-id"), "rejected", "Rejected");
            };
        });
    }

    // --------------------------------------------------------
    // 6. UPDATE STATUS & TRIGGER NOTIFICATION
    // --------------------------------------------------------
    function updateRecordStatus(id, statusClass, statusLabel) {
        const record = activeData.find(r => r.id === id);
        if (!record) return;

        record.status      = statusClass;
        record.statusLabel = statusLabel;
        record.reviewedBy  = "HR Manager";
        record.remarks     = `${statusLabel} by HR Manager on ${new Date().toLocaleDateString()}`;

        // Re-render the UI
        renderTable(activeData);
        if (activeRecord && activeRecord.id === id) populateModal(record);

        // Show Notification
        const message = `Application ID: ${id} (${record.name}) has been ${statusLabel.toLowerCase()}.`;
        showNotification(message, statusClass);
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
        document.getElementById("modalRemarks").innerText         = record.remarks;
        document.getElementById("modalReviewerText").innerHTML   = `<small>Reviewed by: ${record.reviewedBy}</small>`;
        document.getElementById("modalStatusContainer").innerHTML = `<span class="status-pill ${record.status}">${record.statusLabel}</span>`;
        
        const isFinal = record.status === "approved" || record.status === "rejected";
        document.getElementById("modalActions").style.display = isFinal ? "none" : "flex";
    }

    document.getElementById("closeViewModal")?.addEventListener("click", closeAllModals);

    document.querySelector(".btn-approve")?.addEventListener("click", () => {
        if (activeRecord) updateRecordStatus(activeRecord.id, "approved", "Approved");
    });

    document.querySelector(".btn-reject")?.addEventListener("click", () => {
        if (activeRecord) updateRecordStatus(activeRecord.id, "rejected", "Rejected");
    });

    // --------------------------------------------------------
    // 8. TABS & SEARCH
    // --------------------------------------------------------
    tabNew.onclick = () => {
        tabNew.classList.add("active");
        tabPosition.classList.remove("active");
        activeData = newEmployeeData;
        renderTable(activeData);
    };

    tabPosition.onclick = () => {
        tabPosition.classList.add("active");
        tabNew.classList.remove("active");
        activeData = positionChangeData;
        renderTable(activeData);
        posModal.style.display = "flex";
    };

    searchInput.onkeyup = () => {
        const filter = searchInput.value.toLowerCase();
        tableBody.querySelectorAll("tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
        });
    };

    // --------------------------------------------------------
    // 9. MODAL HELPERS
    // --------------------------------------------------------
    function closeAllModals() {
        [viewModal, posModal].forEach(m => { if (m) m.style.display = "none"; });
        activeRecord = null;
    }

    window.onclick = (e) => { if (e.target === viewModal || e.target === posModal) closeAllModals(); };
    document.onkeydown = (e) => { if (e.key === "Escape") closeAllModals(); };

    // Initial Render
    renderTable(newEmployeeData);
});