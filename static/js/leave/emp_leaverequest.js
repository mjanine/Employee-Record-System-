/* emp_leaverequest.js */
const empInfo = { name: "John Smith" };

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const menuItems = document.querySelectorAll(".menu-item");

    // Initialize Tooltip Labels
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText);
        }
    });

    renderLeaveTable("Active");

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderLeaveTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderLeaveTable("History");
    };

    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderLeaveTable(filter) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('leaveRowTemplate');
    body.innerHTML = "";
    
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const myLeaves = leaveData.filter(l => l.name === empInfo.name);

    myLeaves.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        let displayStatus = leave.status;
        let displayReviewer = leave.reviewedBy || "---";

        if (displayStatus.includes("- By Head")) {
            displayStatus = "Pending";
            displayReviewer = "---"; 
        }

        if ((filter === "Active" && !isFinal) || (filter === "History" && isFinal)) {
            const clone = template.content.cloneNode(true);
            const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');

            // Fill row data
            clone.querySelector('.col-filed').innerText = leave.dateFiled;
            clone.querySelector('.col-type').innerHTML = `<strong>${leave.leaveType}</strong>`;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${displayStatus}</span>`;
            clone.querySelector('.col-reviewer').innerText = displayReviewer;
            
            // Set action click
            clone.querySelector('.action-link').onclick = () => openViewModalByID(leave.id);

            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No leave records found.</td></tr>`;
    }
}

function openViewModalByID(id) {
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const data = leaveData.find(l => l.id === id);
    if (!data) return;
    
    // Fill Modal Data
    document.getElementById('modalFileName').innerText = data.fileName || (data.leaveType + ".pdf");
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime || '---'}`;
    document.getElementById('modalReason').innerText = data.reason || "No reason provided.";
    
    let displayStatus = data.status;
    let remarks = "";

    if (displayStatus.includes("- By Head")) {
        displayStatus = "Pending";
        remarks = "Your application is currently being reviewed by the Department Head and HR.";
    } else if (displayStatus === "Pending") {
        remarks = "Awaiting initial review.";
    } else {
        remarks = data.reviewRemarks || `This request has been finalized by ${data.reviewedBy}.`;
    }

    const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${displayStatus}</span>`;
    document.getElementById('modalRemarks').innerText = remarks;
    
    // Preview Logic
    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
    } else {
        preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>No document attached</p>`;
    }

    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}